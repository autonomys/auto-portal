import type { Operator, ReturnDetailsWindows } from '@/types/operator';
import { chainPulseClient, type ChainPulseSharePrice } from './chain-pulse-client';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import {
  calculateReturnDetails,
  adjustReturnDetailsWindowsForStakeRatio,
  type PricePoint,
} from '@/lib/apy';

// Chain-pulse stores share_price as Perquintill (shares-per-stake), which
// *decreases* over time.  APY calculations expect stake-per-share (increasing).
// Derive it from total_stake / total_shares available on every row.
// Use BigInt arithmetic with 10^18 scaling to avoid floating-point precision
// loss on large shanon-denominated values.
const SCALE = 10n ** 18n;
const toPricePoint = (row: ChainPulseSharePrice): PricePoint | null => {
  const shares = BigInt(row.total_shares);
  if (shares <= 0n) return null;
  return {
    price: Number((BigInt(row.total_stake) * SCALE) / shares) / 1e18,
    date: new Date(row.timestamp),
  };
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

const mapChainPulseOperator = (
  op: Awaited<ReturnType<typeof chainPulseClient.getOperators>>[number],
): Operator => {
  const stakeShannons = BigInt(op.total_stake);
  const storageShannons = BigInt(op.total_storage_fee_deposit);
  return {
    id: op.id,
    name: `Operator ${op.id}`,
    domainId: op.domain_id,
    domainName: 'Auto EVM',
    ownerAccount: op.owner_account,
    nominationTax: op.nomination_tax,
    minimumNominatorStake: shannonsToAi3(BigInt(op.minimum_nominator_stake)),
    status: mapStatus(op.status),
    totalStaked: shannonsToAi3(stakeShannons),
    totalStorageFund: shannonsToAi3(storageShannons),
    totalPoolValue: shannonsToAi3(stakeShannons + storageShannons),
    nominatorCount: op.nominator_count,
  };
};

export const operatorService = async () => {
  const getAllOperators = async (): Promise<Operator[]> => {
    const raw = await chainPulseClient.getOperators();
    return raw.map(mapChainPulseOperator);
  };

  const estimateOperatorReturnDetailsWindows = async (
    operatorId: string,
  ): Promise<ReturnDetailsWindows> => {
    try {
      const latestRows = await chainPulseClient.getSharePrices(operatorId, { limit: 1 });
      if (!latestRows.length) return {};

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
        chainPulseClient.getSharePrices(operatorId, { until: cutoff.toISOString(), limit: 1 }),
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
    estimateOperatorReturnDetailsWindows,
  };
};
