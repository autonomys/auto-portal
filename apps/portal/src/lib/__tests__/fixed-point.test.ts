import { describe, it, expect } from 'vitest';
import { FIXED_1E18, multiplySharesBySharePrice } from '../fixed-point';

describe('fixed-point', () => {
  describe('constants', () => {
    it('defines FIXED_1E18 as 10^18 BigInt', () => {
      expect(FIXED_1E18).toBe(1000000000000000000n);
    });
  });

  describe('multiplySharesBySharePrice', () => {
    it('multiplies 1 share by 1.0 unit share price', () => {
      const oneShare = '1000000000000000000';
      const unitPrice = '1000000000000000000';
      expect(multiplySharesBySharePrice(oneShare, unitPrice)).toBe('1000000000000000000');
    });

    it('correctly calculates appreciated share price value (1.5x)', () => {
      const shares = '10000000000000000000'; // 10 shares
      const price = '1500000000000000000'; // 1.5 price
      // (10 * 1.5) = 15 shares worth of value
      expect(multiplySharesBySharePrice(shares, price)).toBe('15000000000000000000');
    });

    it('correctly calculates fractional share price (0.5x)', () => {
      const shares = '4000000000000000000'; // 4 shares
      const price = '500000000000000000'; // 0.5 price
      // (4 * 0.5) = 2
      expect(multiplySharesBySharePrice(shares, price)).toBe('2000000000000000000');
    });

    it('returns 0 when shares is 0', () => {
      expect(multiplySharesBySharePrice('0', '1000000000000000000')).toBe('0');
    });

    it('returns 0 when price is 0', () => {
      expect(multiplySharesBySharePrice('1000000000000000000', '0')).toBe('0');
    });

    it('returns 0 when input string is invalid non-numeric string', () => {
      expect(multiplySharesBySharePrice('invalid', '1000000000000000000')).toBe('0');
      expect(multiplySharesBySharePrice('1000000000000000000', 'invalid')).toBe('0');
      expect(multiplySharesBySharePrice('', '')).toBe('0');
    });
  });
});
