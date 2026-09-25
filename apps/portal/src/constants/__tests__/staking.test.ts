import { describe, it, expect } from 'vitest';
import { STORAGE_FUND_PERCENTAGE, STAKE_RATIO } from '../staking';

describe('staking constants', () => {
  it('defines correct storage fund percentage and stake ratio', () => {
    expect(STORAGE_FUND_PERCENTAGE).toBe(0.2);
    expect(STAKE_RATIO).toBe(0.8);
  });
});
