import { describe, it, expect } from 'vitest';
import { STORAGE_FUND_PERCENTAGE, STAKE_RATIO, STORAGE_FEE_FUNDS_PRIMER_URL } from '../staking';

describe('staking constants', () => {
  it('defines correct storage fund percentage and stake ratio', () => {
    expect(STORAGE_FUND_PERCENTAGE).toBe(0.2);
    expect(STAKE_RATIO).toBe(0.8);
  });

  it('points to the official Autonomys forum storage fee funds primer', () => {
    expect(STORAGE_FEE_FUNDS_PRIMER_URL).toBe(
      'https://forum.autonomys.xyz/t/storage-fee-funds-primer/4320',
    );
  });
});
