export interface PendingDeposit {
  amount: number; // Amount in AI3 (raw numeric value)
  effectiveEpoch: number;
}

export interface PendingWithdrawal {
  amount: number; // Amount in AI3 (raw numeric value)
  unlockAtBlock: number;
}

export interface UserPosition {
  operatorId: string;
  operatorName: string;
  positionValue: number; // Current value in AI3 (raw numeric value)
  storageFeeDeposit: number; // Storage fee deposit in AI3 (raw numeric value)
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawal[];
  status: 'active' | 'pending' | 'withdrawing';
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: number; // Total portfolio value in AI3 (raw numeric value)
  activePositions: number; // Number of operators staked to
  totalEarned: number; // Total earnings (requires cost basis calculation)
  pendingDeposits: number; // Count of pending deposit operations
  pendingWithdrawals: number; // Count of pending withdrawal operations
  totalStorageFee: number; // Total storage fee deposits in AI3 (raw numeric value)
}

export interface PositionServiceError {
  operatorId: string;
  error: string;
  timestamp: Date;
}

// Withdrawal related types
export interface WithdrawalRequest {
  operatorId: string;
  amount: string;
  type: 'partial' | 'full';
}

export interface WithdrawalPreview {
  stakedAmount: string;
  storageAmount: string;
  totalAmount: string;
  estimatedFee: string;
  unlockAt: number;
  estimatedUnlockTime: string;
}

export interface UnlockRequest {
  operatorId: string;
  withdrawalId: string;
}
