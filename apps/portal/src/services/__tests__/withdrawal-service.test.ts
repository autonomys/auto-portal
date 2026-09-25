import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withdrawalService } from '../withdrawal-service';
import * as apiService from '../api-service';
import * as autoConsensus from '@autonomys/auto-consensus';
import * as txUtils from '../tx-utils';

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn(),
}));

vi.mock('@autonomys/auto-consensus', () => ({
  withdrawStakeAll: vi.fn(),
  withdrawStakeByValue: vi.fn(),
  unlockFunds: vi.fn(),
}));

vi.mock('../tx-utils', () => ({
  signAndSendTx: vi.fn(),
  isUserCancellationError: vi.fn((error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error ?? '');
    return /cancelled|rejected/i.test(msg);
  }),
}));

describe('withdrawalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWithdrawTransaction', () => {
    it('creates full withdrawal transaction when withdrawalType is all', async () => {
      const mockApi = { genesisHash: '0x123' };
      vi.mocked(apiService.getSharedApiConnection).mockResolvedValue(mockApi as any);

      const mockTx = { method: 'withdrawStakeAll' };
      vi.mocked(autoConsensus.withdrawStakeAll).mockResolvedValue(mockTx as any);

      const tx = await withdrawalService.createWithdrawTransaction(
        { operatorId: 'op-1', withdrawalType: 'all' },
        'sub_address_123',
      );

      expect(autoConsensus.withdrawStakeAll).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: 'op-1',
        account: 'sub_address_123',
      });
      expect(tx).toBe(mockTx);
    });

    it('creates partial withdrawal transaction converting amount to shannons', async () => {
      const mockApi = { genesisHash: '0x123' };
      vi.mocked(apiService.getSharedApiConnection).mockResolvedValue(mockApi as any);

      const mockTx = { method: 'withdrawStakeByValue' };
      vi.mocked(autoConsensus.withdrawStakeByValue).mockResolvedValue(mockTx as any);

      const tx = await withdrawalService.createWithdrawTransaction(
        { operatorId: 'op-1', withdrawalType: 'partial', amount: 2.5 },
        'sub_address_123',
      );

      expect(autoConsensus.withdrawStakeByValue).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: 'op-1',
        account: 'sub_address_123',
        amountToWithdraw: BigInt('2500000000000000000'),
      });
      expect(tx).toBe(mockTx);
    });

    it('throws error when amount is missing for partial withdrawal', async () => {
      await expect(
        withdrawalService.createWithdrawTransaction(
          { operatorId: 'op-1', withdrawalType: 'partial' },
          'sub_address_123',
        ),
      ).rejects.toThrow('Amount is required for partial withdrawal');
    });
  });

  describe('createUnlockTransaction', () => {
    it('creates unlockFunds transaction with operatorId', async () => {
      const mockApi = { genesisHash: '0x123' };
      vi.mocked(apiService.getSharedApiConnection).mockResolvedValue(mockApi as any);

      const mockTx = { method: 'unlockFunds' };
      vi.mocked(autoConsensus.unlockFunds).mockResolvedValue(mockTx as any);

      const tx = await withdrawalService.createUnlockTransaction({
        operatorId: 'op-1',
        unlockType: 'funds',
      });

      expect(autoConsensus.unlockFunds).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: 'op-1',
      });
      expect(tx).toBe(mockTx);
    });
  });

  describe('estimateWithdrawalFee and estimateUnlockFee', () => {
    it('estimates withdrawal fee in AI3 from paymentInfo', async () => {
      const mockTx = {
        paymentInfo: vi.fn().mockResolvedValue({
          partialFee: {
            toString: () => '20000000000000000', // 0.02 AI3
          },
        }),
      };
      vi.spyOn(withdrawalService, 'createWithdrawTransaction').mockResolvedValue(mockTx as any);

      const fee = await withdrawalService.estimateWithdrawalFee(
        { operatorId: 'op-1', withdrawalType: 'all' },
        'sub_address_123',
      );

      expect(fee).toBe(0.02);
    });

    it('falls back to 0.01 fee when withdrawal fee estimation fails', async () => {
      vi.spyOn(withdrawalService, 'createWithdrawTransaction').mockRejectedValue(
        new Error('Estimation error'),
      );

      const fee = await withdrawalService.estimateWithdrawalFee(
        { operatorId: 'op-1', withdrawalType: 'all' },
        'sub_address_123',
      );

      expect(fee).toBe(0.01);
    });

    it('estimates unlock fee in AI3 from paymentInfo', async () => {
      const mockTx = {
        paymentInfo: vi.fn().mockResolvedValue({
          partialFee: {
            toString: () => '15000000000000000', // 0.015 AI3
          },
        }),
      };
      vi.spyOn(withdrawalService, 'createUnlockTransaction').mockResolvedValue(mockTx as any);

      const fee = await withdrawalService.estimateUnlockFee(
        { operatorId: 'op-1', unlockType: 'funds' },
        'sub_address_123',
      );

      expect(fee).toBe(0.015);
    });

    it('falls back to 0.01 fee when unlock fee estimation fails', async () => {
      vi.spyOn(withdrawalService, 'createUnlockTransaction').mockRejectedValue(
        new Error('Estimation error'),
      );

      const fee = await withdrawalService.estimateUnlockFee(
        { operatorId: 'op-1', unlockType: 'funds' },
        'sub_address_123',
      );

      expect(fee).toBe(0.01);
    });
  });

  describe('requestWithdrawal', () => {
    it('executes withdrawal transaction successfully', async () => {
      const mockTx = { method: 'withdraw' };
      vi.spyOn(withdrawalService, 'createWithdrawTransaction').mockResolvedValue(mockTx as any);

      vi.mocked(txUtils.signAndSendTx).mockResolvedValue({
        success: true,
        txHash: '0xhash123',
        blockHash: '0xblock123',
      });

      const result = await withdrawalService.requestWithdrawal(
        { operatorId: 'op-1', withdrawalType: 'all' },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
      );

      expect(result).toEqual({
        success: true,
        txHash: '0xhash123',
        blockHash: '0xblock123',
      });
    });

    it('re-throws user cancellation errors during withdrawal', async () => {
      vi.spyOn(withdrawalService, 'createWithdrawTransaction').mockResolvedValue({} as any);
      vi.mocked(txUtils.signAndSendTx).mockRejectedValue(new Error('Transaction rejected'));

      await expect(
        withdrawalService.requestWithdrawal(
          { operatorId: 'op-1', withdrawalType: 'all' },
          { address: 'sub_address_123' },
          { signer: 'mock_signer' },
        ),
      ).rejects.toThrow('Transaction rejected');
    });

    it('returns error result on withdrawal failure', async () => {
      vi.spyOn(withdrawalService, 'createWithdrawTransaction').mockRejectedValue(
        new Error('RPC failure'),
      );

      const result = await withdrawalService.requestWithdrawal(
        { operatorId: 'op-1', withdrawalType: 'all' },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
      );

      expect(result).toEqual({
        success: false,
        error: 'RPC failure',
      });
    });
  });

  describe('unlockFunds', () => {
    it('executes unlock transaction successfully', async () => {
      const mockTx = { method: 'unlock' };
      vi.spyOn(withdrawalService, 'createUnlockTransaction').mockResolvedValue(mockTx as any);

      vi.mocked(txUtils.signAndSendTx).mockResolvedValue({
        success: true,
        txHash: '0xhash456',
        blockHash: '0xblock456',
      });

      const result = await withdrawalService.unlockFunds(
        { operatorId: 'op-1', unlockType: 'funds' },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
      );

      expect(result).toEqual({
        success: true,
        txHash: '0xhash456',
        blockHash: '0xblock456',
      });
    });

    it('re-throws cancellation on unlock', async () => {
      vi.spyOn(withdrawalService, 'createUnlockTransaction').mockResolvedValue({} as any);
      vi.mocked(txUtils.signAndSendTx).mockRejectedValue(new Error('User cancelled'));

      await expect(
        withdrawalService.unlockFunds(
          { operatorId: 'op-1', unlockType: 'funds' },
          { address: 'sub_address_123' },
          { signer: 'mock_signer' },
        ),
      ).rejects.toThrow('User cancelled');
    });
  });

  describe('batchUnlockFunds', () => {
    it('unlocks multiple operators in sequence and reports aggregate results', async () => {
      vi.useFakeTimers();

      const unlockSpy = vi.spyOn(withdrawalService, 'unlockFunds')
        .mockResolvedValueOnce({ success: true, txHash: '0xtx1' })
        .mockResolvedValueOnce({ success: false, error: 'Insufficient funds' });

      const progressCallback = vi.fn();

      const batchPromise = withdrawalService.batchUnlockFunds(
        { operatorIds: ['op-1', 'op-2'], unlockType: 'funds' },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
        progressCallback,
      );

      await vi.runAllTimersAsync();

      const batchResult = await batchPromise;

      expect(unlockSpy).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenCalledWith({ completed: 0, total: 2, current: 'op-1' });
      expect(progressCallback).toHaveBeenCalledWith({ completed: 1, total: 2, current: 'op-2' });
      expect(progressCallback).toHaveBeenCalledWith({ completed: 2, total: 2 });

      expect(batchResult.totalSuccess).toBe(1);
      expect(batchResult.totalFailed).toBe(1);
      expect(batchResult.results).toEqual([
        { operatorId: 'op-1', success: true, txHash: '0xtx1', error: undefined },
        { operatorId: 'op-2', success: false, txHash: undefined, error: 'Insufficient funds' },
      ]);

      vi.useRealTimers();
    });
  });
});
