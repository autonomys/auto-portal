import { describe, expect, it } from 'vitest';
import {
  formatAI3,
  formatCompactNumber,
  formatNumber,
  formatPercentage,
  formatTimeAgo,
  getAPYColor,
  truncateAddress,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(0)).toBe('0');
    });

    it('respects decimal places parameter', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1000, 2)).toBe('1,000.00');
    });

    it('parses string representations of numbers', () => {
      expect(formatNumber('5000')).toBe('5,000');
      expect(formatNumber('1234.5', 1)).toBe('1,234.5');
    });

    it('returns "0" for invalid non-number values', () => {
      expect(formatNumber('not-a-number')).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });
  });

  describe('formatAI3', () => {
    it('formats AI3 currency amounts with non-breaking space', () => {
      expect(formatAI3(100)).toBe('100.00\u00A0AI3');
      expect(formatAI3(1234.5, 2)).toBe('1,234.50\u00A0AI3');
      expect(formatAI3(0, 0)).toBe('0\u00A0AI3');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default 1 decimal place', () => {
      expect(formatPercentage(12.34)).toBe('12.3%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('respects custom decimal places', () => {
      expect(formatPercentage(12.3456, 2)).toBe('12.35%');
      expect(formatPercentage(5.5, 0)).toBe('6%');
    });

    it('handles non-finite values safely', () => {
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatPercentage(Infinity)).toBe('0%');
      expect(formatPercentage(-Infinity)).toBe('0%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats thousands with K suffix', () => {
      expect(formatCompactNumber(1000)).toBe('1.0K');
      expect(formatCompactNumber(15400)).toBe('15.4K');
    });

    it('formats millions with M suffix', () => {
      expect(formatCompactNumber(1_000_000)).toBe('1.0M');
      expect(formatCompactNumber(2_500_000)).toBe('2.5M');
    });

    it('formats billions with B suffix', () => {
      expect(formatCompactNumber(1_000_000_000)).toBe('1.0B');
      expect(formatCompactNumber(4_200_000_000)).toBe('4.2B');
    });

    it('formats negative large numbers with sign and suffix', () => {
      expect(formatCompactNumber(-1500)).toBe('-1.5K');
      expect(formatCompactNumber(-2_500_000)).toBe('-2.5M');
      expect(formatCompactNumber(-1_000_000_000)).toBe('-1.0B');
    });

    it('falls back to formatNumber for values below 1000', () => {
      expect(formatCompactNumber(500)).toBe('500');
      expect(formatCompactNumber(0)).toBe('0');
      expect(formatCompactNumber(-42)).toBe('-42');
    });

    it('handles invalid numbers safely', () => {
      expect(formatCompactNumber(NaN)).toBe('0');
      expect(formatCompactNumber('invalid')).toBe('0');
    });
  });

  describe('getAPYColor', () => {
    it('returns error styling for negative APY', () => {
      expect(getAPYColor(-2)).toBe('text-error-600');
      expect(getAPYColor(-2, { onDark: true })).toBe('text-error-400');
    });

    it('returns neutral styling for APY below 5', () => {
      expect(getAPYColor(2.5)).toBe('text-foreground');
      expect(getAPYColor(2.5, { onDark: true })).toBe('text-white');
    });

    it('returns appropriate success scale for APY >= 5', () => {
      expect(getAPYColor(7)).toBe('text-success-500');
      expect(getAPYColor(7, { onDark: true })).toBe('text-success-300');

      expect(getAPYColor(15)).toBe('text-success-600');
      expect(getAPYColor(15, { onDark: true })).toBe('text-success-400');

      expect(getAPYColor(25)).toBe('text-success-700');
      expect(getAPYColor(25, { onDark: true })).toBe('text-success-500');
    });
  });

  describe('truncateAddress', () => {
    const testAddr = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

    it('truncates address with default lengths (6 start, 4 end)', () => {
      expect(truncateAddress(testAddr)).toBe('5Grwva...utQY');
    });

    it('supports custom start and end lengths', () => {
      expect(truncateAddress(testAddr, 8, 6)).toBe('5GrwvaEF...GKutQY');
    });

    it('returns full address if within threshold', () => {
      expect(truncateAddress('short', 6, 4)).toBe('short');
      expect(truncateAddress('1234567890', 6, 4)).toBe('1234567890');
    });

    it('handles empty or nullish addresses safely', () => {
      expect(truncateAddress('')).toBe('');
      expect(truncateAddress(undefined as unknown as string)).toBe('');
    });
  });

  describe('formatTimeAgo', () => {
    it('formats recent timestamps as "Just now"', () => {
      const now = Date.now();
      expect(formatTimeAgo(now)).toBe('Just now');
      expect(formatTimeAgo(now - 10000)).toBe('Just now'); // 10 seconds ago
    });

    it('formats minutes ago', () => {
      const now = Date.now();
      expect(formatTimeAgo(now - 5 * 60 * 1000)).toBe('5m ago');
    });

    it('formats hours ago', () => {
      const now = Date.now();
      expect(formatTimeAgo(now - 3 * 3600 * 1000)).toBe('3h ago');
    });

    it('formats days ago', () => {
      const now = Date.now();
      expect(formatTimeAgo(now - 2 * 86400 * 1000)).toBe('2d ago');
    });

    it('handles future or invalid timestamps safely', () => {
      expect(formatTimeAgo(Date.now() + 60000)).toBe('Just now');
      expect(formatTimeAgo(0)).toBe('Just now');
      expect(formatTimeAgo(-100)).toBe('Just now');
      expect(formatTimeAgo(NaN)).toBe('Just now');
    });
  });
});
