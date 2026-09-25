import { describe, it, expect } from 'vitest';
import { mapRpcToOperator } from '../operator-mapper';
import type { OperatorDetails } from '@autonomys/auto-consensus';

describe('operatorMapper', () => {
  it('returns null when rpcData is missing or signingKey is null/undefined', () => {
    expect(mapRpcToOperator('1', null as any)).toBeNull();
    expect(mapRpcToOperator('1', undefined as any)).toBeNull();
    expect(
      mapRpcToOperator('1', {
        signingKey: null,
      } as any),
    ).toBeNull();
    expect(
      mapRpcToOperator('1', {
        signingKey: undefined,
      } as any),
    ).toBeNull();
  });

  it('correctly maps valid RPC operator details to an Operator object', () => {
    const mockRpcData: OperatorDetails = {
      signingKey: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currentDomainId: 0,
      nextDomainId: 1,
      nominationTax: 5,
      minimumNominatorStake: 1000000000000000000n, // 1 AI3
      currentTotalStake: 100000000000000000000n, // 100 AI3
      totalStorageFeeDeposit: 10000000000000000000n, // 10 AI3
    } as any;

    const op = mapRpcToOperator('42', mockRpcData);

    expect(op).not.toBeNull();
    expect(op?.id).toBe('42');
    expect(op?.name).toBe('Operator 42');
    expect(op?.domainId).toBe('0');
    expect(op?.domainName).toBe('Auto EVM');
    expect(op?.ownerAccount).toBe('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    expect(op?.nominationTax).toBe(5);
    expect(op?.minimumNominatorStake).toBe('1');
    expect(op?.status).toBe('active');
    expect(op?.totalStaked).toBe('100');
    expect(op?.totalStorageFund).toBe('10');
    expect(op?.totalPoolValue).toBe('110');
  });

  it('falls back to nextDomainId or default 0 when currentDomainId is not provided', () => {
    const mockWithNextDomain: OperatorDetails = {
      signingKey: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currentDomainId: undefined,
      nextDomainId: 2,
      currentTotalStake: 0n,
      totalStorageFeeDeposit: 0n,
    } as any;

    const opWithNext = mapRpcToOperator('10', mockWithNextDomain);
    expect(opWithNext?.domainId).toBe('2');

    const mockWithNoDomain: OperatorDetails = {
      signingKey: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currentDomainId: undefined,
      nextDomainId: undefined,
      currentTotalStake: 0n,
      totalStorageFeeDeposit: 0n,
    } as any;

    const opDefault = mapRpcToOperator('11', mockWithNoDomain);
    expect(opDefault?.domainId).toBe('0');
  });

  it('handles zero or missing values safely', () => {
    const mockMinimal: OperatorDetails = {
      signingKey: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      minimumNominatorStake: null,
      nominationTax: null,
      currentTotalStake: null,
      totalStorageFeeDeposit: null,
    } as any;

    const op = mapRpcToOperator('99', mockMinimal);
    expect(op).not.toBeNull();
    expect(op?.minimumNominatorStake).toBe('0');
    expect(op?.nominationTax).toBe(0);
    expect(op?.totalStaked).toBe('0');
    expect(op?.totalStorageFund).toBe('0');
    expect(op?.totalPoolValue).toBe('0');
  });
});
