export interface PendingDeposit {
  amount: number; // Amount in AI3 (raw numeric value)
  effectiveEpoch: number;
}

export interface PendingWithdrawal {
  grossWithdrawalAmount: number; // Total gross amount user will receive in AI3
  stakeWithdrawalAmount: number; // Net stake amount being withdrawn in AI3
  storageFeeRefund: number; // Storage fee refund portion in AI3
  unlockAtBlock: number; // Aligns with unlockAtDomainBlock from SDK
}

export interface UserPosition {
  operatorId: string;
  operatorName: string;
  positionValue: number; // Current value in AI3 (raw numeric value)
  storageFeeDeposit: number; // Storage fee deposit in AI3 (raw numeric value)
  pendingDeposit: PendingDeposit | null;
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
  totalStorageFee: number; // Total storage fund deposits in AI3 (raw numeric value)
}

export interface PositionServiceError {
  operatorId: string;
  error: string;
  timestamp: Date;
}
