import { nominatorPosition } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from './api-service';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import type {
  UserPosition,
  PortfolioSummary,
  PendingDeposit,
  PendingWithdrawal,
} from '@/types/position';
import { config } from '@/config';

export const positionService = async (networkId: string = config.network.defaultNetworkId) => {
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
    const totalValue = positions.reduce((sum, pos) => {
      const pendingAmount = pos.pendingDeposit ? pos.pendingDeposit.amount : 0;
      return sum + pos.positionValue + pos.storageFeeDeposit + pendingAmount;
    }, 0);

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
              amount: parseFloat(shannonsToAi3(positionData.pendingDeposit.amount)),
              effectiveEpoch: positionData.pendingDeposit.effectiveEpoch,
            }
          : null;

        const pendingWithdrawals: PendingWithdrawal[] = positionData.pendingWithdrawals.map(
          withdrawal => {
            const stakeWithdrawalAmount = parseFloat(
              shannonsToAi3(withdrawal.stakeWithdrawalAmount),
            );
            const storageFeeRefund = parseFloat(shannonsToAi3(withdrawal.storageFeeRefund));

            // Total amount user will receive = net stake + storage fund refund
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
          positionValue: parseFloat(shannonsToAi3(positionData.currentStakedValue)),
          storageFeeDeposit: parseFloat(
            shannonsToAi3(positionData.storageFeeDeposit.totalDeposited),
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
