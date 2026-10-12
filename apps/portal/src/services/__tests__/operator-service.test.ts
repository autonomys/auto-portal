import { describe, it, expect, vi, beforeEach } from 'vitest';
import { operatorService } from '../operator-service';
import { chainPulseClient } from '../chain-pulse-client';

vi.mock('../chain-pulse-client', () => ({
  chainPulseClient: {
    getOperators: vi.fn(),
    getOperator: vi.fn(),
    getSharePrices: vi.fn(),
  },
}));

describe('operator-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllOperators and getOperatorById', () => {
    it('fetches and maps operators with calculated pool values and fallback handling', async () => {
      vi.mocked(chainPulseClient.getOperators).mockResolvedValueOnce([
        {
          id: '1',
          domain_id: '0',
          owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          signing_key: '0x123',
          minimum_nominator_stake: '1000000000000000000', // 1 AI3
          nomination_tax: 5,
          total_stake: '100000000000000000000', // 100 AI3
          total_shares: '100000000000000000000',
          total_storage_fee_deposit: '10000000000000000000', // 10 AI3
          status: 'registered',
          nominator_count: 7,
        },
      ]);

      const service = await operatorService();
      const operators = await service.getAllOperators();

      expect(operators).toHaveLength(1);
      const op = operators[0];
      expect(op.id).toBe('1');
      expect(op.status).toBe('active');
      expect(op.totalStaked).toBe('100');
      expect(op.totalStorageFund).toBe('10');
      expect(op.totalPoolValue).toBe('110');
      expect(op.nominatorCount).toBe(7);
      expect(op.minimumNominatorStake).toBe('1');
    });

    it('returns empty array when getAllOperators fails', async () => {
      vi.mocked(chainPulseClient.getOperators).mockRejectedValueOnce(new Error('Network error'));

      const service = await operatorService();
      const ops = await service.getAllOperators();
      expect(ops).toEqual([]);
    });

    it('handles operator status mapping variations', async () => {
      vi.mocked(chainPulseClient.getOperators).mockResolvedValueOnce([
        {
          id: '2',
          domain_id: '0',
          owner_account: '5F...',
          signing_key: '0x...',
          minimum_nominator_stake: '0',
          nomination_tax: 0,
          total_stake: '0',
          total_shares: '0',
          total_storage_fee_deposit: '0',
          status: 'slashed',
          nominator_count: 0,
        },
        {
          id: '3',
          domain_id: '0',
          owner_account: '5F...',
          signing_key: '0x...',
          minimum_nominator_stake: '0',
          nomination_tax: 0,
          total_stake: '0',
          total_shares: '0',
          total_storage_fee_deposit: '0',
          status: 'deregistered',
          nominator_count: 0,
        },
        {
          id: '4',
          domain_id: '0',
          owner_account: '5F...',
          signing_key: '0x...',
          minimum_nominator_stake: '0',
          nomination_tax: 0,
          total_stake: '0',
          total_shares: '0',
          total_storage_fee_deposit: '0',
          status: 'unknown_status',
          nominator_count: 0,
        },
      ]);

      const service = await operatorService();
      const ops = await service.getAllOperators();
      expect(ops[0].status).toBe('slashed');
      expect(ops[1].status).toBe('inactive');
      expect(ops[2].status).toBe('degraded');
    });

    it('validates operatorId and fetches single operator', async () => {
      const service = await operatorService();
      expect(await service.getOperatorById('')).toBeNull();
      expect(await service.getOperatorById('   ')).toBeNull();

      vi.mocked(chainPulseClient.getOperator).mockResolvedValueOnce(null);
      expect(await service.getOperatorById('99')).toBeNull();

      vi.mocked(chainPulseClient.getOperator).mockRejectedValueOnce(new Error('Fetch failed'));
      expect(await service.getOperatorById('99')).toBeNull();
    });
  });

  describe('estimateOperatorReturnDetails', () => {
    it('validates input parameters', async () => {
      const service = await operatorService();
      expect(await service.estimateOperatorReturnDetails('', 30)).toBeNull();
      expect(await service.estimateOperatorReturnDetails('1', -5)).toBeNull();
      expect(await service.estimateOperatorReturnDetails('1', NaN)).toBeNull();
      expect(await service.estimateOperatorReturnDetails('1', 0)).toBeNull();
    });

    it('estimates return details accurately when share prices exist', async () => {
      const now = Date.now();
      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const latestRow = {
        operator_id: '1',
        domain_id: '0',
        epoch_index: 20,
        share_price: '1',
        total_stake: '1100000000000000000', // 1.1 shannons per share
        total_shares: '1000000000000000000',
        block_height: '200',
        timestamp: new Date(now).toISOString(),
      };
      const earliestRow = {
        operator_id: '1',
        domain_id: '0',
        epoch_index: 10,
        share_price: '1',
        total_stake: '1000000000000000000', // 1.0 shannons per share
        total_shares: '1000000000000000000',
        block_height: '100',
        timestamp: new Date(now - 30 * MS_PER_DAY).toISOString(),
      };

      vi.mocked(chainPulseClient.getSharePrices)
        .mockResolvedValueOnce([latestRow])
        .mockResolvedValueOnce([earliestRow]);

      const service = await operatorService();
      const details = await service.estimateOperatorReturnDetails('1', 30);

      expect(details).not.toBeNull();
      expect(details!.periodReturn).toBeGreaterThan(0);
      expect(details!.annualizedReturn).toBeGreaterThan(0);
    });

    it('returns null when rows are missing or price point calculation fails', async () => {
      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValueOnce([]);

      const service = await operatorService();
      const details = await service.estimateOperatorReturnDetails('1', 30);
      expect(details).toBeNull();
    });

    it('returns null when total_shares is zero or negative', async () => {
      const now = Date.now();
      const corruptRow = {
        operator_id: '1',
        domain_id: '0',
        epoch_index: 20,
        share_price: '1',
        total_stake: '1000',
        total_shares: '0',
        block_height: '200',
        timestamp: new Date(now).toISOString(),
      };

      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValue([corruptRow]);

      const service = await operatorService();
      const details = await service.estimateOperatorReturnDetails('1', 30);
      expect(details).toBeNull();
    });
  });

  describe('estimateOperatorReturnDetailsWindows and combined methods', () => {
    it('returns empty object for invalid operatorId or missing latest row', async () => {
      const service = await operatorService();
      expect(await service.estimateOperatorReturnDetailsWindows('')).toEqual({});

      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValueOnce([]);
      expect(await service.estimateOperatorReturnDetailsWindows('1')).toEqual({});
    });

    it('attaches return details in getOperatorWithApy and getOperatorWithApyWindows', async () => {
      const mockOp = {
        id: '1',
        domain_id: '0',
        owner_account: '5GrwvaEF...',
        signing_key: '0x...',
        minimum_nominator_stake: '1000000000000000000',
        nomination_tax: 5,
        total_stake: '100000000000000000000',
        total_shares: '100000000000000000000',
        total_storage_fee_deposit: '10000000000000000000',
        status: 'registered',
        nominator_count: 5,
      };

      vi.mocked(chainPulseClient.getOperator).mockResolvedValue(mockOp);
      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValue([]);

      const service = await operatorService();
      const opWithApy = await service.getOperatorWithApy('1', 30);
      expect(opWithApy).not.toBeNull();
      expect(opWithApy!.id).toBe('1');

      const opWithWindows = await service.getOperatorWithApyWindows('1');
      expect(opWithWindows).not.toBeNull();
      expect(opWithWindows!.estimatedReturnDetailsWindows).toEqual({});
    });

    it('returns null when operator does not exist in getOperatorWithApy', async () => {
      vi.mocked(chainPulseClient.getOperator).mockResolvedValue(null);

      const service = await operatorService();
      expect(await service.getOperatorWithApy('non-existent', 30)).toBeNull();
      expect(await service.getOperatorWithApyWindows('non-existent')).toBeNull();
    });
  });
});
