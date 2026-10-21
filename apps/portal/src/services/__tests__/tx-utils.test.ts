import { describe, it, expect, vi } from 'vitest';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';
import { isUserCancellationError, signAndSendTx } from '../tx-utils';

describe('tx-utils', () => {
  const dummyAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const dummySigner = {} as Signer;

  describe('isUserCancellationError', () => {
    it('detects user cancellation in various message formats', () => {
      expect(isUserCancellationError(new Error('User cancelled transaction'))).toBe(true);
      expect(isUserCancellationError(new Error('Request canceled by user'))).toBe(true);
      expect(isUserCancellationError(new Error('Transaction rejected'))).toBe(true);
      expect(isUserCancellationError(new Error('Access denied'))).toBe(true);
      expect(isUserCancellationError(new Error('Operation aborted'))).toBe(true);
      expect(isUserCancellationError('User rejected the signature request')).toBe(true);
    });

    it('returns false for unrelated errors', () => {
      expect(isUserCancellationError(new Error('Network timeout'))).toBe(false);
      expect(isUserCancellationError(new Error('Internal server error'))).toBe(false);
      expect(isUserCancellationError(null)).toBe(false);
      expect(isUserCancellationError(undefined)).toBe(false);
    });
  });

  describe('signAndSendTx', () => {
    it('resolves on isInBlock when execution succeeds and unregisters listener', async () => {
      const unsub = vi.fn();
      let callback: ((result: ISubmittableResult) => void) | undefined;

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsub);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const progressCb = vi.fn();
      const txPromise = signAndSendTx(mockTx, dummyAddress, dummySigner, progressCb);

      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: '0xblockhash123',
        },
        txHash: '0xtxhash456',
        dispatchError: undefined,
      } as unknown as ISubmittableResult;

      callback?.(mockResult);

      const result = await txPromise;
      expect(result).toEqual({
        success: true,
        txHash: '0xtxhash456',
        blockHash: '0xblockhash123',
      });
      expect(progressCb).toHaveBeenCalledWith(mockResult);
      expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('resolves failure on isInBlock when dispatchError exists', async () => {
      const unsub = vi.fn();
      let callback: ((result: ISubmittableResult) => void) | undefined;

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsub);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const txPromise = signAndSendTx(mockTx, dummyAddress, dummySigner);

      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: '0xblockhash123',
        },
        txHash: '0xtxhash456',
        dispatchError: { isModule: true },
      } as unknown as ISubmittableResult;

      callback?.(mockResult);

      const result = await txPromise;
      expect(result).toEqual({
        success: false,
        error: 'Transaction failed during execution',
        txHash: '0xtxhash456',
      });
      expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('resolves failure when transaction is usurped', async () => {
      const unsub = vi.fn();
      let callback: ((result: ISubmittableResult) => void) | undefined;

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsub);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const txPromise = signAndSendTx(mockTx, dummyAddress, dummySigner);

      const mockResult = {
        status: {
          isUsurped: true,
        },
        txHash: '0xtxhash789',
      } as unknown as ISubmittableResult;

      callback?.(mockResult);

      const result = await txPromise;
      expect(result).toEqual({
        success: false,
        error: 'Transaction was usurped by another transaction',
        txHash: '0xtxhash789',
      });
      expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('resolves failure when transaction is dropped or invalid', async () => {
      const unsub = vi.fn();
      let callback: ((result: ISubmittableResult) => void) | undefined;

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsub);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const txPromise = signAndSendTx(mockTx, dummyAddress, dummySigner);

      const mockResult = {
        status: {
          isDropped: true,
        },
        txHash: '0xtxhash000',
      } as unknown as ISubmittableResult;

      callback?.(mockResult);

      const result = await txPromise;
      expect(result).toEqual({
        success: false,
        error: 'Transaction was dropped or invalid',
        txHash: '0xtxhash000',
      });
      expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('rejects when signAndSend fails or user rejects signature', async () => {
      const cancelError = new Error('User denied transaction signature');

      const mockTx = {
        signAndSend: vi.fn(() => Promise.reject(cancelError)),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      await expect(signAndSendTx(mockTx, dummyAddress, dummySigner)).rejects.toThrow(
        'User denied transaction signature',
      );
    });
  });
});
