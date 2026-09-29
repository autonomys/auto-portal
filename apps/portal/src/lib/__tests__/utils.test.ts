import { describe, it, expect } from 'vitest';
import { shortenAddress, getNetworkBadge, isMainnet } from '../utils';

describe('shortenAddress', () => {
  it('shortens standard address with unicode ellipsis', () => {
    const addr = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(shortenAddress(addr, 4)).toBe('5Grwva…utQY');
  });

  it('respects custom length parameter', () => {
    const addr = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(shortenAddress(addr, 6)).toBe('5GrwvaEF…NoHGKutQY'.slice(0, 8) + '…' + addr.slice(-6));
  });

  it('returns empty string when addr is undefined or empty', () => {
    expect(shortenAddress(undefined)).toBe('');
    expect(shortenAddress('')).toBe('');
  });

  it('returns original address without duplicate ellipsis when short', () => {
    expect(shortenAddress('0x1234', 4)).toBe('0x1234');
    expect(shortenAddress('short-addr', 4)).toBe('short-addr');
  });
});

describe('getNetworkBadge', () => {
  it('returns brand variant for mainnet', () => {
    expect(getNetworkBadge('mainnet')).toEqual({
      label: 'MAINNET',
      variant: 'brand',
    });
  });

  it('returns warning variant for testnets (chronos, taurus)', () => {
    expect(getNetworkBadge('chronos')).toEqual({
      label: 'CHRONOS',
      variant: 'warning',
    });
    expect(getNetworkBadge('taurus')).toEqual({
      label: 'TAURUS',
      variant: 'warning',
    });
  });

  it('returns secondary variant for dev or other networks', () => {
    expect(getNetworkBadge('dev')).toEqual({
      label: 'DEV',
      variant: 'secondary',
    });
    expect(getNetworkBadge('local')).toEqual({
      label: 'LOCAL',
      variant: 'secondary',
    });
  });
});

describe('isMainnet', () => {
  it('returns true only for "mainnet"', () => {
    expect(isMainnet('mainnet')).toBe(true);
    expect(isMainnet('chronos')).toBe(false);
    expect(isMainnet('taurus')).toBe(false);
    expect(isMainnet('dev')).toBe(false);
  });
});
