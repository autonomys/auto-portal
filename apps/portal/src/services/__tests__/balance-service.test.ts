import { describe, it, expect, vi } from 'vitest';
import { fetchWalletBalance } from '../balance-service';
import { balance } from '@autonomys/auto-consensus';

vi.mock('@autonomys/auto-consensus', () => ({
  balance: vi.fn(),
}));

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn().mockResolvedValue({}),
}));

describe('balanceService', () => {
  it('returns zero balances for empty or whitespace address', async () => {
    const res1 = await fetchWalletBalance('');
    expect(res1).toEqual({ free: '0', reserved: '0', total: '0' });

    const res2 = await fetchWalletBalance('   ');
    expect(res2).toEqual({ free: '0', reserved: '0', total: '0' });
  });

  it('correctly converts shannons to AI3 and sums total balance', async () => {
    // 1 AI3 = 10^18 shannons
    vi.mocked(balance).mockResolvedValueOnce({
      free: 1000000000000000000n, // 1 AI3
      reserved: 500000000000000000n, // 0.5 AI3
    } as any);

    const result = await fetchWalletBalance('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

    expect(result.free).toBe('1');
    expect(result.reserved).toBe('0.5');
    expect(result.total).toBe('1.5');
  });

  it('handles zero balances properly', async () => {
    vi.mocked(balance).mockResolvedValueOnce({
      free: 0n,
      reserved: 0n,
    } as any);

    const result = await fetchWalletBalance('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

    expect(result.free).toBe('0');
    expect(result.reserved).toBe('0');
    expect(result.total).toBe('0');
  });
});
