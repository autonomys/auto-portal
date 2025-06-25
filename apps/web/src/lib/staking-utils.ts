import type { StakingCalculations, StakingValidation } from '@/types/staking';
import type { Operator } from '@/types/operator';

export const DEFAULT_BALANCE = 500.0; // AI3
export const TRANSACTION_FEE = 0.01; // AI3
export const STORAGE_FUND_PERCENTAGE = 0.2; // 20%

export const calculateStakingAmounts = (
  amount: string,
  operatorAPY: number,
): StakingCalculations => {
  const amountValue = parseFloat(amount) || 0;

  return {
    storageFund: amountValue * STORAGE_FUND_PERCENTAGE,
    netStaking: amountValue * (1 - STORAGE_FUND_PERCENTAGE),
    transactionFee: TRANSACTION_FEE,
    totalRequired: amountValue + TRANSACTION_FEE,
    expectedRewards: amountValue * (1 - STORAGE_FUND_PERCENTAGE) * (operatorAPY / 100),
  };
};

export const getValidationRules = (operator: Operator, availableBalance?: number): StakingValidation => {
  return {
    minimum: parseFloat(operator.minimumNominatorStake), // Already in AI3 format
    maximum: availableBalance ?? DEFAULT_BALANCE,
    required: true,
    decimals: 2,
  };
};

export const validateStakingAmount = (
  amount: string,
  validation: StakingValidation,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!amount || amount.trim() === '') {
    errors.push('Please enter a staking amount');
    return { isValid: false, errors };
  }

  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.push('Please enter a valid positive number');
    return { isValid: false, errors };
  }

  if (numericAmount < validation.minimum) {
    errors.push(`Amount must be at least ${validation.minimum} AI3`);
  }

  if (numericAmount > validation.maximum) {
    errors.push('Amount exceeds available balance');
  }

  // Check if amount + fee exceeds balance
  if (numericAmount + TRANSACTION_FEE > validation.maximum) {
    errors.push('Insufficient balance for this amount plus transaction fees');
  }

  // Validate decimal places
  const decimalParts = amount.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > validation.decimals) {
    errors.push(`Maximum ${validation.decimals} decimal places allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatAI3Amount = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatAI3AmountWithCommas = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
