import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatAI3,
  formatPercentage,
  formatCompactNumber,
  getAPYColor,
  truncateAddress,
  formatTimeAgo,
} from '../formatting';

describe('formatNumber', () => {
  it('formats positive integers with thousand separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats decimal numbers to requested precision', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    expect(formatNumber(1234.5, 3)).toBe('1,234.500');
  });

  it('parses numeric string inputs correctly', () => {
    expect(formatNumber('9876543.21', 2)).toBe('9,876,543.21');
  });

  it('returns 0 for NaN and invalid numeric strings', () => {
    expect(formatNumber('invalid')).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
  });

  it('safely clamps out-of-bounds decimal parameters', () => {
    expect(formatNumber(123.456, -2)).toBe('123');
    expect(formatNumber(123.456, 25)).toBeDefined();
  });
});

describe('formatAI3', () => {
  it('formats AI3 currency with non-breaking space suffix', () => {
    expect(formatAI3(1234.5)).toBe('1,234.50\u00A0AI3');
    expect(formatAI3('50')).toBe('50.00\u00A0AI3');
  });

  it('respects custom decimal places', () => {
    expect(formatAI3(1234.5678, 4)).toBe('1,234.5678\u00A0AI3');
  });
});

describe('formatPercentage', () => {
  it('formats numeric percentage with default precision', () => {
    expect(formatPercentage(12.345)).toBe('12.3%');
    expect(formatPercentage(5)).toBe('5.0%');
  });

  it('respects custom decimal places', () => {
    expect(formatPercentage(12.3456, 2)).toBe('12.35%');
  });

  it('safely handles null, undefined, and NaN inputs', () => {
    expect(formatPercentage(NaN)).toBe('--');
    // @ts-expect-error test runtime boundary
    expect(formatPercentage(undefined)).toBe('--');
    // @ts-expect-error test runtime boundary
    expect(formatPercentage(null)).toBe('--');
  });
});

describe('formatCompactNumber', () => {
  it('returns "0" for invalid inputs or NaN', () => {
    expect(formatCompactNumber(NaN)).toBe('0');
    expect(formatCompactNumber('invalid')).toBe('0');
  });

  it('formats numbers under 1,000 using standard formatNumber', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(42)).toBe('42');
    expect(formatCompactNumber(999)).toBe('999');
    expect(formatCompactNumber('500')).toBe('500');
  });

  it('formats thousands with "K" suffix', () => {
    expect(formatCompactNumber(1_000)).toBe('1.0K');
    expect(formatCompactNumber(12_500)).toBe('12.5K');
    expect(formatCompactNumber(999_900)).toBe('999.9K');
  });

  it('formats millions with "M" suffix', () => {
    expect(formatCompactNumber(1_000_000)).toBe('1.0M');
    expect(formatCompactNumber(2_500_000)).toBe('2.5M');
  });

  it('formats billions with "B" suffix', () => {
    expect(formatCompactNumber(1_000_000_000)).toBe('1.0B');
    expect(formatCompactNumber(5_430_000_000)).toBe('5.4B');
  });

  it('correctly handles negative values preserving sign', () => {
    expect(formatCompactNumber(-500)).toBe('-500');
    expect(formatCompactNumber(-2_500)).toBe('-2.5K');
    expect(formatCompactNumber(-3_000_000)).toBe('-3.0M');
    expect(formatCompactNumber(-4_000_000_000)).toBe('-4.0B');
  });
});

describe('getAPYColor', () => {
  it('returns error colors for negative APY', () => {
    expect(getAPYColor(-2)).toBe('text-error-600');
    expect(getAPYColor(-2, { onDark: true })).toBe('text-error-400');
  });

  it('handles exact threshold values at 0, 5, 10, and 20', () => {
    expect(getAPYColor(0)).toBe('text-foreground');
    expect(getAPYColor(0, { onDark: true })).toBe('text-white');

    expect(getAPYColor(5)).toBe('text-success-500');
    expect(getAPYColor(5, { onDark: true })).toBe('text-success-300');

    expect(getAPYColor(10)).toBe('text-success-600');
    expect(getAPYColor(10, { onDark: true })).toBe('text-success-400');

    expect(getAPYColor(20)).toBe('text-success-700');
    expect(getAPYColor(20, { onDark: true })).toBe('text-success-500');
  });

  it('returns neutral color for small positive APY (< 5%)', () => {
    expect(getAPYColor(3)).toBe('text-foreground');
    expect(getAPYColor(3, { onDark: true })).toBe('text-white');
  });

  it('returns green tiers for higher APYs', () => {
    expect(getAPYColor(7)).toBe('text-success-500');
    expect(getAPYColor(7, { onDark: true })).toBe('text-success-300');
    expect(getAPYColor(15)).toBe('text-success-600');
    expect(getAPYColor(15, { onDark: true })).toBe('text-success-400');
    expect(getAPYColor(25)).toBe('text-success-700');
    expect(getAPYColor(25, { onDark: true })).toBe('text-success-500');
  });
});

describe('truncateAddress', () => {
  it('returns address untruncated when length is within startLength + endLength', () => {
    expect(truncateAddress('0x12345678')).toBe('0x12345678');
    expect(truncateAddress('short', 3, 3)).toBe('short');
  });

  it('truncates longer address with default 6 prefix and 4 suffix characters', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(truncateAddress(address)).toBe('5Grwva...utQY');
  });

  it('respects custom startLength and endLength', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(truncateAddress(address, 4, 4)).toBe('5Grw...utQY');
    expect(truncateAddress(address, 8, 2)).toBe('5GrwvaEF...QY');
  });
});

describe('formatTimeAgo', () => {
  it('returns "Just now" for current or future timestamps', () => {
    expect(formatTimeAgo(Date.now())).toBe('Just now');
    expect(formatTimeAgo(Date.now() + 5000)).toBe('Just now');
  });

  it('returns "-" for invalid or zero timestamps', () => {
    expect(formatTimeAgo(0)).toBe('-');
    expect(formatTimeAgo(-100)).toBe('-');
    expect(formatTimeAgo(NaN)).toBe('-');
  });

  it('formats exact thresholds for 1 minute, 1 hour, and 1 day', () => {
    const now = Date.now();
    expect(formatTimeAgo(now - 60 * 1000)).toBe('1m ago');
    expect(formatTimeAgo(now - 59 * 1000)).toBe('Just now');

    expect(formatTimeAgo(now - 60 * 60 * 1000)).toBe('1h ago');
    expect(formatTimeAgo(now - (59 * 60 + 59) * 1000)).toBe('59m ago');

    expect(formatTimeAgo(now - 24 * 60 * 60 * 1000)).toBe('1d ago');
    expect(formatTimeAgo(now - (23 * 60 * 60 + 59 * 60) * 1000)).toBe('23h ago');
  });

  it('formats minutes ago', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('formats days ago', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
  });

  it('formats days ago for long periods preserving day precision', () => {
    const twoMonthsAgo = Date.now() - 65 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoMonthsAgo)).toBe('65d ago');

    const twoYearsAgo = Date.now() - 750 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoYearsAgo)).toBe('750d ago');
  });
});
