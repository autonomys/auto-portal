import { operator } from '@autonomys/auto-consensus';
import type { Operator, OperatorStats } from '@/types/operator';
import { getSharedApiConnection } from './api-service';
import indexerService from './indexer-service';
import { mapIndexerToOperator, mapRpcToOperator } from '@/lib/operator-mapper';

export const operatorService = async (networkId: string = 'taurus') => {
  const api = await getSharedApiConnection(networkId);

  const getAllOperators = async (): Promise<Operator[]> => {
    try {
      // Primary: Fetch from indexer
      const { operators: indexerOperators } = await indexerService.getOperators({
        limit: 100,
        where: { processed: { _eq: true } },
        order_by: { block_height: 'asc' },
      });

      // Enrich with RPC data for real-time values
      const operators: Operator[] = [];
      for (const registration of indexerOperators) {
        try {
          const rpcData = await operator(api, registration.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          operators.push(mapIndexerToOperator(registration, rpcData as any));
        } catch {
          // Use indexer data only if RPC fails
          console.warn(`RPC data unavailable for operator ${registration.id}`);
          operators.push(mapIndexerToOperator(registration));
        }
      }

      return operators;
    } catch {
      // Fallback: Use hardcoded operators with RPC
      console.warn('Indexer unavailable, using RPC fallback');
      return getAllOperatorsFromRpc();
    }
  };

  // Fallback function for when indexer is unavailable
  const getAllOperatorsFromRpc = async (): Promise<Operator[]> => {
    const TARGET_OPERATORS = ['0', '3']; // Fallback operators
    const operators: Operator[] = [];

    for (const operatorId of TARGET_OPERATORS) {
      try {
        const rpcData = await operator(api, operatorId);
        const mapped = mapRpcToOperator(operatorId, rpcData);
        if (mapped) operators.push(mapped);
      } catch {
        console.warn(`Failed to fetch operator ${operatorId}`);
      }
    }

    return operators;
  };

  const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
    try {
      // Try indexer first
      const { operators } = await indexerService.getOperators({
        limit: 1,
        where: { id: { _in: [operatorId] }, processed: { _eq: true } },
      });

      if (operators.length > 0) {
        const rpcData = await operator(api, operatorId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mapIndexerToOperator(operators[0], rpcData as any);
      }
    } catch {
      console.warn(`Indexer lookup failed for operator ${operatorId}`);
    }

    // Fallback to RPC only
    try {
      const rpcData = await operator(api, operatorId);
      return mapRpcToOperator(operatorId, rpcData);
    } catch {
      console.warn(`Operator ${operatorId} not found`);
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
        nominatorCount: operators.reduce((sum, op) => sum + op.nominatorCount, 0),
      };
    } catch (error) {
      console.error('Failed to fetch operator stats:', error);
      return {
        sharePrice: '1.0000',
        totalShares: '0',
        totalStaked: '0',
        nominatorCount: 0,
      };
    }
  };

  return {
    getAllOperators,
    getOperatorById,
    getOperatorStats,
  };
};
