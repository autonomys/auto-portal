import { activate } from '@autonomys/auto-utils';
import { nominatorPosition, operator } from '@autonomys/auto-consensus';
import { formatAI3 } from '@/lib/formatting';
import { shannonsToAI3 } from '@/lib/unit-conversion';
import type { UserPosition, PortfolioSummary } from '@/types/position';

const TARGET_OPERATORS = ['0', '1', '3']; // Same as operator service

export const fetchUserPositions = async (address: string): Promise<UserPosition[]> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const positions: UserPosition[] = [];

    // Check positions across target operators in parallel
    const positionPromises = TARGET_OPERATORS.map(async operatorId => {
      try {
        const [positionData, operatorData] = await Promise.all([
          nominatorPosition(api, operatorId, address),
          operator(api, operatorId),
        ]);

        // Only include if user has a position (knownValue > 0)
        if (positionData.knownValue > 0n) {
          return {
            operatorId,
            operatorName: `Operator ${operatorId}`,
            positionValue: formatAI3(shannonsToAI3(positionData.knownValue.toString())),
            storageFeeDeposit: formatAI3(shannonsToAI3(positionData.storageFeeDeposit.toString())),
            pendingDeposits: positionData.pendingDeposits.map(deposit => ({
              amount: formatAI3(shannonsToAI3(deposit.amount.toString())),
              effectiveEpoch: deposit.effectiveEpoch,
            })),
            pendingWithdrawals: positionData.pendingWithdrawals.map(withdrawal => ({
              amount: formatAI3(shannonsToAI3(withdrawal.amount.toString())),
              unlockAtBlock: withdrawal.unlockAtBlock,
            })),
            status:
              positionData.pendingWithdrawals.length > 0
                ? 'withdrawing'
                : positionData.pendingDeposits.length > 0
                  ? 'pending'
                  : 'active',
            lastUpdated: new Date(),
          } as UserPosition;
        }
        return null;
      } catch (error) {
        console.warn(`No position found for operator ${operatorId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(positionPromises);
    return results.filter(Boolean) as UserPosition[];
  } finally {
    await api.disconnect();
  }
};

export const calculatePortfolioSummary = (positions: UserPosition[]): PortfolioSummary => {
  const totalValue = positions.reduce((sum, pos) => {
    const value = parseFloat(pos.positionValue.replace(' AI3', ''));
    return sum + value;
  }, 0);

  const totalStorageFee = positions.reduce((sum, pos) => {
    const storageFee = parseFloat(pos.storageFeeDeposit.replace(' AI3', ''));
    return sum + storageFee;
  }, 0);

  const totalPendingDeposits = positions.reduce((sum, pos) => sum + pos.pendingDeposits.length, 0);
  const totalPendingWithdrawals = positions.reduce(
    (sum, pos) => sum + pos.pendingWithdrawals.length,
    0,
  );

  return {
    totalValue: formatAI3(totalValue),
    activePositions: positions.length,
    totalEarned: '0 AI3', // Will need cost basis calculation later
    pendingDeposits: totalPendingDeposits,
    pendingWithdrawals: totalPendingWithdrawals,
    totalStorageFee: formatAI3(totalStorageFee),
  };
};