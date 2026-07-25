import { describe, it, expect } from 'vitest';
import { calculateInstantSharePrice, deriveStorageFundAccountId } from '../utils';
import { createStorageFundAccount } from '../db';
import { SHARES_CALCULATION_MULTIPLIER } from '../constants';

describe('calculateInstantSharePrice', () => {
  it('returns default multiplier when total shares is zero', () => {
    const price = calculateInstantSharePrice(BigInt(0), BigInt(0), BigInt(0), 0);
    expect(price).toBe(SHARES_CALCULATION_MULTIPLIER);
  });

  it('calculates instant share price correctly without rewards', () => {
    const totalStake = BigInt(1000) * SHARES_CALCULATION_MULTIPLIER;
    const totalShares = BigInt(1000) * SHARES_CALCULATION_MULTIPLIER;
    const price = calculateInstantSharePrice(totalStake, totalShares, BigInt(0), 0);
    expect(price).toBe(SHARES_CALCULATION_MULTIPLIER);
  });

  it('calculates instant share price with reward and nomination tax deduction', () => {
    const totalStake = BigInt(1000) * SHARES_CALCULATION_MULTIPLIER;
    const totalShares = BigInt(1000) * SHARES_CALCULATION_MULTIPLIER;
    const currentEpochReward = BigInt(100) * SHARES_CALCULATION_MULTIPLIER; // 100 reward
    const nominationTaxPercent = 10; // 10% tax -> 10 tax, 90 net reward

    const price = calculateInstantSharePrice(
      totalStake,
      totalShares,
      currentEpochReward,
      nominationTaxPercent,
    );

    // effectiveStake = 1000 + 90 = 1090
    // price = 1090 * SHARES_CALCULATION_MULTIPLIER / 1000 = 1.09 * SHARES_CALCULATION_MULTIPLIER
    const expectedPrice = (BigInt(1090) * SHARES_CALCULATION_MULTIPLIER) / BigInt(1000);
    expect(price).toBe(expectedPrice);
  });
});

describe('createStorageFundAccount', () => {
  it('creates StorageFundAccount entity with correct properties', () => {
    const timestamp = new Date('2026-07-25T12:00:00Z');
    const entity = createStorageFundAccount(
      'op-1',
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      BigInt(5000),
      timestamp,
      BigInt(100),
    );

    expect(entity.id).toBe('op-1');
    expect(entity.operatorId).toBe('op-1');
    expect(entity.address).toBe('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    expect(entity.balance).toBe(BigInt(5000));
    expect(entity.timestamp).toBe(timestamp);
    expect(entity.blockHeight).toBe(BigInt(100));
  });
});

describe('deriveStorageFundAccountId', () => {
  it('derives a valid Substrate SS58 storage fund account address for operatorId', () => {
    const addr1 = deriveStorageFundAccountId('1');
    const addr2 = deriveStorageFundAccountId('2');

    expect(typeof addr1).toBe('string');
    expect(addr1.length).toBeGreaterThan(30);
    expect(addr1).not.toBe(addr2); // Deterministic & unique per operatorId
    expect(addr1).toBe('5HCLhXQq7kWB9sqpcAiCFD8rFxKpxhRS6U3ABChVurHNEXVm');
  });
});
