// Staking-related types shared between frontend and backend

export interface StakingPosition {
  operatorId: string;
  domainId: string;
  nominatorId: string;
  shares: bigint;
  stakedAmount: bigint;
  storageFeeDeposit: bigint;
  status: 'active' | 'pending_withdrawal' | 'withdrawing' | 'withdrawn';
}

export interface PendingDeposit {
  operatorId: string;
  domainId: string;
  amount: bigint;
  storageFeeDeposit: bigint;
  effectiveEpoch: number;
}

export interface PendingWithdrawal {
  operatorId: string;
  domainId: string;
  shares: bigint;
  unlockAtBlock: number;
  estimatedAmount?: bigint;
}

export interface StakingReward {
  operatorId: string;
  amount: bigint;
  epoch: number;
  timestamp: Date;
}

export interface StakingStats {
  totalStaked: bigint;
  totalRewards: bigint;
  activePositions: number;
  pendingWithdrawals: number;
}
