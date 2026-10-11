import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { realChainPulseClient } from '../chain-pulse-client';

describe('realChainPulseClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches operators list successfully', async () => {
    const mockOperators = [
      {
        id: '1',
        domain_id: '0',
        owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        signing_key: '0x123',
        minimum_nominator_stake: '1000',
        nomination_tax: 5,
        total_stake: '5000',
        total_shares: '5000',
        total_storage_fee_deposit: '100',
        status: 'registered',
        nominator_count: 2,
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOperators,
    } as Response);

    const operators = await realChainPulseClient.getOperators();
    expect(operators).toEqual(mockOperators);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/staking/operators'),
      expect.objectContaining({ signal: undefined }),
    );
  });

  it('fetches single operator by id', async () => {
    const mockOperator = {
      id: '42',
      domain_id: '0',
      owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      signing_key: '0x456',
      minimum_nominator_stake: '2000',
      nomination_tax: 10,
      total_stake: '10000',
      total_shares: '10000',
      total_storage_fee_deposit: '200',
      status: 'registered',
      nominator_count: 5,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOperator,
    } as Response);

    const operator = await realChainPulseClient.getOperator('42');
    expect(operator).toEqual(mockOperator);
  });

  it('returns null when operator is not found or fetch fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const operator = await realChainPulseClient.getOperator('999');
    expect(operator).toBeNull();
  });

  it('constructs query parameters correctly for getSharePrices', async () => {
    const mockSharePrices = [
      {
        operator_id: '1',
        domain_id: '0',
        epoch_index: 10,
        share_price: '1000000000000000000',
        total_stake: '5000',
        total_shares: '5000',
        block_height: '100',
        timestamp: '2026-01-01T00:00:00Z',
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSharePrices,
    } as Response);

    const result = await realChainPulseClient.getSharePrices('1', {
      since: '2026-01-01T00:00:00Z',
      until: '2026-01-02T00:00:00Z',
      limit: 50,
    });

    expect(result).toEqual(mockSharePrices);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/v1\/staking\/operators\/1\/share-prices\?since=2026-01-01T00%3A00%3A00Z&until=2026-01-02T00%3A00%3A00Z&limit=50/,
      ),
      expect.anything(),
    );
  });

  it('constructs query parameters correctly for getDeposits', async () => {
    const mockDeposits = [
      {
        operator_id: '1',
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '1000',
        storage_fee: '10',
        block_height: 50,
        timestamp: '2026-01-01T00:00:00Z',
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDeposits,
    } as Response);

    const result = await realChainPulseClient.getDeposits(
      '1',
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      { limit: 20, offset: 5 },
    );

    expect(result).toEqual(mockDeposits);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/v1\/staking\/operators\/1\/deposits\?address=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY&limit=20&offset=5/,
      ),
      expect.anything(),
    );
  });

  it('constructs query parameters correctly for getWithdrawals', async () => {
    const mockWithdrawals = [
      {
        operator_id: '1',
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        shares: '500',
        amount: '0',
        storage_fee_refund: '5',
        block_height: 60,
        timestamp: '2026-01-01T00:00:00Z',
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockWithdrawals,
    } as Response);

    const result = await realChainPulseClient.getWithdrawals(
      '1',
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      { limit: 10, offset: 0 },
    );

    expect(result).toEqual(mockWithdrawals);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/v1\/staking\/operators\/1\/withdrawals\?address=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY&limit=10&offset=0/,
      ),
      expect.anything(),
    );
  });

  it('encodes address in getNominatorOperatorIds', async () => {
    const mockIds = ['1', '2', '3'];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockIds,
    } as Response);

    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const result = await realChainPulseClient.getNominatorOperatorIds(address);

    expect(result).toEqual(mockIds);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `/v1/staking/nominators/operators?address=${encodeURIComponent(address)}`,
      ),
      expect.anything(),
    );
  });

  it('deduplicates concurrent in-flight requests to the same endpoint', async () => {
    let resolveFirstFetch!: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFirstFetch = resolve;
    });

    globalThis.fetch = vi.fn().mockReturnValue(fetchPromise);

    const req1 = realChainPulseClient.getOperators();
    const req2 = realChainPulseClient.getOperators();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    resolveFirstFetch({
      ok: true,
      status: 200,
      json: async () => [{ id: '1' }],
    });

    const [res1, res2] = await Promise.all([req1, req2]);
    expect(res1).toEqual([{ id: '1' }]);
    expect(res2).toEqual([{ id: '1' }]);
  });
});
