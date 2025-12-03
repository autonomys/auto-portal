import { describe, it, expect } from 'vitest';
import { calculateReturnDetails } from '../apy';

describe('APY Calculations', () => {
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
