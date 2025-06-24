export interface StakingFormState {
  amount: string;
  isValid: boolean;
  errors: string[];
  isSubmitting: boolean;
  showPreview: boolean;
}

export interface StakingCalculations {
  storageFound: number; // 20% included in amount
  netStaking: number; // 80% goes to actual staking
  transactionFee: number; // Fixed mock fee (0.01)
  totalRequired: number; // Amount + fee
  expectedRewards: number; // Annual estimate
}

export interface StakingValidation {
  minimum: number; // AI3 (from operator.minimumNominatorStake)
  maximum: number; // AI3 (available balance)
  required: boolean;
  decimals: number; // Maximum 2 decimal places
}

export interface MockBalance {
  available: string; // "500.00" AI3 for mockup
  free: string;
  reserved: string;
  total: string;
}