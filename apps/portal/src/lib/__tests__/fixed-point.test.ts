import { describe, it, expect } from 'vitest';
import { FIXED_1E18, multiplySharesBySharePrice } from '../fixed-point';

describe('fixed-point math', () => {
  it('correctly multiplies shares by 1e18 unit share price (1.0 price)', () => {
    const shares = '1000000000000000000'; // 1 unit
    const price = FIXED_1E18.toString(); // 1.0 ratio
    expect(multiplySharesBySharePrice(shares, price)).toBe('1000000000000000000');
  });

  it('correctly calculates position value with appreciated share price (1.5 price)', () => {
    const shares = '2000000000000000000'; // 2 units
    const price = '1500000000000000000'; // 1.5 ratio
    expect(multiplySharesBySharePrice(shares, price)).toBe('3000000000000000000');
  });

  it('returns 0 for zero shares or zero price', () => {
    expect(multiplySharesBySharePrice('0', FIXED_1E18.toString())).toBe('0');
    expect(multiplySharesBySharePrice('1000000000000000000', '0')).toBe('0');
  });

  it('handles fractional precision scaling without loss', () => {
    const shares = '123456789012345678'; // ~0.123 units
    const price = '1000000000000000000';
    expect(multiplySharesBySharePrice(shares, price)).toBe('123456789012345678');
  });

  it('returns 0 for negative inputs', () => {
    expect(multiplySharesBySharePrice('-1000', FIXED_1E18.toString())).toBe('0');
    expect(multiplySharesBySharePrice('1000', '-1000')).toBe('0');
  });

  it('safely handles invalid or malformed strings by returning 0', () => {
    expect(multiplySharesBySharePrice('invalid', '1000')).toBe('0');
    expect(multiplySharesBySharePrice('1000', 'invalid')).toBe('0');
    expect(multiplySharesBySharePrice('', '')).toBe('0');
    expect(multiplySharesBySharePrice('1.5', '1000')).toBe('0');
  });
});
