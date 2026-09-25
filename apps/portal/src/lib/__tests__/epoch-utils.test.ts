import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentDomainEpochIndex } from '../epoch-utils';
import { getSharedApiConnection } from '@/services/api-service';

vi.mock('@/services/api-service', () => ({
  getSharedApiConnection: vi.fn(),
}));

describe('epoch-utils', () => {
  const mockDomainStakingSummary = vi.fn();
  const mockApi = {
    query: {
      domains: {
        domainStakingSummary: mockDomainStakingSummary,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSharedApiConnection).mockResolvedValue(mockApi as any);
  });

  describe('getCurrentDomainEpochIndex', () => {
    it('extracts currentEpochIndex from codec object with toPrimitive method', async () => {
      mockDomainStakingSummary.mockResolvedValueOnce({
        toPrimitive: () => ({
          currentEpochIndex: 42,
          currentTotalStake: '1000000',
        }),
      });

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBe(42);
      expect(mockDomainStakingSummary).toHaveBeenCalledWith(0);
    });

    it('extracts numeric currentEpochIndex from plain object response', async () => {
      mockDomainStakingSummary.mockResolvedValueOnce({
        currentEpochIndex: 15,
      });

      const epoch = await getCurrentDomainEpochIndex(1);
      expect(epoch).toBe(15);
      expect(mockDomainStakingSummary).toHaveBeenCalledWith(1);
    });

    it('converts string currentEpochIndex to number', async () => {
      mockDomainStakingSummary.mockResolvedValueOnce({
        currentEpochIndex: '108',
      });

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBe(108);
    });

    it('returns null when currentEpochIndex is missing or invalid', async () => {
      mockDomainStakingSummary.mockResolvedValueOnce({
        currentEpochIndex: null,
      });

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBeNull();
    });

    it('returns null when summary is undefined or null', async () => {
      mockDomainStakingSummary.mockResolvedValueOnce(null);

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBeNull();
    });

    it('handles query error gracefully and returns null', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockDomainStakingSummary.mockRejectedValueOnce(new Error('RPC query failed'));

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('handles getSharedApiConnection rejection gracefully', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(getSharedApiConnection).mockRejectedValueOnce(
        new Error('WebSocket connection dropped'),
      );

      const epoch = await getCurrentDomainEpochIndex(0);
      expect(epoch).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
