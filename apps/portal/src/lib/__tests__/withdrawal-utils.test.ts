import { describe, it, expect } from 'vitest';
import { validateWithdrawal } from '../withdrawal-utils';
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
