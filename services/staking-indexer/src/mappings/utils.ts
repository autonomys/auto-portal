import { EventRecord, stringify } from '@autonomys/auto-utils';
import { createHash } from 'crypto';
import { SHARES_CALCULATION_MULTIPLIER, ZERO_BIGINT } from './constants';
import * as db from './db';
import { Cache } from './db';
import { EpochTransition } from './types';

// -----------------------------
// Deep find utility
// -----------------------------

export const deepFindByKey = (obj: any, keys: string[]): any => {
  try {
    if (!obj || typeof obj !== 'object') return undefined;
    const stack: any[] = [obj];
    const seen = new Set<any>();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
      seen.add(cur);
      for (const k of Object.keys(cur)) {
        if (keys.includes(k)) return cur[k];
        const v = cur[k];
        if (v && typeof v === 'object') stack.push(v);
      }
    }
  } catch {}
  return undefined;
};

// -----------------------------
// Versioned type utilities
// -----------------------------

export const unwrapVersioned = <T = any>(input: any): T => {
  // Recursively unwrap { V0: {...} } / { V1: {...} }-style objects
  if (!input || typeof input !== 'object') return input as T;
  const keys = Object.keys(input);
  if (keys.length === 1 && /^V\d+$/i.test(keys[0])) {
    return unwrapVersioned<T>(input[keys[0]]);
  }
  return input as T;
};

export const coalesce = <T>(...candidates: Array<T | undefined | null>): T | undefined => {
  for (const c of candidates) if (c !== undefined && c !== null) return c as T;
  return undefined;
};

export const extractSealedHeaderFromArgs = (args: any): any => {
  const sealedHeaderContainer = coalesce<any>(
    args?.opaque_bundle?.sealedHeader,
    args?.opaque_bundle?.sealed_header,
    args?.opaqueBundle?.sealedHeader,
    args?.opaqueBundle?.sealed_header,
    args?.bundle?.sealedHeader,
    args?.bundle?.sealed_header,
    args?.sealedHeader,
    args?.sealed_header,
  );
  const deep = !sealedHeaderContainer
    ? deepFindByKey(args, ['sealedHeader', 'sealed_header'])
    : undefined;
  const target = sealedHeaderContainer ?? deep;
  if (!target) return undefined;
  const sealedHeader = unwrapVersioned<any>(target);
  // Some chains expose { header: {...} } while others yield header fields directly
  return sealedHeader?.header ?? sealedHeader;
};

export const extractReceiptNumbers = (
  receiptInput: any,
): {
  domainBlockNumber?: bigint;
  consensusBlockNumber?: bigint;
} => {
  const base = unwrapVersioned<any>(receiptInput) ?? {};
  const r = base?.receipt ? unwrapVersioned<any>(base.receipt) : base;
  const dbn = coalesce<number | string>(r.domainBlockNumber, r.domain_block_number);
  const cbn = coalesce<number | string>(r.consensusBlockNumber, r.consensus_block_number);
  return {
    domainBlockNumber: dbn !== undefined ? BigInt(dbn.toString()) : undefined,
    consensusBlockNumber: cbn !== undefined ? BigInt(cbn.toString()) : undefined,
  };
};

export const extractProofOfElection = (
  header: any,
): {
  domainId?: string;
  operatorId?: string;
} => {
  if (!header) return {};
  const poeContainer =
    header.proofOfElection ??
    header.proof_of_election ??
    deepFindByKey(header, ['proofOfElection', 'proof_of_election']) ??
    {};
  const domainId = (poeContainer?.domainId ?? poeContainer?.domain_id)?.toString();
  const operatorId = (poeContainer?.operatorId ?? poeContainer?.operator_id)?.toString();
  return { domainId, operatorId };
};

export const getNominationId = (address: string, domainId: string, operatorId: string): string =>
  address + '-' + domainId + '-' + operatorId;

export const createHashId = (data: any): string =>
  createHash('sha256').update(stringify(data)).digest('hex');

export const findOneExtrinsicEvent = (events: EventRecord[], section: string, method: string) => {
  return events.find(
    e => e.phase.isApplyExtrinsic && e.event.section === section && e.event.method === method,
  );
};

export const groupEventsFromBatchAll = (events: EventRecord[]): EventRecord[][] => {
  const result: EventRecord[][] = [];
  let currentGroup: EventRecord[] = [];

  for (const event of events) {
    if (event.event.section === 'utility' && event.event.method === 'ItemCompleted') {
      if (currentGroup.length > 0) {
        result.push(currentGroup);
        currentGroup = [];
      }
    } else currentGroup.push(event);
  }

  if (currentGroup.length > 0) result.push(currentGroup);

  return result;
};

/**
 * Detects epoch transitions by comparing current epoch indices with parent block epoch indices
 * @param currentDomainStakingSummary - Current domain staking summary entries
 * @param parentBlockApi - API instance for querying parent block data
 * @param height - Current block height for logging
 * @returns Object containing epoch transitions and domain epoch map
 */
