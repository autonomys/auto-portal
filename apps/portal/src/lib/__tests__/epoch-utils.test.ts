import { describe, it, expect, vi } from 'vitest';
import { getCurrentDomainEpochIndex } from '../epoch-utils';
import * as apiService from '@/services/api-service';

describe('getCurrentDomainEpochIndex', () => {
  it('returns numeric epoch index when available as number', async () => {
    vi.spyOn(apiService, 'getSharedApiConnection').mockResolvedValue({
      query: {
        domains: {
          domainStakingSummary: vi.fn().mockResolvedValue({
            toPrimitive: () => ({ currentEpochIndex: 42 }),
          }),
        },
      },
    } as unknown as Awaited<ReturnType<typeof apiService.getSharedApiConnection>>);

    const result = await getCurrentDomainEpochIndex(0);
    expect(result).toBe(42);
    vi.restoreAllMocks();
  });

  it('parses valid numeric string epoch index', async () => {
    vi.spyOn(apiService, 'getSharedApiConnection').mockResolvedValue({
      query: {
        domains: {
          domainStakingSummary: vi.fn().mockResolvedValue({
            toPrimitive: () => ({ currentEpochIndex: '105' }),
          }),
        },
      },
    } as unknown as Awaited<ReturnType<typeof apiService.getSharedApiConnection>>);

    const result = await getCurrentDomainEpochIndex(0);
    expect(result).toBe(105);
    vi.restoreAllMocks();
  });

  it('returns null for empty, whitespace, or invalid non-numeric strings', async () => {
    vi.spyOn(apiService, 'getSharedApiConnection').mockResolvedValue({
      query: {
        domains: {
          domainStakingSummary: vi.fn().mockResolvedValue({
            toPrimitive: () => ({ currentEpochIndex: '' }),
          }),
        },
      },
    } as unknown as Awaited<ReturnType<typeof apiService.getSharedApiConnection>>);

    expect(await getCurrentDomainEpochIndex(0)).toBeNull();

    vi.spyOn(apiService, 'getSharedApiConnection').mockResolvedValue({
      query: {
        domains: {
          domainStakingSummary: vi.fn().mockResolvedValue({
            toPrimitive: () => ({ currentEpochIndex: 'invalid' }),
          }),
        },
      },
    } as unknown as Awaited<ReturnType<typeof apiService.getSharedApiConnection>>);

    expect(await getCurrentDomainEpochIndex(0)).toBeNull();
    vi.restoreAllMocks();
  });

  it('returns null and logs warning on query error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(apiService, 'getSharedApiConnection').mockRejectedValue(new Error('RPC failed'));

    const result = await getCurrentDomainEpochIndex(0);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('getCurrentDomainEpochIndex failed:', expect.any(Error));
    warnSpy.mockRestore();
    vi.restoreAllMocks();
  });
});
