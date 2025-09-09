// Normalized transaction types for Operator Detail view

export interface OperatorTransactionBase {
  id: string;
  operatorId: string;
  domainId: string;
  address: string;
  timestamp: string; // ISO string
  blockHeight: string; // keep as string to avoid precision issues
  extrinsicIds?: string;
  eventIds?: string;
}

export interface DepositTransaction extends OperatorTransactionBase {
  type: 'deposit';
  amount: string; // pending_amount or known amount as string
  storageFee: string; // known or pending storage fee deposit as string
  effectiveEpoch?: string; // pending_effective_domain_epoch as string
  status: 'pending' | 'processing' | 'finalized';
}

export interface WithdrawalTransaction extends OperatorTransactionBase {
  type: 'withdrawal';
  amount: string; // total_withdrawal_amount
  storageFeeRefund: string; // total_storage_fee_withdrawal
  unlockBlock?: string; // withdrawal_in_shares_unlock_block
  status: 'pending_unlock' | 'recorded';
}

export type OperatorTransaction = DepositTransaction | WithdrawalTransaction;
