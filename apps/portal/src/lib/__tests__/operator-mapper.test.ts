import { describe, it, expect } from 'vitest';
import { mapRpcToOperator } from '../operator-mapper';
import type { OperatorDetails } from '@autonomys/auto-consensus';

describe('operator-mapper', () => {
  const validRpcOperator: OperatorDetails = {
    signingKey: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    currentDomainId: 0,
    nextDomainId: 0,
    currentTotalStake: 1000000000000000000n, // 1 AI3
    totalStorageFeeDeposit: 500000000000000000n, // 0.5 AI3
    minimumNominatorStake: 100000000000000000n, // 0.1 AI3
    nominationTax: 5,
    currentTotalShares: 1000000000000000000n,
    currentSharePrice: 1000000000000000000n,
    totalShares: 1000000000000000000n,
  } as unknown as OperatorDetails;

  it('maps valid RPC operator data to UI format', () => {
    const operator = mapRpcToOperator('1', validRpcOperator);

    expect(operator).not.toBeNull();
    expect(operator?.id).toBe('1');
    expect(operator?.name).toBe('Operator 1');
    expect(operator?.domainId).toBe('0');
    expect(operator?.ownerAccount).toBe(validRpcOperator.signingKey);
    expect(operator?.nominationTax).toBe(5);
    expect(operator?.minimumNominatorStake).toBe('0.1');
    expect(operator?.totalStaked).toBe('1');
    expect(operator?.totalStorageFund).toBe('0.5');
    expect(operator?.totalPoolValue).toBe('1.5');
    expect(operator?.status).toBe('active');
  });

  it('returns null if rpcData is null or undefined', () => {
    // @ts-expect-error testing runtime robustness
    expect(mapRpcToOperator('1', null)).toBeNull();
    // @ts-expect-error testing runtime robustness
    expect(mapRpcToOperator('1', undefined)).toBeNull();
  });

  it('returns null if signingKey is missing', () => {
    const operatorWithoutKey = {
      ...validRpcOperator,
      signingKey: null,
    } as unknown as OperatorDetails;

    expect(mapRpcToOperator('1', operatorWithoutKey)).toBeNull();
  });

  it('falls back to nextDomainId when currentDomainId is not set', () => {
    const operator = mapRpcToOperator('2', {
      ...validRpcOperator,
      currentDomainId: undefined,
      nextDomainId: 3,
    } as unknown as OperatorDetails);

    expect(operator?.domainId).toBe('3');
  });

  it('handles null and undefined stake values with zero defaults', () => {
    const operator = mapRpcToOperator('3', {
      signingKey: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    } as unknown as OperatorDetails);

    expect(operator).not.toBeNull();
    expect(operator?.totalStaked).toBe('0');
    expect(operator?.totalStorageFund).toBe('0');
    expect(operator?.totalPoolValue).toBe('0');
    expect(operator?.minimumNominatorStake).toBe('0');
    expect(operator?.nominationTax).toBe(0);
  });

  it('safely handles non-numeric or malformed stake values without throwing', () => {
    const operator = mapRpcToOperator('4', {
      signingKey: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      currentTotalStake: 'malformed_stake',
      totalStorageFeeDeposit: 'malformed_storage',
      minimumNominatorStake: 'malformed_min',
    } as unknown as OperatorDetails);

    expect(operator).not.toBeNull();
    expect(operator?.totalStaked).toBe('0');
    expect(operator?.totalStorageFund).toBe('0');
    expect(operator?.totalPoolValue).toBe('0');
    expect(operator?.minimumNominatorStake).toBe('0');
  });
});