export const detectEpochTransitions = async (
  currentDomainStakingSummary: any[],
  parentBlockApi: any,
  height: bigint,
): Promise<{
  epochTransitions: EpochTransition[];
  domainEpochMap: Map<string, number>;
}> => {
  // Extract domain IDs and current epochs from the current block
  const domainIds = currentDomainStakingSummary.map(data => (data[0].toPrimitive() as any)[0]);
  const currentEpochs = currentDomainStakingSummary.map(
    data => (data[1].toPrimitive() as any).currentEpochIndex,
  );

  // Build domainEpochMap while we're already iterating
  const domainEpochMap = new Map<string, number>();
  domainIds.forEach((domainId, index) => {
    domainEpochMap.set(domainId.toString(), currentEpochs[index]);
  });

  // Query parent block for epoch indices of each domain
  const parentEpochPromises = domainIds.map(async domainId => {
    return parentBlockApi.query.domains.domainStakingSummary(domainId);
  });

  const parentEpochs = await Promise.all(parentEpochPromises);
  const parentSummaries = parentEpochs.map(result => {
    const primitive = result.toPrimitive() as any;
    return primitive ?? null;
  });
  const parentEpochValues = parentSummaries.map(summary => {
    return summary ? summary.currentEpochIndex : null;
  });

  // Check for epoch transitions
  const epochTransitions: EpochTransition[] = [];

  domainIds.forEach((domainId, index) => {
    const currentEpoch = currentEpochs[index];
    const parentEpoch = parentEpochValues[index];
    const parentSummary = parentSummaries[index];

    if (parentEpoch !== null && parentEpoch < currentEpoch) {
      logger.info(
        `BLOCK ${height} Epoch transition detected for domain ${domainId}: ${parentEpoch} -> ${currentEpoch}`,
      );
      epochTransitions.push({
        domainId,
        parentEpoch,
        currentEpoch,
        parentSummary,
      });
    }
  });

  return { epochTransitions, domainEpochMap };
};

/**
 * Derives operator epoch share prices for each epoch transition
 * @param epochTransitions - Array of detected epoch transitions
 * @param operators - Array of current operators
 * @param blockTimestamp - Current block timestamp
 * @param height - Current block height
 * @returns Array of OperatorEpochSharePrice entities to be cached and stored in the database
 */

export const deriveOperatorEpochSharePrices = (
  epochTransitions: EpochTransition[],
  operators: any[],
  blockTimestamp: Date,
  height: bigint,
) => {
  // Future improvement is to make this parallel
  const operatorEpochSharePrices: any[] = [];

  for (const { domainId, parentEpoch, parentSummary } of epochTransitions) {
    // Map of operatorId => reward for the epoch that just ended
    const rewardsMap: Record<string, string> = (parentSummary?.currentEpochRewards as any) ?? {};

    // Filter operators that currently belong to this domain
    const operatorsInDomain = operators.filter(
      op => op.operatorDetails.currentDomainId.toString() === domainId,
    );

    for (const operator of operatorsInDomain) {
      const operatorId = operator.operatorId.toString();

      const reward = BigInt(rewardsMap[operatorId] ?? 0);
      const nominationTax = BigInt(operator.operatorDetails.nominationTax ?? 0);

      // taxedReward = reward - nominationTax * reward / 100
      const taxedReward = reward - (reward * nominationTax) / BigInt(100);
      const totalShares = operator.operatorDetails.currentTotalShares;

      if (totalShares === ZERO_BIGINT) continue; // skip operators with no shares

      const totalStake = operator.operatorDetails.currentTotalStake;

      const sharePrice = ((totalStake + taxedReward) * SHARES_CALCULATION_MULTIPLIER) / totalShares;

      operatorEpochSharePrices.push({
        operatorId,
        domainId,
        parentEpoch,
        sharePrice,
        totalStake,
        totalShares,
        blockTimestamp,
        height,
      });
    }
  }

  return operatorEpochSharePrices;
};

export const groupNominatorEvents = (nominatorEvents: any[]) => {
  const nominatorEventsMap = new Map<
    string,
    {
      operatorId: string;
      address: string;
      eventIds: string[];
      extrinsicIds: string[];
      blockHeights: string[];
    }
  >();

  nominatorEvents.forEach(eventStr => {
    const event = JSON.parse(eventStr);

    if (!nominatorEventsMap.has(event.operatorId)) {
      nominatorEventsMap.set(event.operatorId, {
        operatorId: event.operatorId,
        address: event.address,
        eventIds: [],
        extrinsicIds: [],
        blockHeights: [],
      });
    }

    const entry = nominatorEventsMap.get(event.operatorId)!;
    entry.eventIds.push(event.eventId);
    entry.extrinsicIds.push(event.extrinsicId);
    entry.blockHeights.push(event.blockHeight);
  });

  return nominatorEventsMap;
};

