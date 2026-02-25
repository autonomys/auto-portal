export interface DepositTransaction {
  type: 'deposit';
  pending?: boolean;
  operatorId: string;
  amount: string; // AI3 (staking portion)
  storageFee: string; // AI3 (storage fee portion)
  totalAmount: string; // AI3 (amount + storageFee)
  blockHeight: number;
  timestamp: Date;
}

export interface WithdrawalTransaction {
  type: 'withdrawal';
  pending?: boolean;
  operatorId: string;
  shares: string; // raw shares being withdrawn (0 if epoch-converted)
  amount: string; // AI3, converted balance (0 if shares still pending)
  storageFeeRefund: string; // AI3
  blockHeight: number;
  timestamp: Date;
}

export type OperatorTransaction = DepositTransaction | WithdrawalTransaction;
