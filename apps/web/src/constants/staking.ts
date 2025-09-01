// Staking-related constants

export const STORAGE_FUND_PERCENTAGE = 0.2; // 20% reserved for storage
export const STAKE_RATIO = 1 - STORAGE_FUND_PERCENTAGE; // Effective staked portion

// Withdrawal unlock period (14,400 blocks = 24 hours at 6 seconds per block)
export const WITHDRAWAL_UNLOCK_BLOCKS = 14400;
export const WITHDRAWAL_UNLOCK_HOURS = 24;
