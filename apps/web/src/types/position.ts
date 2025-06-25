export interface UserPosition {
  operatorId: string;
  operatorName: string;
  positionValue: string; // Current value in AI3
  storageFeeDeposit: string;
  pendingDeposits: Array<{
    amount: string;
    effectiveEpoch: number;
  }>;
  pendingWithdrawals: Array<{
    amount: string;
    unlockAtBlock: number;
  }>;
  status: 'active' | 'pending' | 'withdrawing';
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: string; // Total portfolio value in AI3
  activePositions: number; // Number of operators staked to
  totalEarned: string; // Future: requires cost basis from indexer
  pendingDeposits: number; // Count of pending operations
  pendingWithdrawals: number;
  totalStorageFee: string; // Total storage fee deposits
}