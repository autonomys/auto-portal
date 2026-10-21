import { describe, it, expect, vi } from 'vitest';
import {
  calculateNetStakeWithdrawal,
  calculateStorageFeeRefund,
  checkMultipleWithdrawalsStatus,
  checkWithdrawalUnlockStatus,
  formatTimeRemaining,
  getWithdrawalPreview,
  validateWithdrawal,
} from '../withdrawal-utils';
import { mockOperator } from './fixtures';
import * as apiService from '@/services/api-service';

describe('withdrawal-utils', () => {
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

  describe('formatTimeRemaining', () => {
    it('handles invalid or non-positive values', () => {
      expect(formatTimeRemaining(NaN)).toBe('Unknown');
      expect(formatTimeRemaining(Infinity)).toBe('Unknown');
      expect(formatTimeRemaining(0)).toBe('Ready to unlock');
      expect(formatTimeRemaining(-10)).toBe('Ready to unlock');
    });

    it('formats seconds, minutes, and hours', () => {
      expect(formatTimeRemaining(45)).toBe('~45s');
      expect(formatTimeRemaining(125)).toBe('~2m 5s');
      expect(formatTimeRemaining(3665)).toBe('~1h 1m');
    });
  });

  describe('calculateStorageFeeRefund & calculateNetStakeWithdrawal', () => {
    it('calculates proportional storage fee refund', () => {
      expect(calculateStorageFeeRefund(0.5, 100)).toBe(50);
      expect(calculateStorageFeeRefund(1, 100)).toBe(100);
      expect(calculateStorageFeeRefund(NaN, 100)).toBe(0);
    });

    it('calculates net stake withdrawal', () => {
      expect(calculateNetStakeWithdrawal(100, 20)).toBe(80);
      expect(calculateNetStakeWithdrawal(50, 60)).toBe(0);
      expect(calculateNetStakeWithdrawal(NaN, 10)).toBe(0);
    });
  });

  describe('getWithdrawalPreview', () => {
    it('handles zero or negative totalPosition safely without NaN', () => {
      const preview = getWithdrawalPreview(100, 'partial', 0, 0);
      expect(preview.grossWithdrawalAmount).toBe(0);
      expect(preview.netStakeWithdrawal).toBe(0);
      expect(preview.storageFeeRefund).toBe(0);
      expect(preview.percentage).toBe(0);
      expect(preview.remainingPosition).toBe(0);
      expect(preview.remainingStorageFee).toBe(0);
    });

    it('calculates preview for partial withdrawal', () => {
      // Stake = 80, Storage = 20 (total = 100), withdraw 50 (50%)
      const preview = getWithdrawalPreview(50, 'partial', 80, 20);
      expect(preview.percentage).toBe(50);
      expect(preview.storageFeeRefund).toBe(10);
      expect(preview.netStakeWithdrawal).toBe(40);
      expect(preview.remainingPosition).toBe(40);
      expect(preview.remainingStorageFee).toBe(10);
    });

    it('calculates preview for full withdrawal', () => {
      const preview = getWithdrawalPreview(0, 'all', 80, 20);
      expect(preview.percentage).toBe(100);
      expect(preview.grossWithdrawalAmount).toBe(100);
      expect(preview.netStakeWithdrawal).toBe(80);
      expect(preview.storageFeeRefund).toBe(20);
      expect(preview.remainingPosition).toBe(0);
      expect(preview.remainingStorageFee).toBe(0);
    });
  });

  describe('checkWithdrawalUnlockStatus and checkMultipleWithdrawalsStatus', () => {
    it('handles invalid unlockAtBlock gracefully in checkWithdrawalUnlockStatus', async () => {
      const status = await checkWithdrawalUnlockStatus(0);
      expect(status.isUnlockable).toBe(false);
      expect(status.estimatedTimeRemaining).toBe('Unknown');
    });

    it('checks unlock status against currentDomainBlock', async () => {
      const statusUnlocked = await checkWithdrawalUnlockStatus(100, 105);
      expect(statusUnlocked.isUnlockable).toBe(true);
      expect(statusUnlocked.blocksRemaining).toBe(0);
      expect(statusUnlocked.estimatedTimeRemaining).toBe('Ready to unlock');

      const statusPending = await checkWithdrawalUnlockStatus(110, 100);
      expect(statusPending.isUnlockable).toBe(false);
      expect(statusPending.blocksRemaining).toBe(10);
      expect(statusPending.estimatedTimeRemaining).toBe('~1m 0s');
    });

    it('handles multiple withdrawals and network errors gracefully', async () => {
      expect(await checkMultipleWithdrawalsStatus([])).toEqual([]);

      vi.spyOn(apiService, 'getSharedApiConnection').mockRejectedValue(new Error('Network error'));
      const results = await checkMultipleWithdrawalsStatus([{ unlockAtBlock: 200 }]);
      expect(results.length).toBe(1);
      expect(results[0].isUnlockable).toBe(false);
      expect(results[0].estimatedTimeRemaining).toBe('Unknown');
      vi.restoreAllMocks();
    });
  });
});
