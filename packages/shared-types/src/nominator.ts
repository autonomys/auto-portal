// Nominator-related types shared between frontend and backend

import type { PendingDeposit, PendingWithdrawal } from './staking';

export interface Nominator {
  id: string; // address-domainId-operatorId
  address: string;
  domainId: string;
  operatorId: string;
  knownShares: bigint;
  withdrawnShares: bigint;
  knownStorageFeeDeposit: bigint;
  totalDeposits: bigint;
  totalWithdrawals: bigint;
  totalClaimed: bigint;
  status: 'active' | 'pending_withdrawal' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface NominatorPosition {
  nominator: Nominator;
  operator: {
    id: string;
    address: string;
    domainId: string;
    nominationTax: number;
    status: string;
  };
  currentStake: bigint;
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawal[];
  unlockedWithdrawals: UnlockedWithdrawal[];
  estimatedValue: bigint;
  storageFundValue: bigint;
}

export interface UnlockedWithdrawal {
  unlockBlock: number;
  amount: bigint;
  storageFeeRefund: bigint;
  status: 'ready' | 'claimed';
}

export interface NominatorStats {
  totalPositions: number;
  totalStaked: bigint;
  totalRewards: bigint;
  pendingWithdrawals: bigint;
  claimableAmount: bigint;
}

// Re-export from staking.ts for convenience
export type { PendingDeposit, PendingWithdrawal } from './staking';
