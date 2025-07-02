import { headDomainNumber } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from '@/services/api-service';
import { ESTIMATED_BLOCK_TIME_SECONDS } from '@/constants/blockchain';

export interface WithdrawalUnlockStatus {
  isUnlockable: boolean;
  currentDomainBlock: number;
  unlockAtBlock: number;
  blocksRemaining: number;
  estimatedTimeRemaining?: string; // Human readable time estimate
}

/**
 * Get the current block number from the blockchain
 * @param domainId - The domain ID to get the current block number for (default is 0)
 * @returns Promise that resolves to current block number
 */
export const getCurrentDomainBlockNumber = async (domainId = 0): Promise<number> => {
  try {
    const api = await getSharedApiConnection();
    return (await headDomainNumber(api, domainId)) ?? 0;
  } catch (error) {
    console.error('Failed to get current block number:', error);
    throw new Error('Unable to retrieve current block number');
  }
};

/**
 * Check if a withdrawal is ready to be unlocked
 * @param unlockAtBlock - The block number when the withdrawal becomes unlockable
 * @param currentDomainBlock - Optional current block number (will fetch if not provided)
 * @returns Promise that resolves to withdrawal unlock status
 */
export const checkWithdrawalUnlockStatus = async (
  unlockAtBlock: number,
  currentDomainBlock?: number,
): Promise<WithdrawalUnlockStatus> => {
  // Handle invalid unlock block numbers
  if (!unlockAtBlock || unlockAtBlock <= 0 || !Number.isFinite(unlockAtBlock)) {
    return {
      isUnlockable: false,
      currentDomainBlock: 0,
      unlockAtBlock: unlockAtBlock || 0,
      blocksRemaining: 0,
      estimatedTimeRemaining: 'Unknown',
    };
  }

  try {
    const domainBlock = currentDomainBlock ?? (await getCurrentDomainBlockNumber());

    const blocksRemaining = Math.max(0, unlockAtBlock - domainBlock);
    const isUnlockable = blocksRemaining === 0;

    // Estimate time remaining (assuming ~6 seconds per block for Autonomys)
    const estimatedSecondsRemaining = blocksRemaining * ESTIMATED_BLOCK_TIME_SECONDS;
    const estimatedTimeRemaining = formatTimeRemaining(estimatedSecondsRemaining);

    return {
      isUnlockable,
      currentDomainBlock: domainBlock,
      unlockAtBlock,
      blocksRemaining,
      estimatedTimeRemaining,
    };
  } catch (error) {
    console.error('Failed to check withdrawal unlock status:', error);
    return {
      isUnlockable: false,
      currentDomainBlock: 0,
      unlockAtBlock,
      blocksRemaining: 0,
      estimatedTimeRemaining: 'Unknown',
    };
  }
};

/**
 * Check multiple withdrawals and return their unlock statuses
 * @param withdrawals - Array of withdrawals with unlockAtBlock property
 * @returns Promise that resolves to array of unlock statuses
 */
export const checkMultipleWithdrawalsStatus = async (
  withdrawals: { unlockAtBlock: number }[],
): Promise<WithdrawalUnlockStatus[]> => {
  if (withdrawals.length === 0) {
    return [];
  }

  // Get current block once and reuse for all withdrawals
  const currentDomainBlock = await getCurrentDomainBlockNumber();

  return withdrawals.map(withdrawal => {
    const blocksRemaining = Math.max(0, withdrawal.unlockAtBlock - currentDomainBlock);
    const isUnlockable = blocksRemaining === 0;
    const estimatedSecondsRemaining = blocksRemaining * ESTIMATED_BLOCK_TIME_SECONDS;
    const estimatedTimeRemaining = formatTimeRemaining(estimatedSecondsRemaining);

    return {
      isUnlockable,
      currentDomainBlock,
      unlockAtBlock: withdrawal.unlockAtBlock,
      blocksRemaining,
      estimatedTimeRemaining,
    };
  });
};

