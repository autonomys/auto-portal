export interface StakingFormState {
  amount: string;
  isValid: boolean;
  errors: string[];
  isSubmitting: boolean;
  showPreview: boolean;
}

export interface StakingCalculations {
  storageFund: number; // 20% included in amount
  netStaking: number; // 80% goes to actual staking
  transactionFee: number; // Transaction fee
  totalRequired: number; // Amount + fee
  expectedRewards: number; // Annual estimate
}

export interface StakingValidation {
  minimum: number; // AI3 (from operator.minimumNominatorStake)
  maximum: number; // AI3 (available balance)
  required: boolean;
  decimals: number; // Maximum decimal places
}

export interface UserBalance {
  available: string; // Available AI3 for staking
  free: string;
  reserved: string;
  total: string;
}
