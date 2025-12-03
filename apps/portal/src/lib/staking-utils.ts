import type { StakingCalculations, StakingValidation } from '@/types/staking';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';
import { STORAGE_FUND_PERCENTAGE } from '@/constants/staking';

export const TRANSACTION_FEE = 0.0001; // Fallback fee

export const calculateStakingAmounts = (
  amount: string,
  operatorAPY: number,
  transactionFee?: number,
): StakingCalculations => {
  const amountValue = parseFloat(amount) || 0;
  const feeToUse = transactionFee ?? TRANSACTION_FEE;

  return {
    storageFund: amountValue * STORAGE_FUND_PERCENTAGE,
    netStaking: amountValue * (1 - STORAGE_FUND_PERCENTAGE),
    transactionFee: feeToUse,
    totalRequired: amountValue + feeToUse,
    expectedRewards: amountValue * (1 - STORAGE_FUND_PERCENTAGE) * (operatorAPY / 100),
  };
};

export const getValidationRules = (
  operator: Operator,
  availableBalance: number,
  currentPosition?: UserPosition | null,
): StakingValidation => {
  // Only enforce minimum on first nomination (when user has no current position)
  const hasExistingPosition = currentPosition && currentPosition.positionValue > 0;
  const effectiveMinimum = hasExistingPosition ? 0 : parseFloat(operator.minimumNominatorStake);

  return {
    minimum: effectiveMinimum,
    maximum: availableBalance,
    required: true,
    decimals: 8,
  };
};

export const validateStakingAmount = (
  amount: string,
  validation: StakingValidation,
  transactionFee?: number,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const feeToUse = transactionFee ?? TRANSACTION_FEE;

  if (!amount || amount.trim() === '') {
    errors.push('Please enter a staking amount');
    return { isValid: false, errors };
  }

  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.push('Please enter a valid positive number');
    return { isValid: false, errors };
  }

  // Only enforce minimum if it's greater than 0 (first nomination)
  if (validation.minimum > 0 && numericAmount < validation.minimum) {
    errors.push(`First nomination must be at least ${validation.minimum} AI3`);
  }

  // Balance checks: avoid double-reporting. If amount already exceeds balance,
  // do not also add the fee-based error.
  if (numericAmount > validation.maximum) {
    errors.push('Amount exceeds available balance');
  } else if (numericAmount + feeToUse > validation.maximum) {
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

export const formatAI3Amount = (amount: number, decimals = 5): string => amount.toFixed(decimals);

export const formatAI3AmountWithCommas = (amount: number, decimals = 5): string =>
  amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
