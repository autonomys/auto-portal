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

describe('operatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllOperators', () => {
    it('maps chain pulse operators to frontend Operator objects with correct status and balances', async () => {
      vi.mocked(chainPulseClient.getOperators).mockResolvedValueOnce([
        {
          id: '0',
          domain_id: '0',
          owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          signing_key: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          nomination_tax: 5,
          minimum_nominator_stake: '10000000000000000000', // 10 AI3
          total_stake: '100000000000000000000', // 100 AI3
          total_shares: '100000000000000000000',
          total_storage_fee_deposit: '5000000000000000000', // 5 AI3
          nominator_count: 3,
          status: 'active',
        },
        {
          id: '1',
          domain_id: '0',
          owner_account: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          signing_key: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          nomination_tax: 10,
          minimum_nominator_stake: '0',
          total_stake: '50000000000000000000', // 50 AI3
          total_shares: '50000000000000000000',
          total_storage_fee_deposit: '0',
          nominator_count: 1,
          status: 'registered',
        },
        {
          id: '2',
          domain_id: '0',
          owner_account: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXoS59Y',
          signing_key: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXoS59Y',
          nomination_tax: 0,
          minimum_nominator_stake: '0',
          total_stake: '0',
          total_shares: '0',
          total_storage_fee_deposit: '0',
          nominator_count: 0,
          status: 'slashed',
        },
      ]);

      const service = await operatorService();
      const operators = await service.getAllOperators();

      expect(operators).toHaveLength(3);

      const op0 = operators[0];
      expect(op0.id).toBe('0');
      expect(op0.name).toBe('Operator 0');
      expect(op0.status).toBe('active');
      expect(op0.minimumNominatorStake).toBe('10');
      expect(op0.totalStaked).toBe('100');
      expect(op0.totalStorageFund).toBe('5');
      expect(op0.totalPoolValue).toBe('105');
      expect(op0.nominatorCount).toBe(3);

      const op1 = operators[1];
      expect(op1.id).toBe('1');
      expect(op1.status).toBe('active'); // 'registered' maps to active

      const op2 = operators[2];
      expect(op2.id).toBe('2');
      expect(op2.status).toBe('slashed');
    });
  });

  describe('getOperatorById', () => {
    it('returns mapped operator when found', async () => {
      vi.mocked(chainPulseClient.getOperator).mockResolvedValueOnce({
        id: '42',
        domain_id: '0',
        owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        signing_key: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        nomination_tax: 2,
        minimum_nominator_stake: '5000000000000000000',
        total_stake: '20000000000000000000',
        total_shares: '20000000000000000000',
        total_storage_fee_deposit: '0',
        nominator_count: 7,
        status: 'deregistered',
      });

      const service = await operatorService();
      const op = await service.getOperatorById('42');

      expect(op).not.toBeNull();
      expect(op?.id).toBe('42');
      expect(op?.status).toBe('inactive');
      expect(op?.nominatorCount).toBe(7);
    });

    it('returns null when operator is not found', async () => {
      vi.mocked(chainPulseClient.getOperator).mockResolvedValueOnce(null as any);

      const service = await operatorService();
      const op = await service.getOperatorById('999');

      expect(op).toBeNull();
    });
  });

  describe('estimateOperatorReturnDetails', () => {
    it('returns null when no share price history exists', async () => {
      vi.mocked(chainPulseClient.getSharePrices).mockResolvedValueOnce([]);

      const service = await operatorService();
      const res = await service.estimateOperatorReturnDetails('0', 7);

      expect(res).toBeNull();
    });
  });
});
