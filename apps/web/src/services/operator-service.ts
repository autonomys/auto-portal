import { activate } from '@autonomys/auto-utils';
import { operator } from '@autonomys/auto-consensus';
import type { Operator, OperatorStats } from '@/types/operator';

export const operatorService = async (networkId: string = 'taurus') => {
  const api = await activate({ networkId });

  const getAllOperators = async (): Promise<Operator[]> => {
    const TARGET_OPERATORS = ['0', '3'];
    const operators: Operator[] = [];

    console.log(`Fetching operators from network: ${networkId}`);

    // Iterate through target operators and fetch via RPC
    for (const operatorId of TARGET_OPERATORS) {
      try {
        const operatorData = await operator(api, operatorId);
        console.log(`✅ Found operator ${operatorId}:`, operatorData);

        // Map RPC data to UI interface with robust null checking
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rpc = operatorData as any;

        // Skip operators with missing critical data
        if (!rpc || rpc.signingKey === null || rpc.signingKey === undefined) {
          console.warn(`❌ Operator ${operatorId} has null signingKey, skipping`);
          continue;
        }

        const mappedOperator: Operator = {
          id: operatorId,
          name: `Operator ${operatorId}`,
          domainId: String(rpc.currentDomainId || rpc.nextDomainId || '0'),
          domainName: 'Auto EVM',
          ownerAccount: String(rpc.signingKey),
          nominationTax: Number(rpc.nominationTax || 0),
          minimumNominatorStake: rpc.minimumNominatorStake
            ? (Number(rpc.minimumNominatorStake) / Math.pow(10, 18)).toFixed(4)
            : '0.0000',
          status: 'active' as const,
          totalStaked: rpc.currentTotalStake
            ? (Number(rpc.currentTotalStake) / Math.pow(10, 18)).toFixed(4)
            : '0.0000',
          nominatorCount: 0,
        };

        operators.push(mappedOperator);
      } catch (error) {
        console.warn(`❌ Operator ${operatorId} not found:`, error);
        // Continue with other operators
      }
    }

    console.log(`Found ${operators.length} valid operators`);
    return operators;
  };

  const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
    try {
      const operatorData = await operator(api, operatorId);
      console.log('operatorData', operatorData);

      // Map RPC data to UI interface with robust null checking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpc = operatorData as any;

      // Return null if critical data is missing
      if (!rpc || rpc.signingKey === null || rpc.signingKey === undefined) {
        console.warn(`❌ Operator ${operatorId} has null signingKey`);
        return null;
      }

      return {
        id: operatorId,
        name: `Operator ${operatorId}`,
        domainId: String(rpc.currentDomainId || rpc.nextDomainId || '0'),
        domainName: 'Auto EVM',
        ownerAccount: String(rpc.signingKey),
        nominationTax: Number(rpc.nominationTax || 0),
        minimumNominatorStake: rpc.minimumNominatorStake
          ? (Number(rpc.minimumNominatorStake) / Math.pow(10, 18)).toFixed(4)
          : '0.0000',
        status: 'active' as const,
        totalStaked: rpc.currentTotalStake
          ? (Number(rpc.currentTotalStake) / Math.pow(10, 18)).toFixed(4)
          : '0.0000',
        nominatorCount: 0,
      };
    } catch (error) {
      console.warn(`❌ Operator ${operatorId} not found:`, error);
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
