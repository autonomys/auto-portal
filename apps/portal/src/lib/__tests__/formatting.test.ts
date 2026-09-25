import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatNumber,
  formatAI3,
  formatPercentage,
  formatCompactNumber,
  getAPYColor,
  truncateAddress,
  formatTimeAgo,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatNumber', () => {
    it('formats number with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('formats numeric strings', () => {
      expect(formatNumber('5000000')).toBe('5,000,000');
    });

    it('respects decimal precision parameter', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1000, 2)).toBe('1,000.00');
    });

    it('returns 0 for invalid inputs', () => {
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });
  });

  describe('formatAI3', () => {
    it('appends non-breaking space and AI3 currency symbol', () => {
      expect(formatAI3(100)).toBe('100.00\u00A0AI3');
      expect(formatAI3('1234.5')).toBe('1,234.50\u00A0AI3');
    });

    it('supports custom decimal precision', () => {
      expect(formatAI3(100, 4)).toBe('100.0000\u00A0AI3');
      expect(formatAI3(100, 0)).toBe('100\u00A0AI3');
    });
  });

  describe('formatPercentage', () => {
    it('formats numbers as percentage strings', () => {
      expect(formatPercentage(12.34)).toBe('12.3%');
      expect(formatPercentage(5)).toBe('5.0%');
    });

    it('supports custom decimal precision', () => {
      expect(formatPercentage(12.3456, 2)).toBe('12.35%');
      expect(formatPercentage(12.3456, 0)).toBe('12%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats values in billions with B suffix', () => {
      expect(formatCompactNumber(1_500_000_000)).toBe('1.5B');
      expect(formatCompactNumber('2000000000')).toBe('2.0B');
    });

    it('formats values in millions with M suffix', () => {
      expect(formatCompactNumber(2_500_000)).toBe('2.5M');
      expect(formatCompactNumber('10000000')).toBe('10.0M');
    });

    it('formats values in thousands with K suffix', () => {
      expect(formatCompactNumber(1_500)).toBe('1.5K');
      expect(formatCompactNumber('75000')).toBe('75.0K');
    });

    it('formats values under 1,000 using standard formatNumber', () => {
      expect(formatCompactNumber(999)).toBe('999');
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('returns 0 for invalid inputs', () => {
      expect(formatCompactNumber('invalid')).toBe('0');
    });
  });

  describe('getAPYColor', () => {
    it('returns error styling for negative APY', () => {
      expect(getAPYColor(-1)).toBe('text-error-600');
      expect(getAPYColor(-1, { onDark: true })).toBe('text-error-400');
    });

    it('returns neutral styling for low APY (< 5)', () => {
      expect(getAPYColor(3)).toBe('text-foreground');
      expect(getAPYColor(3, { onDark: true })).toBe('text-white');
    });

    it('returns progressive success colors for higher APY tiers', () => {
      // 5 <= APY < 10
      expect(getAPYColor(7)).toBe('text-success-500');
      expect(getAPYColor(7, { onDark: true })).toBe('text-success-300');

      // 10 <= APY < 20
      expect(getAPYColor(15)).toBe('text-success-600');
      expect(getAPYColor(15, { onDark: true })).toBe('text-success-400');

      // APY >= 20
      expect(getAPYColor(25)).toBe('text-success-700');
      expect(getAPYColor(25, { onDark: true })).toBe('text-success-500');
    });
  });

  describe('truncateAddress', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

    it('truncates address with default start (6) and end (4) lengths', () => {
      const truncated = truncateAddress(address);
      expect(truncated).toBe('5Grwva...utQY');
    });

    it('truncates address with custom lengths', () => {
      const truncated = truncateAddress(address, 8, 6);
      expect(truncated).toBe('5GrwvaEF...GKutQY');
    });

    it('returns original address if shorter than or equal to start + end lengths', () => {
      expect(truncateAddress('short', 3, 3)).toBe('short');
      expect(truncateAddress('1234567890', 5, 5)).toBe('1234567890');
    });
  });

  describe('formatTimeAgo', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats days ago', () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
    });

    it('formats hours ago', () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      const fiveHoursAgo = now - 5 * 60 * 60 * 1000;
      expect(formatTimeAgo(fiveHoursAgo)).toBe('5h ago');
    });

    it('formats minutes ago', () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      const twentyMinutesAgo = now - 20 * 60 * 1000;
      expect(formatTimeAgo(twentyMinutesAgo)).toBe('20m ago');
    });

    it('formats just now for durations under a minute', () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      const thirtySecondsAgo = now - 30 * 1000;
      expect(formatTimeAgo(thirtySecondsAgo)).toBe('Just now');
    });
  });
});
