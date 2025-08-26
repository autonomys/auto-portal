import { operator } from '@autonomys/auto-consensus';
import type { Operator, OperatorStats, ReturnDetailsWindows } from '@/types/operator';
import { getSharedApiConnection } from './api-service';
import { mapRpcToOperator } from '@/lib/operator-mapper';
import { TARGET_OPERATORS } from '@/constants/target-operators';
import { config } from '@/config';
import indexerService from '@/services/indexer-service';
import { calculateReturnDetails, type ReturnDetails } from '@/lib/apy';

export const operatorService = async (networkId: string = config.network.defaultNetworkId) => {
  const api = await getSharedApiConnection(networkId);

  const getAllOperators = async (): Promise<Operator[]> =>
    // Pure RPC-based operator discovery
    await getAllOperatorsFromRpc();
  const getAllOperatorsFromRpc = async (): Promise<Operator[]> => {
    console.log(`🔗 Fetching ${TARGET_OPERATORS.length} operators from RPC (${networkId})...`);
    const operators: Operator[] = [];

    for (const operatorId of TARGET_OPERATORS) {
      try {
        const rpcData = await operator(api, operatorId);
        const mapped = mapRpcToOperator(operatorId, rpcData);
        if (mapped) operators.push(mapped);
      } catch (error) {
        console.warn(`Failed to fetch operator ${operatorId}:`, error);
      }
    }

    console.log(`✅ Successfully fetched ${operators.length} operators from RPC`);
    return operators;
  };

  const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
    // Pure RPC lookup
    try {
      const rpcData = await operator(api, operatorId);
      return mapRpcToOperator(operatorId, rpcData);
    } catch (error) {
      console.warn(`Operator ${operatorId} not found:`, error);
      return null;
    }
  };

  const getOperatorStats = async (): Promise<OperatorStats> => {
    try {
      const operators = await getAllOperators();

      const totalStaked = operators
        .reduce((sum, op) => sum + parseFloat(op.totalStaked), 0)
        .toString();

      return {
        sharePrice: '1.0000',
        totalShares: totalStaked,
        totalStaked,
      };
    } catch (error) {
      console.error('Failed to fetch operator stats:', error);
      return {
        sharePrice: '1.0000',
        totalShares: '0',
        totalStaked: '0',
      };
    }
  };

  const estimateOperatorReturnDetails = async (
    operatorId: string,
    lookbackDays: number,
  ): Promise<ReturnDetails | null> => {
    try {
      // Latest price
      const latestRows = await indexerService.getOperatorLatestSharePrices(operatorId, 1);
      if (!latestRows?.length) return null;

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      // Earliest price in window
      const sinceISO = new Date(Date.now() - lookbackDays * MS_PER_DAY).toISOString();
      const earliestRows = await indexerService.getOperatorSharePricesSince(operatorId, sinceISO);
      if (!earliestRows?.length) return null;

      const startPrice = {
        price: Number(earliestRows[0].share_price),
        date: new Date(earliestRows[0].timestamp),
      };
      const endPrice = {
        price: Number(latestRows[0].share_price),
        date: new Date(latestRows[0].timestamp),
      };

      const returnDetails = calculateReturnDetails(startPrice, endPrice);
      return returnDetails;
    } catch (err) {
      console.warn('Failed to estimate APY for operator', operatorId, err);
      return null;
    }
  };

  const estimateOperatorReturnDetailsWindows = async (
    operatorId: string,
  ): Promise<ReturnDetailsWindows> => {
    try {
      const latestRows = await indexerService.getOperatorLatestSharePrices(operatorId, 1);
      if (!latestRows?.length) return {};

      const endPrice = {
        price: Number(latestRows[0].share_price),
        date: new Date(latestRows[0].timestamp),
      };

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const now = Date.now();
      type WindowKey = keyof ReturnDetailsWindows;
      const windows: Array<{ key: WindowKey; days: number }> = [
        { key: 'd1', days: 1 },
        { key: 'd3', days: 3 },
        { key: 'd7', days: 7 },
        { key: 'd30', days: 30 },
      ];

      const sinceDates = windows.map(w => new Date(now - w.days * MS_PER_DAY).toISOString());

      const sincePromises = sinceDates.map(sinceISO =>
        indexerService.getOperatorSharePricesSince(operatorId, sinceISO, 1),
      );

      const results = await Promise.allSettled(sincePromises);

      const details: ReturnDetailsWindows = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value?.length) {
          const startRow = res.value[0];
          const startPrice = {
            price: Number(startRow.share_price),
            date: new Date(startRow.timestamp),
          };
          const rd = calculateReturnDetails(startPrice, endPrice);
          if (rd) {
            const key = windows[idx].key;
            details[key] = rd;
          }
        }
      });

      return details;
    } catch (err) {
      console.warn('Failed to estimate APY windows for operator', operatorId, err);
      return {};
    }
  };

  return {
    getAllOperators,
    getOperatorById,
    getOperatorStats,
    estimateOperatorReturnDetails,
    estimateOperatorReturnDetailsWindows,
    // Convenience: fetch a single operator and enrich with APY when available
    getOperatorWithApy: async (
      operatorId: string,
      lookbackDays: number,
    ): Promise<Operator | null> => {
      const op = await getOperatorById(operatorId);
      if (!op) return null;

      const returnDetails = await estimateOperatorReturnDetails(operatorId, lookbackDays);
      if (!returnDetails) return op;

      return {
        ...op,
        estimatedReturnDetails: returnDetails,
      };
    },
    getOperatorWithApyWindows: async (operatorId: string): Promise<Operator | null> => {
      const op = await getOperatorById(operatorId);
      if (!op) return null;

      const windows = await estimateOperatorReturnDetailsWindows(operatorId);
      const d7 = windows.d7 ?? null;

      return {
        ...op,
        ...(d7 ? { estimatedReturnDetails: d7 } : {}),
        estimatedReturnDetailsWindows: windows,
      };
    },
  };
};
