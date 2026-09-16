import type { UserPosition } from '@/types/position';

/**
 * Link to official Autonomys forum primer explaining storage fee funds and wallet balance display.
 */
export const STORAGE_FEE_FUNDS_PRIMER_URL =
  'https://forum.autonomys.xyz/t/storage-fee-funds-primer/4320';

/**
 * Check if a user has an active or pending stake position with an operator.
 * Note: Intentionally omits pending withdrawals as those represent exited positions awaiting unlock.
 */
export const hasUserPosition = (userPosition?: UserPosition | null): boolean =>
  Boolean(
    userPosition &&
      (userPosition.positionValue > 0 ||
        userPosition.storageFeeDeposit > 0 ||
        (userPosition.pendingDeposit?.amount || 0) > 0),
  );

/**
 * Calculate total position value including current staked value, live storage fund deposit, and pending deposits.
 */
export const calculateTotalPositionValue = (userPosition?: UserPosition | null): number => {
  if (!userPosition) return 0;
  const pendingAmount = userPosition.pendingDeposit?.amount || 0;
  return userPosition.positionValue + userPosition.storageFeeDeposit + pendingAmount;
};
