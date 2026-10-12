import type { Operator, ReturnDetailsWindows } from '@/types/operator';
import { chainPulseClient, type ChainPulseSharePrice } from './chain-pulse-client';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import {
  calculateReturnDetails,
  adjustReturnDetailsForStakeRatio,
  adjustReturnDetailsWindowsForStakeRatio,
  type PricePoint,
  type ReturnDetails,
} from '@/lib/apy';

// Chain-pulse stores share_price as Perquintill (shares-per-stake), which
// *decreases* over time.  APY calculations expect stake-per-share (increasing).
// Derive it from total_stake / total_shares available on every row.
// Use BigInt arithmetic with 10^18 scaling to avoid floating-point precision
// loss on large shanon-denominated values.
const SCALE = 10n ** 18n;
const toPricePoint = (row?: ChainPulseSharePrice | null): PricePoint | null => {
  if (!row?.total_shares || !row?.total_stake || !row?.timestamp) return null;
  try {
    const shares = BigInt(row.total_shares);
    if (shares <= 0n) return null;
    const stake = BigInt(row.total_stake);
    const date = new Date(row.timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return {
      price: Number((stake * SCALE) / shares) / 1e18,
      date,
    };
  } catch {
    return null;
  }
};

const mapStatus = (status: string): 'active' | 'inactive' | 'slashed' | 'degraded' => {
  switch (status) {
    case 'registered':
      return 'active';
    case 'slashed':
    case 'pending_slash':
      return 'slashed';
    case 'deregistered':
    case 'deactivated':
      return 'inactive';
    default:
      return 'degraded';
  }
};

const safeBigInt = (val?: string | null): bigint => {
  if (!val) return 0n;
  try {
    return BigInt(val);
  } catch {
    return 0n;
  }
};

const mapChainPulseOperator = (
  op: Awaited<ReturnType<typeof chainPulseClient.getOperators>>[number],
): Operator => {
  const stakeShannons = safeBigInt(op.total_stake);
  const storageShannons = safeBigInt(op.total_storage_fee_deposit);
  return {
    id: op.id,
    name: `Operator ${op.id}`,
    domainId: op.domain_id,
    domainName: 'Auto EVM',
    ownerAccount: op.owner_account,
    nominationTax: typeof op.nomination_tax === 'number' ? op.nomination_tax : 0,
    minimumNominatorStake: shannonsToAi3(safeBigInt(op.minimum_nominator_stake)),
    status: mapStatus(op.status),
    totalStaked: shannonsToAi3(stakeShannons),
    totalStorageFund: shannonsToAi3(storageShannons),
    totalPoolValue: shannonsToAi3(stakeShannons + storageShannons),
    nominatorCount: typeof op.nominator_count === 'number' ? op.nominator_count : 0,
  };
};

export const operatorService = async () => {
  const getAllOperators = async (): Promise<Operator[]> => {
    try {
      const raw = await chainPulseClient.getOperators();
      return Array.isArray(raw) ? raw.map(mapChainPulseOperator) : [];
    } catch (err) {
      console.warn('Failed to fetch operators:', err);
      return [];
    }
  };

  const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
    if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
      return null;
    }
    try {
      const raw = await chainPulseClient.getOperator(operatorId.trim());
      return raw ? mapChainPulseOperator(raw) : null;
    } catch (err) {
      console.warn('Failed to fetch operator', operatorId, err);
      return null;
    }
  };

  const estimateOperatorReturnDetails = async (
    operatorId: string,
    lookbackDays: number,
  ): Promise<ReturnDetails | null> => {
    if (
      !operatorId ||
      typeof operatorId !== 'string' ||
      operatorId.trim().length === 0 ||
      typeof lookbackDays !== 'number' ||
      !Number.isFinite(lookbackDays) ||
      lookbackDays <= 0
    ) {
      return null;
    }
    const cleanId = operatorId.trim();
    try {
      const latestRows = await chainPulseClient.getSharePrices(cleanId, { limit: 1 });
      if (!latestRows?.length) return null;

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const sinceISO = new Date(Date.now() - lookbackDays * MS_PER_DAY).toISOString();
      const earliestRows = await chainPulseClient.getSharePrices(cleanId, {
        since: sinceISO,
        limit: 1,
      });
      if (!earliestRows?.length) return null;

      const startPrice = toPricePoint(earliestRows[0]);
      const endPrice = toPricePoint(latestRows[0]);
      if (!startPrice || !endPrice) return null;

      const returnDetails = calculateReturnDetails(startPrice, endPrice);
      return returnDetails ? adjustReturnDetailsForStakeRatio(returnDetails) : null;
    } catch (err) {
      console.warn('Failed to estimate APY for operator', operatorId, err);
      return null;
    }
  };

  const estimateOperatorReturnDetailsWindows = async (
    operatorId: string,
  ): Promise<ReturnDetailsWindows> => {
    if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
      return {};
    }
    const cleanId = operatorId.trim();
    try {
      const latestRows = await chainPulseClient.getSharePrices(cleanId, { limit: 1 });
      if (!latestRows?.length) return {};

      const endPrice = toPricePoint(latestRows[0]);
      if (!endPrice) return {};

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const endTs = endPrice.date.getTime();
      type WindowKey = keyof ReturnDetailsWindows;
      const windows: Array<{ key: WindowKey; days: number }> = [
        { key: 'd1', days: 1 },
        { key: 'd3', days: 3 },
        { key: 'd7', days: 7 },
        { key: 'd30', days: 30 },
      ];

      const cutoffDates = windows.map(w => new Date(endTs - w.days * MS_PER_DAY));
      const untilPromises = cutoffDates.map(cutoff =>
        chainPulseClient.getSharePrices(cleanId, { until: cutoff.toISOString(), limit: 1 }),
      );

      const results = await Promise.allSettled(untilPromises);

      const details: ReturnDetailsWindows = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value?.length) {
          const startPrice = toPricePoint(res.value[0]);
          if (!startPrice) return;
          const requestedDays = windows[idx].days;
          const actualDays = (endTs - startPrice.date.getTime()) / MS_PER_DAY;
          if (actualDays + 1e-9 < requestedDays) return;

          const rd = calculateReturnDetails(startPrice, endPrice);
          if (rd) {
            details[windows[idx].key] = rd;
          }
        }
      });

      return adjustReturnDetailsWindowsForStakeRatio(details) as ReturnDetailsWindows;
    } catch (err) {
      console.warn('Failed to estimate APY windows for operator', operatorId, err);
      return {};
    }
  };

  return {
    getAllOperators,
    getOperatorById,
    estimateOperatorReturnDetails,
    estimateOperatorReturnDetailsWindows,
    getOperatorWithApy: async (
      operatorId: string,
      lookbackDays: number,
    ): Promise<Operator | null> => {
      if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
        return null;
      }
      const op = await getOperatorById(operatorId);
      if (!op) return null;
      const returnDetails = await estimateOperatorReturnDetails(operatorId, lookbackDays);
      return returnDetails ? { ...op, estimatedReturnDetails: returnDetails } : op;
    },
    getOperatorWithApyWindows: async (operatorId: string): Promise<Operator | null> => {
      if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
        return null;
      }
      const op = await getOperatorById(operatorId);
      if (!op) return null;
      const windows = await estimateOperatorReturnDetailsWindows(operatorId);
      const d1 = windows.d1 ?? null;
      return {
        ...op,
        ...(d1 ? { estimatedReturnDetails: d1 } : {}),
        estimatedReturnDetailsWindows: windows,
      };
    },
  };
};
