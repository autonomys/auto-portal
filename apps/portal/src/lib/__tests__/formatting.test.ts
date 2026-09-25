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
    expect(formatPercentage(NaN)).toBe('0%');
    // @ts-expect-error test runtime boundary
    expect(formatPercentage(undefined)).toBe('0%');
    // @ts-expect-error test runtime boundary
    expect(formatPercentage(null)).toBe('0%');
  });
});

describe('formatCompactNumber', () => {
  it('formats values in the billions', () => {
    expect(formatCompactNumber(2_500_000_000)).toBe('2.5B');
  });

  it('formats values in the millions', () => {
    expect(formatCompactNumber(1_200_000)).toBe('1.2M');
  });

  it('formats values in the thousands', () => {
    expect(formatCompactNumber(45_000)).toBe('45.0K');
  });

  it('handles negative numbers with proper compaction and sign', () => {
    expect(formatCompactNumber(-2_500_000_000)).toBe('-2.5B');
    expect(formatCompactNumber(-1_500_000)).toBe('-1.5M');
    expect(formatCompactNumber(-45_000)).toBe('-45.0K');
    expect(formatCompactNumber(-500)).toBe('-500');
  });

  it('formats small numbers using standard formatNumber', () => {
    expect(formatCompactNumber(999)).toBe('999');
    expect(formatCompactNumber(0)).toBe('0');
  });

  it('returns 0 for NaN or invalid string', () => {
    expect(formatCompactNumber('invalid')).toBe('0');
    expect(formatCompactNumber(NaN)).toBe('0');
  });
});

describe('getAPYColor', () => {
  it('returns error colors for negative APY', () => {
    expect(getAPYColor(-2)).toBe('text-error-600');
    expect(getAPYColor(-2, { onDark: true })).toBe('text-error-400');
  });

  it('returns neutral color for small APY (< 5%)', () => {
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
  it('truncates standard long address with ellipsis', () => {
    const addr = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(truncateAddress(addr)).toBe('5Grwva...utQY');
  });

  it('returns short address untruncated when length <= start + end', () => {
    expect(truncateAddress('0x12345678')).toBe('0x12345678');
  });

  it('respects custom start and end lengths', () => {
    const addr = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(truncateAddress(addr, 4, 3)).toBe('5Grw...tQY');
  });
});

describe('formatTimeAgo', () => {
  it('returns "Just now" for current or future timestamps', () => {
    expect(formatTimeAgo(Date.now())).toBe('Just now');
    expect(formatTimeAgo(Date.now() + 5000)).toBe('Just now');
  });

  it('returns "Just now" for invalid or zero timestamps', () => {
    expect(formatTimeAgo(0)).toBe('Just now');
    expect(formatTimeAgo(-100)).toBe('Just now');
    expect(formatTimeAgo(NaN)).toBe('Just now');
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

  it('formats months and years ago for long periods', () => {
    const twoMonthsAgo = Date.now() - 65 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoMonthsAgo)).toBe('2mo ago');

    const twoYearsAgo = Date.now() - 750 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoYearsAgo)).toBe('2y ago');
  });
});
