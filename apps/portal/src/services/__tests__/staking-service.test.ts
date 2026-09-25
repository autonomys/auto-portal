import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stakingService } from '../staking-service';
import * as apiService from '../api-service';
import * as autoConsensus from '@autonomys/auto-consensus';
import * as txUtils from '../tx-utils';

vi.mock('../api-service', () => ({
  getSharedApiConnection: vi.fn(),
}));

vi.mock('@autonomys/auto-consensus', () => ({
  nominateOperator: vi.fn(),
}));

vi.mock('../tx-utils', () => ({
  signAndSendTx: vi.fn(),
  isUserCancellationError: vi.fn((error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error ?? '');
    return /cancelled|rejected/i.test(msg);
  }),
}));

describe('stakingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNominateTransaction', () => {
    it('creates nominate transaction converting AI3 to shannons', async () => {
      const mockApi = { genesisHash: '0x123' };
      vi.mocked(apiService.getSharedApiConnection).mockResolvedValue(mockApi as any);

      const mockTx = { method: 'nominate' };
      vi.mocked(autoConsensus.nominateOperator).mockResolvedValue(mockTx as any);

      const tx = await stakingService.createNominateTransaction({
        operatorId: 'op-1',
        amount: 5,
      });

      expect(apiService.getSharedApiConnection).toHaveBeenCalled();
      expect(autoConsensus.nominateOperator).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: 'op-1',
        amountToStake: BigInt('5000000000000000000'),
      });
      expect(tx).toBe(mockTx);
    });
  });

  describe('estimateTransactionFee', () => {
    it('returns fee in AI3 calculated from paymentInfo', async () => {
      const mockTx = {
        paymentInfo: vi.fn().mockResolvedValue({
          partialFee: {
            toString: () => '10000000000000000', // 0.01 AI3 in shannons
          },
        }),
      };
      vi.spyOn(stakingService, 'createNominateTransaction').mockResolvedValue(mockTx as any);

      const fee = await stakingService.estimateTransactionFee(
        { operatorId: 'op-1', amount: 10 },
        'sub_address_123',
      );

      expect(mockTx.paymentInfo).toHaveBeenCalledWith('sub_address_123');
      expect(fee).toBe(0.01);
    });

    it('returns fallback fee of 0.01 when fee estimation fails', async () => {
      vi.spyOn(stakingService, 'createNominateTransaction').mockRejectedValue(
        new Error('RPC connection error'),
      );

      const fee = await stakingService.estimateTransactionFee(
        { operatorId: 'op-1', amount: 10 },
        'sub_address_123',
      );

      expect(fee).toBe(0.01);
    });
  });

  describe('nominate', () => {
    it('signs and sends transaction successfully', async () => {
      const mockTx = { method: 'nominate' };
      vi.spyOn(stakingService, 'createNominateTransaction').mockResolvedValue(mockTx as any);

      vi.mocked(txUtils.signAndSendTx).mockResolvedValue({
        success: true,
        txHash: '0xhash123',
        blockHash: '0xblock123',
      });

      const progressCallback = vi.fn();
      const result = await stakingService.nominate(
        { operatorId: 'op-1', amount: 5 },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
        progressCallback,
      );

      expect(txUtils.signAndSendTx).toHaveBeenCalledWith(
        mockTx,
        'sub_address_123',
        'mock_signer',
        progressCallback,
      );
      expect(result).toEqual({
        success: true,
        txHash: '0xhash123',
        blockHash: '0xblock123',
      });
    });

    it('re-throws user cancellation errors', async () => {
      vi.spyOn(stakingService, 'createNominateTransaction').mockResolvedValue({} as any);
      vi.mocked(txUtils.signAndSendTx).mockRejectedValue(new Error('User rejected signature'));

      await expect(
        stakingService.nominate(
          { operatorId: 'op-1', amount: 5 },
          { address: 'sub_address_123' },
          { signer: 'mock_signer' },
        ),
      ).rejects.toThrow('User rejected signature');
    });

    it('returns failure result object on unexpected errors', async () => {
      vi.spyOn(stakingService, 'createNominateTransaction').mockRejectedValue(
        new Error('Execution halted'),
      );

      const result = await stakingService.nominate(
        { operatorId: 'op-1', amount: 5 },
        { address: 'sub_address_123' },
        { signer: 'mock_signer' },
      );

      expect(result).toEqual({
        success: false,
        error: 'Execution halted',
      });
    });
  });
});
