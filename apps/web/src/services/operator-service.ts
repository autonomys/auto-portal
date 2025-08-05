import { operator } from '@autonomys/auto-consensus';
import type { Operator, OperatorStats } from '@/types/operator';
import { getSharedApiConnection } from './api-service';
import { mapRpcToOperator } from '@/lib/operator-mapper';
import { TARGET_OPERATORS } from '@/constants/target-operators';
import { config } from '@/config';

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

  return {
    getAllOperators,
    getOperatorById,
    getOperatorStats,
  };
};
