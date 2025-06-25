import { activate } from '@autonomys/auto-utils';
import { operator, deposits, withdrawals } from '@autonomys/auto-consensus';
import { formatAI3 } from '@/lib/formatting';
import { shannonsToAI3 } from '@/lib/unit-conversion';
import type { UserPosition, PortfolioSummary } from '@/types/position';

const TARGET_OPERATORS = ['0', '1', '3']; // Same as operator service

// Simple interfaces for API responses
interface DepositData {
  amount: string | number;
  confirmed?: boolean;
  effectiveEpoch?: number;
}

interface WithdrawalData {
  amount: string | number;
  confirmed?: boolean;
  unlockAtBlock?: number;
}

export const fetchUserPositions = async (address: string): Promise<UserPosition[]> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    // Check positions across target operators in parallel
    const positionPromises = TARGET_OPERATORS.map(async operatorId => {
      try {
        const [, depositsData, withdrawalsData] = await Promise.all([
          operator(api, operatorId),
          deposits(api, operatorId, address),
          withdrawals(api, operatorId, address),
        ]);

        // Calculate position value from deposits
        const totalDeposited = (depositsData as unknown as DepositData[]).reduce(
          (sum: bigint, deposit: DepositData) => sum + BigInt(deposit.amount || 0),
          0n,
        );
        const totalWithdrawn = (withdrawalsData as unknown as WithdrawalData[]).reduce(
          (sum: bigint, withdrawal: WithdrawalData) => sum + BigInt(withdrawal.amount || 0),
          0n,
        );
        const currentValue = totalDeposited - totalWithdrawn;

        // Only include if user has a position (currentValue > 0)
        if (currentValue > 0n) {
          // Separate pending vs confirmed deposits/withdrawals
          const pendingDeposits = (depositsData as unknown as DepositData[])
            .filter((deposit: DepositData) => !deposit.confirmed)
            .map((deposit: DepositData) => ({
              amount: formatAI3(shannonsToAI3(deposit.amount.toString())),
              effectiveEpoch: deposit.effectiveEpoch || 0,
            }));

          const pendingWithdrawals = (withdrawalsData as unknown as WithdrawalData[])
            .filter((withdrawal: WithdrawalData) => !withdrawal.confirmed)
            .map((withdrawal: WithdrawalData) => ({
              amount: formatAI3(shannonsToAI3(withdrawal.amount.toString())),
              unlockAtBlock: withdrawal.unlockAtBlock || 0,
            }));

          return {
            operatorId,
            operatorName: `Operator ${operatorId}`,
            positionValue: formatAI3(shannonsToAI3(currentValue.toString())),
            storageFeeDeposit: '0 AI3', // Will need to fetch separately if available
            pendingDeposits,
            pendingWithdrawals,
            status:
              pendingWithdrawals.length > 0
                ? 'withdrawing'
                : pendingDeposits.length > 0
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
