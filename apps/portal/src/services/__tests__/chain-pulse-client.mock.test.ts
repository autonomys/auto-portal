import { describe, it, expect } from 'vitest';
import { mockChainPulseClient, MOCK_OPERATORS } from '../chain-pulse-client.mock';

describe('mockChainPulseClient', () => {
  it('returns mock operators list', async () => {
    const operators = await mockChainPulseClient.getOperators();
    expect(operators).toEqual(MOCK_OPERATORS);
    expect(operators).toHaveLength(3);
  });

  it('throws on unmocked methods', async () => {
    await expect(mockChainPulseClient.getSharePrices('1')).rejects.toThrow(
      'getSharePrices: not implemented in mock mode',
    );
    await expect(mockChainPulseClient.getDeposits('1', '0x123')).rejects.toThrow(
      'getDeposits: not implemented in mock mode',
    );
    await expect(mockChainPulseClient.getWithdrawals('1', '0x123')).rejects.toThrow(
      'getWithdrawals: not implemented in mock mode',
    );
    await expect(mockChainPulseClient.getNominatorOperatorIds('0x123')).rejects.toThrow(
      'getNominatorOperatorIds: not implemented in mock mode',
    );
  });
});
