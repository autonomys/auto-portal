import { nominatorPosition } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from './api-service';
import { shannonsToAI3 } from '@/lib/unit-conversion';
import type {
  UserPosition,
  PortfolioSummary,
  PendingDeposit,
  PendingWithdrawal,
} from '@/types/position';

export const positionService = async (networkId: string = 'taurus') => {
  const api = await getSharedApiConnection(networkId);

  /**
   * Determine position status based on pending operations
   */
  const getPositionStatus = (
    pendingDeposit: PendingDeposit | null,
    pendingWithdrawals: PendingWithdrawal[],
  ): 'active' | 'pending' | 'withdrawing' => {
    if (pendingWithdrawals.length > 0) return 'withdrawing';
    if (pendingDeposit) return 'pending';
    return 'active';
  };

  /**
   * Calculate portfolio summary from positions
   */
  const calculatePortfolioSummary = (positions: UserPosition[]): PortfolioSummary => {
    const totalValue = positions.reduce(
      (sum, pos) => sum + pos.positionValue + pos.storageFeeDeposit,
      0,
    );

    const totalStorageFee = positions.reduce((sum, pos) => sum + pos.storageFeeDeposit, 0);

    const totalPendingDeposits = positions.reduce(
      (sum, pos) => sum + (pos.pendingDeposit ? 1 : 0),
      0,
    );
    const totalPendingWithdrawals = positions.reduce(
      (sum, pos) => sum + pos.pendingWithdrawals.length,
      0,
    );

    return {
      totalValue,
      activePositions: positions.length,
      totalEarned: 0, // Requires cost basis calculation
      pendingDeposits: totalPendingDeposits,
      pendingWithdrawals: totalPendingWithdrawals,
      totalStorageFee,
    };
  };

  /**
   * Get user's position with a specific operator
   */
  const getPositionByOperator = async (
    address: string,
    operatorId: string,
  ): Promise<UserPosition | null> => {
    try {
      const positionData = await nominatorPosition(api, operatorId, address);

      // Check if there's any position data to display:
      // - Known value > 0 (existing shares)
      // - Pending deposits (first-time staking)
      // - Storage fee deposits (from pending or known deposits)
      // - Pending withdrawals (active withdrawal requests)
      const hasPosition =
        positionData.currentStakedValue > 0n ||
        positionData.pendingDeposit !== null ||
        positionData.storageFeeDeposit.totalDeposited > 0n ||
        positionData.pendingWithdrawals.length > 0;

      if (hasPosition) {
        const pendingDeposit: PendingDeposit | null = positionData.pendingDeposit
          ? {
              amount: shannonsToAI3(positionData.pendingDeposit.amount.toString()),
              effectiveEpoch: positionData.pendingDeposit.effectiveEpoch,
            }
          : null;

        const pendingWithdrawals: PendingWithdrawal[] = positionData.pendingWithdrawals.map(
          withdrawal => {
            const stakeWithdrawalAmount = shannonsToAI3(
              withdrawal.stakeWithdrawalAmount.toString(),
            );
            const storageFeeRefund = shannonsToAI3(withdrawal.storageFeeRefund.toString());

            // Total amount user will receive = net stake + storage fee refund
            const grossWithdrawalAmount = stakeWithdrawalAmount + storageFeeRefund;

            return {
              grossWithdrawalAmount, // Total gross amount user will receive
              stakeWithdrawalAmount, // Net stake amount being withdrawn
              storageFeeRefund, // Storage fee refund
              unlockAtBlock: withdrawal.unlockAtBlock,
            };
          },
        );

        return {
          operatorId,
          operatorName: `Operator ${operatorId}`,
          positionValue: shannonsToAI3(positionData.currentStakedValue.toString()),
          storageFeeDeposit: shannonsToAI3(
            positionData.storageFeeDeposit.totalDeposited.toString(),
          ),
          pendingDeposit,
          pendingWithdrawals,
          status: getPositionStatus(pendingDeposit, pendingWithdrawals),
          lastUpdated: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.warn(`Failed to fetch position for operator ${operatorId}:`, error);
      return null;
    }
  };

  return {
    calculatePortfolioSummary,
    getPositionByOperator,
  };
};
