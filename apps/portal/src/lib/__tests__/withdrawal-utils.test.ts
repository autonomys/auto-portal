import { describe, it, expect } from 'vitest';
import {
  validateWithdrawal,
  calculateStorageFeeRefund,
  calculateNetStakeWithdrawal,
  getWithdrawalPreview,
} from '../withdrawal-utils';
import { mockOperator } from './fixtures';

describe('validateWithdrawal', () => {
  it('allows full withdrawal when remaining stake is zero or negative', () => {
    const result = validateWithdrawal(500, 500, mockOperator, false);
    expect(result.isValid).toBe(true);
    expect(result.actualWithdrawalAmount).toBe(500);
  });

  it('warns nominator about auto-withdrawing all when remaining stake falls below minimum', () => {
    // Current stake = 150, withdraw = 100 -> remaining = 50 (< 100 min)
    const result = validateWithdrawal(100, 150, mockOperator, false);
    expect(result.isValid).toBe(true);
    expect(result.willWithdrawAll).toBe(true);
    expect(result.actualWithdrawalAmount).toBe(150);
    expect(result.warning).toContain('Remaining amount would be below minimum');
  });

  it('blocks operator owner from withdrawing below minimum stake', () => {
    const result = validateWithdrawal(100, 150, mockOperator, true);
    expect(result.isValid).toBe(false);
    expect(result.warning).toContain('Cannot leave less than 100 AI3');
  });

  it('allows partial withdrawal when remaining stake is above minimum', () => {
    const result = validateWithdrawal(100, 300, mockOperator, false);
    expect(result.isValid).toBe(true);
    expect(result.willWithdrawAll).toBeUndefined();
    expect(result.actualWithdrawalAmount).toBe(100);
  });
});

describe('calculateStorageFeeRefund', () => {
  it('calculates proportional storage fee refund accurately', () => {
    expect(calculateStorageFeeRefund(0.5, 20)).toBe(10);
    expect(calculateStorageFeeRefund(1, 20)).toBe(20);
    expect(calculateStorageFeeRefund(0, 20)).toBe(0);
  });
});

describe('calculateNetStakeWithdrawal', () => {
  it('subtracts storage fee refund from gross withdrawal amount', () => {
    expect(calculateNetStakeWithdrawal(100, 10)).toBe(90);
    expect(calculateNetStakeWithdrawal(50, 0)).toBe(50);
  });
});

describe('getWithdrawalPreview', () => {
  it('calculates preview for full withdrawal correctly', () => {
    // Total stake = 100, total storage fee = 20, gross requested = 120
    const preview = getWithdrawalPreview(120, 'all', 100, 20);
    expect(preview.withdrawalType).toBe('all');
    expect(preview.percentage).toBe(100);
    expect(preview.storageFeeRefund).toBe(20);
    expect(preview.netStakeWithdrawal).toBe(100);
    expect(preview.grossWithdrawalAmount).toBe(120);
    expect(preview.remainingPosition).toBe(0);
    expect(preview.remainingStorageFee).toBe(0);
  });

  it('calculates preview for partial withdrawal correctly', () => {
    // Total stake = 100, total storage fee = 20 (total position = 120)
    // Withdraw 60 (50% of position)
    const preview = getWithdrawalPreview(60, 'partial', 100, 20);
    expect(preview.withdrawalType).toBe('partial');
    expect(preview.percentage).toBe(50);
    expect(preview.storageFeeRefund).toBe(10);
    expect(preview.netStakeWithdrawal).toBe(50);
    expect(preview.grossWithdrawalAmount).toBe(60);
    expect(preview.remainingPosition).toBe(50);
    expect(preview.remainingStorageFee).toBe(10);
  });

  it('caps percentage at 100% when gross requested exceeds total position', () => {
    const preview = getWithdrawalPreview(200, 'partial', 100, 20);
    expect(preview.percentage).toBe(100);
    expect(preview.storageFeeRefund).toBe(20);
    expect(preview.netStakeWithdrawal).toBe(180);
    expect(preview.remainingPosition).toBe(0);
    expect(preview.remainingStorageFee).toBe(0);
  });
});
