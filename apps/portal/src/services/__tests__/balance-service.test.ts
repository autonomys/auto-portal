import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWalletBalance } from '../balance-service';
import { balance } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from '../api-service';

vi.mock('@autonomys/auto-consensus', () => ({
  balance: vi.fn(),
}));

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn(),
}));

describe('balance-service', () => {
  const mockApi = { query: {} };
  const testAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSharedApiConnection).mockResolvedValue(mockApi as never);
  });

  describe('fetchWalletBalance', () => {
    it('throws when address is missing, empty, or whitespace', async () => {
      await expect(fetchWalletBalance('')).rejects.toThrow(
        'Valid wallet address is required to fetch balance',
      );
      await expect(fetchWalletBalance('   ')).rejects.toThrow(
        'Valid wallet address is required to fetch balance',
      );
      await expect(fetchWalletBalance(null as unknown as string)).rejects.toThrow(
        'Valid wallet address is required to fetch balance',
      );
    });

    it('fetches balance and calculates free, reserved, and total AI3 correctly', async () => {
      vi.mocked(balance).mockResolvedValueOnce({
        free: 1000000000000000000n, // 1 AI3
        reserved: 500000000000000000n, // 0.5 AI3
        miscFrozen: 0n,
        feeFrozen: 0n,
      } as never);

      const res = await fetchWalletBalance(testAddress);

      expect(getSharedApiConnection).toHaveBeenCalledTimes(1);
      expect(balance).toHaveBeenCalledWith(mockApi, testAddress);
      expect(res.free).toBe('1');
      expect(res.reserved).toBe('0.5');
      expect(res.total).toBe('1.5');
    });

    it('handles zero balance properly', async () => {
      vi.mocked(balance).mockResolvedValueOnce({
        free: 0n,
        reserved: 0n,
        miscFrozen: 0n,
        feeFrozen: 0n,
      } as never);

      const res = await fetchWalletBalance(testAddress);

      expect(res.free).toBe('0');
      expect(res.reserved).toBe('0');
      expect(res.total).toBe('0');
    });

    it('wraps and propagates unexpected errors with descriptive diagnostic context', async () => {
      vi.mocked(balance).mockRejectedValueOnce(new Error('WebSocket connection dropped'));

      await expect(fetchWalletBalance(testAddress)).rejects.toThrow(
        `Failed to fetch wallet balance for ${testAddress}: WebSocket connection dropped`,
      );
    });
  });
});
