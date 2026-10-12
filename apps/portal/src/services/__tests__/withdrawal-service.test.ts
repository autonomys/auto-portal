import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withdrawalService, type WithdrawalParams, type UnlockParams } from '../withdrawal-service';
import { unlockFunds, withdrawStakeAll, withdrawStakeByValue } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from '../api-service';
import { signAndSendTx } from '../tx-utils';

vi.mock('@autonomys/auto-consensus', () => ({
  unlockFunds: vi.fn(),
  withdrawStakeAll: vi.fn(),
  withdrawStakeByValue: vi.fn(),
}));

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn(),
}));

vi.mock('../tx-utils', () => ({
  signAndSendTx: vi.fn(),
  isUserCancellationError: vi.fn((err: unknown) => {
    if (err instanceof Error) {
      return (
        err.message.includes('Cancelled') ||
        err.message.includes('Rejected') ||
        err.message.includes('User cancelled')
      );
    }
    return false;
  }),
}));

describe('withdrawal-service', () => {
  const mockApi = { query: {} };
  const mockTx = {
    paymentInfo: vi.fn(),
  };
  const testAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const mockInjector = {
    signer: { signPayload: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSharedApiConnection).mockResolvedValue(mockApi as never);
    vi.mocked(withdrawStakeAll).mockResolvedValue(mockTx as never);
    vi.mocked(withdrawStakeByValue).mockResolvedValue(mockTx as never);
    vi.mocked(unlockFunds).mockResolvedValue(mockTx as never);
  });

  describe('createWithdrawTransaction', () => {
    it('validates input parameters', async () => {
      await expect(
        withdrawalService.createWithdrawTransaction(
          null as unknown as WithdrawalParams,
          testAddress,
        ),
      ).rejects.toThrow('Withdrawal parameters are required');

      await expect(
        withdrawalService.createWithdrawTransaction(
          { operatorId: '', withdrawalType: 'all' },
          testAddress,
        ),
      ).rejects.toThrow('Valid operator ID is required');

      await expect(
        withdrawalService.createWithdrawTransaction({ operatorId: '0', withdrawalType: 'all' }, ''),
      ).rejects.toThrow('Valid sender address is required');

      await expect(
        withdrawalService.createWithdrawTransaction(
          { operatorId: '0', withdrawalType: 'unknown' as never },
          testAddress,
        ),
      ).rejects.toThrow('Unsupported withdrawal type');

      await expect(
        withdrawalService.createWithdrawTransaction(
          { operatorId: '0', withdrawalType: 'partial' },
          testAddress,
        ),
      ).rejects.toThrow('Amount must be a positive number for partial withdrawal');

      await expect(
        withdrawalService.createWithdrawTransaction(
          { operatorId: '0', withdrawalType: 'partial', amount: 0 },
          testAddress,
        ),
      ).rejects.toThrow('Amount must be a positive number for partial withdrawal');
    });

    it('creates withdrawStakeAll transaction when withdrawalType is all', async () => {
      const tx = await withdrawalService.createWithdrawTransaction(
        { operatorId: ' 1 ', withdrawalType: 'all' },
        testAddress,
      );

      expect(withdrawStakeAll).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: '1',
        account: testAddress,
      });
      expect(tx).toBe(mockTx);
    });

    it('creates withdrawStakeByValue transaction when withdrawalType is partial', async () => {
      const tx = await withdrawalService.createWithdrawTransaction(
        { operatorId: ' 1 ', withdrawalType: 'partial', amount: 3.5 },
        testAddress,
      );

      expect(withdrawStakeByValue).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: '1',
        account: testAddress,
        amountToWithdraw: 3500000000000000000n,
      });
      expect(tx).toBe(mockTx);
    });
  });

  describe('createUnlockTransaction', () => {
    it('validates operatorId', async () => {
      await expect(
        withdrawalService.createUnlockTransaction(null as unknown as UnlockParams),
      ).rejects.toThrow('Unlock parameters are required');

      await expect(
        withdrawalService.createUnlockTransaction({ operatorId: '', unlockType: 'funds' }),
      ).rejects.toThrow('Valid operator ID is required');
    });

    it('creates unlockFunds transaction', async () => {
      const tx = await withdrawalService.createUnlockTransaction({
        operatorId: ' 2 ',
        unlockType: 'funds',
      });

      expect(unlockFunds).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: '2',
      });
      expect(tx).toBe(mockTx);
    });
  });

  describe('fee estimations', () => {
    it('estimates withdrawal fee and handles errors', async () => {
      await expect(
        withdrawalService.estimateWithdrawalFee({ operatorId: '0', withdrawalType: 'all' }, ''),
      ).rejects.toThrow('Valid sender address is required');

      mockTx.paymentInfo.mockResolvedValueOnce({
        partialFee: { toString: () => '20000000000000000' }, // 0.02 AI3
      });

      const fee = await withdrawalService.estimateWithdrawalFee(
        { operatorId: '0', withdrawalType: 'all' },
        testAddress,
      );
      expect(fee).toBe(0.02);

      // Fallback
      mockTx.paymentInfo.mockRejectedValueOnce(new Error('Fee RPC error'));
      const fallbackFee = await withdrawalService.estimateWithdrawalFee(
        { operatorId: '0', withdrawalType: 'all' },
        testAddress,
      );
      expect(fallbackFee).toBe(0.01);
    });

    it('estimates unlock fee and handles errors', async () => {
      await expect(
        withdrawalService.estimateUnlockFee({ operatorId: '0', unlockType: 'funds' }, ''),
      ).rejects.toThrow('Valid sender address is required');

      mockTx.paymentInfo.mockResolvedValueOnce({
        partialFee: { toString: () => '15000000000000000' }, // 0.015 AI3
      });

      const fee = await withdrawalService.estimateUnlockFee(
        { operatorId: '0', unlockType: 'funds' },
        testAddress,
      );
      expect(fee).toBe(0.015);
    });
  });

  describe('requestWithdrawal and unlockFunds execution', () => {
    it('validates account and signer', async () => {
      await expect(
        withdrawalService.requestWithdrawal(
          { operatorId: '0', withdrawalType: 'all' },
          { address: '' },
          mockInjector,
        ),
      ).rejects.toThrow('Valid account address is required');

      await expect(
        withdrawalService.requestWithdrawal(
          { operatorId: '0', withdrawalType: 'all' },
          { address: testAddress },
          {} as never,
        ),
      ).rejects.toThrow('Wallet signer is required');

      await expect(
        withdrawalService.unlockFunds(
          { operatorId: '0', unlockType: 'funds' },
          { address: '' },
          mockInjector,
        ),
      ).rejects.toThrow('Valid account address is required');

      await expect(
        withdrawalService.unlockFunds(
          { operatorId: '0', unlockType: 'funds' },
          { address: testAddress },
          {} as never,
        ),
      ).rejects.toThrow('Wallet signer is required');
    });

    it('submits transactions successfully', async () => {
      const mockResult = { success: true, txHash: '0xabc' };
      vi.mocked(signAndSendTx).mockResolvedValue(mockResult);

      const resWithdraw = await withdrawalService.requestWithdrawal(
        { operatorId: '0', withdrawalType: 'all' },
        { address: testAddress },
        mockInjector,
      );
      expect(resWithdraw).toEqual(mockResult);

      const resUnlock = await withdrawalService.unlockFunds(
        { operatorId: '0', unlockType: 'funds' },
        { address: testAddress },
        mockInjector,
      );
      expect(resUnlock).toEqual(mockResult);
    });

    it('propagates cancellation errors and handles runtime errors', async () => {
      const cancelError = new Error('User cancelled signature');
      vi.mocked(signAndSendTx).mockRejectedValueOnce(cancelError);

      await expect(
        withdrawalService.requestWithdrawal(
          { operatorId: '0', withdrawalType: 'all' },
          { address: testAddress },
          mockInjector,
        ),
      ).rejects.toThrow('User cancelled signature');

      vi.mocked(signAndSendTx).mockRejectedValueOnce(new Error('Substrate failure'));
      const failRes = await withdrawalService.requestWithdrawal(
        { operatorId: '0', withdrawalType: 'all' },
        { address: testAddress },
        mockInjector,
      );
      expect(failRes).toEqual({
        success: false,
        error: 'Substrate failure',
      });
    });
  });

  describe('batchUnlockFunds', () => {
    it('handles empty operatorIds gracefully', async () => {
      const res = await withdrawalService.batchUnlockFunds(
        { operatorIds: [], unlockType: 'funds' },
        { address: testAddress },
        mockInjector,
      );

      expect(res).toEqual({
        success: true,
        results: [],
        totalSuccess: 0,
        totalFailed: 0,
      });
    });

    it('processes batch unlock transactions and accurately aggregates success', async () => {
      vi.mocked(signAndSendTx).mockResolvedValue({ success: true, txHash: '0x123' });

      const progressCallback = vi.fn();
      const res = await withdrawalService.batchUnlockFunds(
        { operatorIds: ['1', '2'], unlockType: 'funds' },
        { address: testAddress },
        mockInjector,
        progressCallback,
      );

      expect(res.success).toBe(true);
      expect(res.totalSuccess).toBe(2);
      expect(res.totalFailed).toBe(0);
      expect(res.results).toHaveLength(2);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('aborts batch sequence immediately when user cancels a wallet signing modal', async () => {
      vi.mocked(signAndSendTx)
        .mockResolvedValueOnce({ success: true, txHash: '0x1' })
        .mockRejectedValueOnce(new Error('User cancelled request'));

      const res = await withdrawalService.batchUnlockFunds(
        { operatorIds: ['1', '2', '3'], unlockType: 'funds' },
        { address: testAddress },
        mockInjector,
      );

      // Even with 1 cancellation, the partial success flag allows the UI to refresh completed unlocks
      expect(res.success).toBe(true);
      expect(res.totalSuccess).toBe(1);
      expect(res.totalFailed).toBe(1);
      // Operator 3 should NOT have been called because loop aborted on cancellation
      expect(res.results).toHaveLength(2);
      expect(res.results[1].error).toBe('Transaction cancelled by user');
    });

    it('returns success false when all unlock operations fail', async () => {
      vi.mocked(signAndSendTx).mockRejectedValue(new Error('RPC network timeout'));

      const res = await withdrawalService.batchUnlockFunds(
        { operatorIds: ['1', '2'], unlockType: 'funds' },
        { address: testAddress },
        mockInjector,
      );

      expect(res.success).toBe(false);
      expect(res.totalSuccess).toBe(0);
      expect(res.totalFailed).toBe(2);
      expect(res.results).toHaveLength(2);
    });
  });
});
