import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stakingService, type StakingParams } from '../staking-service';
import { nominateOperator } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from '../api-service';
import { signAndSendTx } from '../tx-utils';

vi.mock('@autonomys/auto-consensus', () => ({
  nominateOperator: vi.fn(),
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

describe('staking-service', () => {
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
    vi.mocked(nominateOperator).mockResolvedValue(mockTx as never);
  });

  describe('createNominateTransaction', () => {
    it('validates required staking parameters', async () => {
      await expect(
        stakingService.createNominateTransaction(null as unknown as StakingParams),
      ).rejects.toThrow('Staking parameters are required');

      await expect(
        stakingService.createNominateTransaction({ operatorId: '', amount: 10 }),
      ).rejects.toThrow('Valid operator ID is required');

      await expect(
        stakingService.createNominateTransaction({ operatorId: '   ', amount: 10 }),
      ).rejects.toThrow('Valid operator ID is required');

      await expect(
        stakingService.createNominateTransaction({ operatorId: '0', amount: 0 }),
      ).rejects.toThrow('Staking amount must be a positive number');

      await expect(
        stakingService.createNominateTransaction({ operatorId: '0', amount: -5 }),
      ).rejects.toThrow('Staking amount must be a positive number');

      await expect(
        stakingService.createNominateTransaction({ operatorId: '0', amount: NaN }),
      ).rejects.toThrow('Staking amount must be a positive number');
    });

    it('creates nominateOperator extrinsic with correct shannon conversion', async () => {
      const tx = await stakingService.createNominateTransaction({
        operatorId: ' 42 ',
        amount: 2.5,
      });

      expect(getSharedApiConnection).toHaveBeenCalledTimes(1);
      expect(nominateOperator).toHaveBeenCalledWith({
        api: mockApi,
        operatorId: '42',
        amountToStake: 2500000000000000000n,
      });
      expect(tx).toBe(mockTx);
    });
  });

  describe('estimateTransactionFee', () => {
    it('validates senderAddress', async () => {
      await expect(
        stakingService.estimateTransactionFee({ operatorId: '0', amount: 1 }, ''),
      ).rejects.toThrow('Valid sender address is required for fee estimation');

      await expect(
        stakingService.estimateTransactionFee({ operatorId: '0', amount: 1 }, '   '),
      ).rejects.toThrow('Valid sender address is required for fee estimation');
    });

    it('returns fee in AI3 on successful paymentInfo estimation', async () => {
      mockTx.paymentInfo.mockResolvedValueOnce({
        partialFee: { toString: () => '10000000000000000' }, // 0.01 AI3
      });

      const fee = await stakingService.estimateTransactionFee(
        { operatorId: '0', amount: 10 },
        testAddress,
      );

      expect(mockTx.paymentInfo).toHaveBeenCalledWith(testAddress);
      expect(fee).toBe(0.01);
    });

    it('returns fallback fee of 0.01 if paymentInfo throws', async () => {
      mockTx.paymentInfo.mockRejectedValueOnce(new Error('RPC query failed'));

      const fee = await stakingService.estimateTransactionFee(
        { operatorId: '0', amount: 10 },
        testAddress,
      );

      expect(fee).toBe(0.01);
    });
  });

  describe('nominate', () => {
    it('validates account and injector before submitting', async () => {
      await expect(
        stakingService.nominate({ operatorId: '0', amount: 10 }, { address: '' }, mockInjector),
      ).rejects.toThrow('Valid account address is required for nomination');

      await expect(
        stakingService.nominate(
          { operatorId: '0', amount: 10 },
          { address: testAddress },
          {} as never,
        ),
      ).rejects.toThrow('Wallet signer is required for nomination');
    });

    it('submits transaction and returns result on success', async () => {
      const mockResult = {
        success: true,
        txHash: '0x123abc',
        blockHash: '0x456def',
      };
      vi.mocked(signAndSendTx).mockResolvedValueOnce(mockResult);

      const callback = vi.fn();
      const res = await stakingService.nominate(
        { operatorId: '0', amount: 5 },
        { address: testAddress },
        mockInjector,
        callback,
      );

      expect(signAndSendTx).toHaveBeenCalledWith(
        mockTx,
        testAddress,
        mockInjector.signer,
        callback,
      );
      expect(res).toEqual(mockResult);
    });

    it('re-throws user cancellation errors so UI handles gracefully', async () => {
      const cancelError = new Error('Cancelled by user');
      vi.mocked(signAndSendTx).mockRejectedValueOnce(cancelError);

      await expect(
        stakingService.nominate(
          { operatorId: '0', amount: 5 },
          { address: testAddress },
          mockInjector,
        ),
      ).rejects.toThrow('Cancelled by user');
    });

    it('captures unexpected errors and returns StakingResult with success: false', async () => {
      vi.mocked(signAndSendTx).mockRejectedValueOnce(new Error('Insufficient balance'));

      const res = await stakingService.nominate(
        { operatorId: '0', amount: 5 },
        { address: testAddress },
        mockInjector,
      );

      expect(res).toEqual({
        success: false,
        error: 'Insufficient balance',
      });
    });
  });
});
