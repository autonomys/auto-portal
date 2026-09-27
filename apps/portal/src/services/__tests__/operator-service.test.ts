import { describe, it, expect, vi, beforeEach } from 'vitest';
import { operatorService, toPricePoint, mapStatus } from '../operator-service';
import { chainPulseClient, type ChainPulseSharePrice } from '../chain-pulse-client';

vi.mock('../chain-pulse-client', () => ({
  chainPulseClient: {
    getOperators: vi.fn(),
    getOperator: vi.fn(),
    getSharePrices: vi.fn(),
  },
}));

const createMockRow = (overrides: Partial<ChainPulseSharePrice> = {}): ChainPulseSharePrice =>
  ({
    domain_id: '0',
    epoch_index: 0,
    share_price: '1000000000000000000',
    block_height: 100,
    operator_id: '1',
    total_shares: '1000000000000000000', // 1e18
    total_stake: '1500000000000000000', // 1.5e18
    timestamp: '2024-01-01T00:00:00Z',
    ...overrides,
  }) as ChainPulseSharePrice;

describe('operator-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toPricePoint', () => {
    it('calculates price point from valid share price row', () => {
      const row = createMockRow();

      const point = toPricePoint(row);
      expect(point).not.toBeNull();
      expect(point?.price).toBeCloseTo(1.5, 6);
      expect(point?.date.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('returns null for falsy row', () => {
      // @ts-expect-error testing runtime robustness
      expect(toPricePoint(null)).toBeNull();
      // @ts-expect-error testing runtime robustness
      expect(toPricePoint(undefined)).toBeNull();
    });

    it('returns null when total_shares is zero or negative', () => {
      const zeroShares = createMockRow({ total_shares: '0' });
      expect(toPricePoint(zeroShares)).toBeNull();

      const negativeShares = createMockRow({ total_shares: '-1000000000000000000' });
      expect(toPricePoint(negativeShares)).toBeNull();
    });

    it('returns null when total_stake is negative', () => {
      const negativeStake = createMockRow({ total_stake: '-500' });
      expect(toPricePoint(negativeStake)).toBeNull();
    });

    it('returns null when timestamp is invalid date', () => {
      const invalidDate = createMockRow({ timestamp: 'not-a-timestamp' });
      expect(toPricePoint(invalidDate)).toBeNull();
    });

    it('returns null when values cannot be parsed to BigInt', () => {
      const malformed = createMockRow({ total_shares: 'abc' });
      expect(toPricePoint(malformed)).toBeNull();
    });
  });

  describe('mapStatus', () => {
    it('maps recognized status strings correctly', () => {
      expect(mapStatus('registered')).toBe('active');
      expect(mapStatus('slashed')).toBe('slashed');
      expect(mapStatus('pending_slash')).toBe('slashed');
      expect(mapStatus('deregistered')).toBe('inactive');
      expect(mapStatus('deactivated')).toBe('inactive');
    });

    it('falls back to degraded for unknown status', () => {
      expect(mapStatus('unknown')).toBe('degraded');
      expect(mapStatus('')).toBe('degraded');
    });
  });

  describe('operatorService methods', () => {
    it('getAllOperators maps raw operators from chainPulseClient', async () => {
      const rawOperators = [
        {
          id: '0',
          domain_id: '0',
          owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          nomination_tax: 10,
          minimum_nominator_stake: '1000000000000000000',
          status: 'registered',
          total_stake: '2000000000000000000',
          total_storage_fee_deposit: '500000000000000000',
          nominator_count: 5,
        },
      ];
      vi.mocked(chainPulseClient.getOperators).mockResolvedValueOnce(rawOperators as any);

      const service = await operatorService();
      const operators = await service.getAllOperators();

      expect(operators.length).toBe(1);
      expect(operators[0].id).toBe('0');
      expect(operators[0].name).toBe('Operator 0');
      expect(operators[0].status).toBe('active');
      expect(operators[0].totalStaked).toBe('2');
      expect(operators[0].totalStorageFund).toBe('0.5');
      expect(operators[0].totalPoolValue).toBe('2.5');
      expect(operators[0].nominatorCount).toBe(5);
    });

    it('getOperatorById returns null when operator not found', async () => {
      vi.mocked(chainPulseClient.getOperator).mockResolvedValueOnce(null);

      const service = await operatorService();
      const op = await service.getOperatorById('999');

      expect(op).toBeNull();
      expect(chainPulseClient.getOperator).toHaveBeenCalledWith('999');
    });

    it('estimateOperatorReturnDetails returns null when no share price history exists', async () => {
      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValueOnce([]);

      const service = await operatorService();
      const returnDetails = await service.estimateOperatorReturnDetails('0', 7);

      expect(returnDetails).toBeNull();
    });
  });
});