export const processNominatorDepositEvents = async (
  nominatorEventsMap: Map<string, any>,
  api: any,
  blockTimestamp: Date,
  cache: Cache,
  height: bigint,
): Promise<any[]> => {
  const depositsEntries = await Promise.all(
    [...nominatorEventsMap.values()].map(async (d: any) => {
      const res = await api.query.domains.deposits(Number(d.operatorId), d.address.toString());
      const result = res.toHuman() as any;
      return {
        id: createHashId(result),
        address: d.address,
        operatorId: d.operatorId,
        domainId: result.pending.effectiveDomainEpoch[0].toString(),
        knownShares: BigInt(result.known.shares.toString().replace(/,/g, '')),
        knownStorageFeeDeposit: BigInt(result.known.storageFeeDeposit.toString().replace(/,/g, '')),
        pendingAmount: BigInt(result.pending.amount.toString().replace(/,/g, '')),
        pendingStorageFeeDeposit: BigInt(
          result.pending.storageFeeDeposit.toString().replace(/,/g, ''),
        ),
        pendingEffectiveDomainEpoch: BigInt(
          result.pending.effectiveDomainEpoch[1].toString().replace(/,/g, ''),
        ),
        eventIds: JSON.stringify(d.eventIds),
        extrinsicIds: JSON.stringify(d.extrinsicIds),
        timestamp: blockTimestamp,
        blockHeights: JSON.stringify(d.blockHeights),
      };
    }),
  );

  depositsEntries.forEach(d => {
    cache.nominatorDeposit.push(
      db.createNominatorDeposit(
        d.id,
        d.address,
        d.operatorId,
        d.domainId,
        d.knownShares,
        d.knownStorageFeeDeposit,
        d.pendingAmount,
        d.pendingStorageFeeDeposit,
        d.pendingEffectiveDomainEpoch,
        d.extrinsicIds,
        d.eventIds,
        d.timestamp,
        d.blockHeights,
        height,
        false,
      ),
    );
  });
  return depositsEntries;
};

export const processWithdrawalEvents = async (
  nominatorEventsMap: Map<string, any>,
  domainId: string,
  api: any,
  blockTimestamp: Date,
  cache: Cache,
  height: bigint,
): Promise<any[]> => {
  const withdrawalsEntries = await Promise.all(
    [...nominatorEventsMap.values()].map(async d => {
      const res = await api.query.domains.withdrawals(Number(d.operatorId), d.address.toString());
      const result = res.toHuman() as any;
      logger.info(`Withdrawals result: ${JSON.stringify(result)}`);
      return {
        id: createHashId(result),
        address: d.address,
        operatorId: d.operatorId,
        domainId: domainId,
        totalWithdrawalAmount: BigInt(result.totalWithdrawalAmount.toString().replace(/,/g, '')),
        totalStorageFeeWithdrawal: BigInt(
          result.totalStorageFeeWithdrawal.toString().replace(/,/g, ''),
        ),
        // Detailed withdrawals information
        withdrawalsJson: stringify(result.withdrawals ?? []),
        totalPendingWithdrawals: BigInt((result.withdrawals ?? []).length),

        // In-shares (pending) withdrawal details
        domainEpoch: BigInt(result.withdrawalInShares.domainEpoch[1].toString().replace(/,/g, '')),
        unlockAtConfirmedDomainBlockNumber: BigInt(
          result.withdrawalInShares.unlockAtConfirmedDomainBlockNumber.toString().replace(/,/g, ''),
        ),
        shares: BigInt(result.withdrawalInShares.shares.toString().replace(/,/g, '')),
        storageFeeRefund: BigInt(
          result.withdrawalInShares.storageFeeRefund.toString().replace(/,/g, ''),
        ),

        eventIds: JSON.stringify(d.eventIds),
        extrinsicIds: JSON.stringify(d.extrinsicIds),
        blockHeights: JSON.stringify(d.blockHeights),
        timestamp: blockTimestamp,
        blockHeight: height,
      };
    }),
  );

  // Store each withdrawal entry as a NominatorWithdrawal entity
  withdrawalsEntries.forEach(w => {
    cache.nominatorWithdrawal.push(
      db.createNominatorWithdrawal(
        w.id,
        w.address,
        w.operatorId,
        w.domainId,
        w.shares, // withdrawalInSharesAmount (shares)
        w.storageFeeRefund, // withdrawalInSharesStorageFeeRefund
        w.domainEpoch.toString(),
        w.unlockAtConfirmedDomainBlockNumber,
        w.totalWithdrawalAmount,
        w.totalStorageFeeWithdrawal,
        w.withdrawalsJson,
        w.totalPendingWithdrawals,
        w.timestamp,
        w.blockHeight,
        w.eventIds,
        w.extrinsicIds,
        w.blockHeights,
        false,
      ),
    );
  });
  return withdrawalsEntries;
};

/**
 * Creates a map of operatorId to domainId from operators array
 * @param operators - Array of operators
 * @returns Map of operatorId to domainId
 */
export const createOperatorDomainMap = (operators: any[]): Map<string, string> => {
  const operatorDomainMap = new Map<string, string>();
  operators.forEach(operator => {
    operatorDomainMap.set(
      operator.operatorId.toString(),
      operator.operatorDetails.currentDomainId.toString(),
    );
  });
  return operatorDomainMap;
};
