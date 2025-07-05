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
    pendingDeposits: PendingDeposit[],
    pendingWithdrawals: PendingWithdrawal[],
  ): 'active' | 'pending' | 'withdrawing' => {
    if (pendingWithdrawals.length > 0) return 'withdrawing';
    if (pendingDeposits.length > 0) return 'pending';
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
      (sum, pos) => sum + pos.pendingDeposits.length,
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
        positionData.knownValue > 0n ||
        positionData.pendingDeposits.length > 0 ||
        positionData.storageFeeDeposit > 0n ||
        positionData.pendingWithdrawals.length > 0;

      if (hasPosition) {
        const pendingDeposits: PendingDeposit[] = positionData.pendingDeposits.map(deposit => ({
          amount: shannonsToAI3(deposit.amount.toString()),
          effectiveEpoch: deposit.effectiveEpoch,
        }));

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
              unlockAtBlock: withdrawal.unlockAtDomainBlock,
            };
          },
        );

        return {
          operatorId,
          operatorName: `Operator ${operatorId}`,
          positionValue: shannonsToAI3(positionData.knownValue.toString()),
          storageFeeDeposit: shannonsToAI3(positionData.storageFeeDeposit.toString()),
          pendingDeposits,
          pendingWithdrawals,
          status: getPositionStatus(pendingDeposits, pendingWithdrawals),
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
