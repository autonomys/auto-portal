import { describe, it, expect } from 'vitest';
import {
  calculateStakingAmounts,
  getValidationRules,
  validateStakingAmount,
  TRANSACTION_FEE,
} from '../staking-utils';
import type { UserPosition } from '@/types/position';
import { mockOperator } from './fixtures';

describe('calculateStakingAmounts', () => {
  it('calculates 20% storage fund and 80% net staking split correctly', () => {
    const calc = calculateStakingAmounts('100', 10);
    expect(calc.storageFund).toBe(20);
    expect(calc.netStaking).toBe(80);
    expect(calc.transactionFee).toBe(TRANSACTION_FEE);
    expect(calc.totalRequired).toBe(100 + TRANSACTION_FEE);
    expect(calc.expectedRewards).toBe(8); // 80 * 0.10
  });

  it('uses custom transaction fee when provided', () => {
    const calc = calculateStakingAmounts('50', 5, 0.005);
    expect(calc.transactionFee).toBe(0.005);
    expect(calc.totalRequired).toBe(50.005);
  });
});

describe('getValidationRules', () => {
  it('enforces minimum nomination stake on first nomination', () => {
    const rules = getValidationRules(mockOperator, 500, null);
    expect(rules.minimum).toBe(100);
    expect(rules.maximum).toBe(500);
  });

  it('waives minimum nomination stake when user has existing positionValue', () => {
    const existingPosition: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 50,
      storageFeeDeposit: 0,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    const rules = getValidationRules(mockOperator, 500, existingPosition);
    expect(rules.minimum).toBe(0);
  });

  it('waives minimum when only a storage fee deposit remains', () => {
    const storagePosition: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 10,
      pendingDeposit: null,
      pendingWithdrawals: [],
      status: 'active',
      lastUpdated: new Date(),
    };
    const rules = getValidationRules(mockOperator, 500, storagePosition);
    expect(rules.minimum).toBe(0);
  });

  it('waives minimum nomination stake when user has a pending deposit position', () => {
    const pendingPosition: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 0,
      pendingDeposit: { amount: 100, effectiveEpoch: 5 },
      pendingWithdrawals: [],
      status: 'pending',
      lastUpdated: new Date(),
    };
    const rules = getValidationRules(mockOperator, 500, pendingPosition);
    expect(rules.minimum).toBe(0);
  });

  it('enforces minimum nomination stake when user has fully exited and only has pending withdrawals', () => {
    const exitedPosition: UserPosition = {
      operatorId: '0',
      operatorName: 'Operator 0',
      positionValue: 0,
      storageFeeDeposit: 0,
      pendingDeposit: null,
      pendingWithdrawals: [
        {
          grossWithdrawalAmount: 100,
          stakeWithdrawalAmount: 80,
          storageFeeRefund: 20,
          unlockAtBlock: 1000,
        },
      ],
      status: 'withdrawing',
      lastUpdated: new Date(),
    };
    const rules = getValidationRules(mockOperator, 500, exitedPosition);
    expect(rules.minimum).toBe(100);
  });
});

describe('validateStakingAmount', () => {
  it('rejects empty or non-numeric amount', () => {
    const rules = { minimum: 100, maximum: 500, required: true, decimals: 8 };
    expect(validateStakingAmount('', rules).isValid).toBe(false);
    expect(validateStakingAmount('abc', rules).isValid).toBe(false);
  });

  it('validates amount against minimum nomination stake', () => {
    const rules = { minimum: 100, maximum: 500, required: true, decimals: 8 };
    const result = validateStakingAmount('50', rules);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('First nomination must be at least 100 AI3');
  });

  it('validates amount against available balance plus fee', () => {
    const rules = { minimum: 0, maximum: 100, required: true, decimals: 8 };
    const result = validateStakingAmount('100', rules, 0.01);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Insufficient balance for this amount plus transaction fees');
  });

  it('validates decimal precision limit', () => {
    const rules = { minimum: 0, maximum: 500, required: true, decimals: 4 };
    const result = validateStakingAmount('10.12345', rules);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Maximum 4 decimal places allowed');
  });
});
