import { describe, it, expect } from 'vitest';
import { calculateApy, calculateReturnDetails, type PricePoint } from '../apy';

describe('APY Calculations', () => {
  describe('calculateApy', () => {
    it('calculates simple positive return over 365 days', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2024-01-01T00:00:00Z'), // exactly 365 days later
      };

      const apy = calculateApy(startPrice, endPrice);

      // 10% return over 365 days = 10% APY
      expect(apy).toBeCloseTo(0.1, 6);
    });

    it('calculates compound growth over shorter periods', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.05,
        date: new Date('2023-07-02T00:00:00Z'), // ~182 days
      };

      const apy = calculateApy(startPrice, endPrice);

      // 5% return over ~182 days should annualize to ~10.25%
      expect(apy).toBeCloseTo(0.1025, 3);
    });

    it('calculates negative returns correctly', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 0.9,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);

      // 10% loss over 365 days = -10% APY
      expect(apy).toBeCloseTo(-0.1, 6);
    });

    it('handles very small time periods', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.01,
        date: new Date('2023-01-02T00:00:00Z'), // 1 day
      };

      const apy = calculateApy(startPrice, endPrice);

      // 1% daily return should annualize to huge number
      expect(apy).toBeGreaterThan(36); // (1.01^365 - 1) ≈ 36.78
    });

    it('handles large price movements', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 10.0,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);

      // 900% return over 365 days = 900% APY
      expect(apy).toBeCloseTo(9.0, 6);
    });

    it('returns null for zero start price', () => {
      const startPrice = {
        price: 0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);
      expect(apy).toBeNull();
    });

    it('returns null for negative prices', () => {
      const startPrice = {
        price: -1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);
      expect(apy).toBeNull();
    });

    it('returns null for zero time difference', () => {
      const sameDate = new Date('2023-01-01T00:00:00Z');
      const startPrice = {
        price: 1.0,
        date: sameDate,
      };
      const endPrice = {
        price: 1.1,
        date: sameDate,
      };

      const apy = calculateApy(startPrice, endPrice);
      expect(apy).toBeNull();
    });

    it('returns null for negative time difference', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-02T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2023-01-01T00:00:00Z'), // earlier date
      };

      const apy = calculateApy(startPrice, endPrice);
      expect(apy).toBeNull();
    });

    it('returns null for missing data', () => {
      expect(calculateApy(null as unknown as PricePoint, null as unknown as PricePoint)).toBeNull();
      expect(calculateApy({} as unknown as PricePoint, {} as unknown as PricePoint)).toBeNull();
      expect(
        calculateApy(
          { price: 1.0 } as unknown as PricePoint,
          { price: 1.1 } as unknown as PricePoint,
        ),
      ).toBeNull();
    });
  });

  describe('calculateReturnDetails', () => {
    it('calculates detailed return information', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const details = calculateReturnDetails(startPrice, endPrice);

      expect(details).not.toBeNull();
      expect(details!.periodReturn).toBeCloseTo(0.1, 6); // 10% period return
      expect(details!.annualizedReturn).toBeCloseTo(0.1, 6); // 10% APY
      expect(details!.startDate).toEqual(startPrice.date);
      expect(details!.endDate).toEqual(endPrice.date);
    });

    it('calculates period return for shorter timeframes', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.05,
        date: new Date('2023-04-01T00:00:00Z'), // ~90 days
      };

      const details = calculateReturnDetails(startPrice, endPrice);

      expect(details).not.toBeNull();
      expect(details!.periodReturn).toBeCloseTo(0.05, 6); // 5% period return
      expect(details!.annualizedReturn).toBeGreaterThan(0.2); // Should be much higher when annualized
    });

    it('handles losses correctly', () => {
      const startPrice = {
        price: 1.0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 0.8,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const details = calculateReturnDetails(startPrice, endPrice);

      expect(details).not.toBeNull();
      expect(details!.periodReturn).toBeCloseTo(-0.2, 6); // 20% loss
      expect(details!.annualizedReturn).toBeCloseTo(-0.2, 6); // 20% annualized loss
    });

    it('returns null for invalid inputs', () => {
      const startPrice = {
        price: 0,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 1.1,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const details = calculateReturnDetails(startPrice, endPrice);
      expect(details).toBeNull();
    });
  });

  describe('Real-world scenarios', () => {
    it('handles typical staking returns', () => {
      // Simulate typical staking yield over 7 days
      const startPrice = {
        price: 1.0,
        date: new Date('2023-12-25T00:00:00Z'),
      };
      const endPrice = {
        price: 1.00274, // ~0.274% return over 7 days
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);

      // Should be around 15-16% APY (realistic staking return)
      expect(apy).toBeGreaterThan(0.14);
      expect(apy).toBeLessThan(0.16);
    });

    it('handles volatile periods', () => {
      // Large movement over short period
      const startPrice = {
        price: 1.0,
        date: new Date('2023-12-30T00:00:00Z'),
      };
      const endPrice = {
        price: 1.2,
        date: new Date('2023-12-31T00:00:00Z'), // 1 day, 20% gain
      };

      const apy = calculateApy(startPrice, endPrice);

      // 20% daily return would be astronomical when annualized
      expect(apy).toBeGreaterThan(1000); // Very large number
    });

    it('handles precision with small numbers', () => {
      const startPrice = {
        price: 0.0001,
        date: new Date('2023-01-01T00:00:00Z'),
      };
      const endPrice = {
        price: 0.00011,
        date: new Date('2024-01-01T00:00:00Z'),
      };

      const apy = calculateApy(startPrice, endPrice);

      // 10% return regardless of absolute size
      expect(apy).toBeCloseTo(0.1, 6);
    });

    it('handles epoch-based data with timestamps', () => {
      // Simulate data from the indexer with realistic epoch timestamps
      const startPrice = {
        price: 1.0523,
        date: new Date('2023-12-20T14:30:45Z'),
      };
      const endPrice = {
        price: 1.0612,
        date: new Date('2023-12-27T09:15:22Z'),
      };

      const details = calculateReturnDetails(startPrice, endPrice);

      expect(details).not.toBeNull();
      expect(details!.periodReturn).toBeCloseTo(0.00846, 4); // ~0.85% return
      expect(details!.annualizedReturn).toBeGreaterThan(0.4); // Should be high when annualized
    });
  });
});