/**
 * Format seconds into human-readable time duration
 * @param seconds - Number of seconds
 * @returns Formatted time string
 */
const formatTimeRemaining = (seconds: number): string => {
  // Handle invalid input
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) {
    return 'Unknown';
  }

  if (seconds <= 0) {
    return 'Ready to unlock';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `~${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `~${minutes}m ${remainingSeconds}s`;
  } else {
    return `~${remainingSeconds}s`;
  }
};

/**
 * Calculate storage fee refund based on withdrawal percentage of total position
 * @param withdrawalPercentage - Percentage of position being withdrawn (0-1)
 * @param totalStorageFeeDeposit - Total storage fee deposit for the position
 * @returns Proportional storage fee refund amount
 */
export const calculateStorageFeeRefund = (
  withdrawalPercentage: number,
  totalStorageFeeDeposit: number,
): number => {
  return withdrawalPercentage * totalStorageFeeDeposit;
};

/**
 * Calculate net stake withdrawal from gross withdrawal amount
 * @param grossWithdrawalAmount - Total amount user wants to withdraw
 * @param storageFeeRefund - Storage fee refund portion
 * @returns Net stake amount being withdrawn
 */
export const calculateNetStakeWithdrawal = (
  grossWithdrawalAmount: number,
  storageFeeRefund: number,
): number => {
  return grossWithdrawalAmount - storageFeeRefund;
};

/**
 * Get withdrawal preview information
 * @param grossWithdrawalAmount - Total amount user wants to receive (user input)
 * @param withdrawalType - Type of withdrawal ('all' | 'partial')
 * @param totalStakePosition - Total stake position value (excluding storage fee deposit)
 * @param totalStorageFeeDeposit - Total storage fee deposit for this position
 * @returns Withdrawal preview details
 */
export const getWithdrawalPreview = (
  grossWithdrawalAmount: number,
  withdrawalType: 'all' | 'partial',
  totalStakePosition: number,
  totalStorageFeeDeposit: number,
) => {
  const totalPosition = totalStakePosition + totalStorageFeeDeposit;

  // Calculate percentage based on total position (stake + storage fee)
  const percentage =
    withdrawalType === 'all' ? 100 : Math.min(100, (grossWithdrawalAmount / totalPosition) * 100);
  const withdrawalPercentage = percentage / 100; // Convert to 0-1 range

  // Estimate proportional storage fee refund (actual amount determined by protocol)
  // Note: This is an estimate - actual refund depends on storage fund performance
  const estimatedStorageFeeRefund = calculateStorageFeeRefund(
    withdrawalPercentage,
    totalStorageFeeDeposit,
  );

  // Calculate net stake withdrawal from gross amount
  const netStakeWithdrawal =
    withdrawalType === 'all'
      ? totalStakePosition
      : Math.max(0, grossWithdrawalAmount - estimatedStorageFeeRefund);

  // For full withdrawal, recalculate gross amount to be accurate
  const actualGrossWithdrawalAmount =
    withdrawalType === 'all'
      ? totalStakePosition + estimatedStorageFeeRefund
      : grossWithdrawalAmount;

  // Remaining position after withdrawal
  const remainingStakePosition =
    withdrawalType === 'all' ? 0 : totalStakePosition - netStakeWithdrawal;
  const remainingStorageFee =
    withdrawalType === 'all' ? 0 : totalStorageFeeDeposit - estimatedStorageFeeRefund;

  return {
    grossWithdrawalAmount: actualGrossWithdrawalAmount, // Total amount user will receive
    netStakeWithdrawal, // Amount withdrawn from staking position
    storageFeeRefund: estimatedStorageFeeRefund, // Estimated storage fee refund portion
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    remainingPosition: remainingStakePosition, // Remaining stake value
    remainingStorageFee, // Remaining storage fee deposit
    withdrawalType,
  };
};
