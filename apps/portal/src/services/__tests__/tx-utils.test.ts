import { describe, it, expect, vi } from 'vitest';
import { signAndSendTx, isUserCancellationError } from '../tx-utils';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';

describe('tx-utils', () => {
  describe('signAndSendTx', () => {
    it('resolves with success true and block hash when transaction is in block', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn(
          (
            _address: string,
            _options: { signer: Signer },
            cb: (result: ISubmittableResult) => void,
          ) => {
            callback = cb;
            return Promise.resolve(unsubSpy);
          },
        ),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      expect(callback).toBeDefined();

      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: '0xblock123',
        },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: true,
        txHash: '0xtx123',
        blockHash: '0xblock123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('resolves with success false when transaction is in block but has dispatchError', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsubSpy);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: '0xblock123',
        },
        dispatchError: { isModule: true },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: false,
        error: 'Transaction failed during execution',
        txHash: '0xtx123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('resolves at isFinalized if isInBlock was skipped', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsubSpy);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      const mockResult = {
        status: {
          isFinalized: true,
          asFinalized: '0xfinalized123',
        },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: true,
        txHash: '0xtx123',
        blockHash: '0xfinalized123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('resolves with success false when transaction is dropped or invalid', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsubSpy);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      const mockResult = {
        status: {
          isDropped: true,
        },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: false,
        error: 'Transaction was dropped or invalid',
        txHash: '0xtx123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('resolves with success false when transaction is usurped', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsubSpy);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      const mockResult = {
        status: {
          isUsurped: true,
        },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: false,
        error: 'Transaction was usurped',
        txHash: '0xtx123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('resolves with success false when result flags isError', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const unsubSpy = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(unsubSpy);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer);

      const mockResult = {
        isError: true,
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(mockResult);

      const res = await promise;
      expect(res).toEqual({
        success: false,
        error: 'Transaction encountered an error',
        txHash: '0xtx123',
      });
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('calls onProgress callback when provided', async () => {
      let callback: ((result: ISubmittableResult) => void) | undefined;
      const onProgress = vi.fn();

      const mockTx = {
        signAndSend: vi.fn((_address, _options, cb) => {
          callback = cb;
          return Promise.resolve(vi.fn());
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      const promise = signAndSendTx(mockTx, '0x123', signer, onProgress);

      const broadcastResult = {
        status: { isBroadcast: true },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(broadcastResult);
      expect(onProgress).toHaveBeenCalledWith(broadcastResult);

      const inBlockResult = {
        status: { isInBlock: true, asInBlock: '0xblock1' },
        txHash: '0xtx123',
      } as unknown as ISubmittableResult;

      callback!(inBlockResult);
      await promise;
      expect(onProgress).toHaveBeenCalledWith(inBlockResult);
    });

    it('rejects when signAndSend fails', async () => {
      const mockTx = {
        signAndSend: vi.fn(() => Promise.reject(new Error('User cancelled signature'))),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const signer = {} as Signer;
      await expect(signAndSendTx(mockTx, '0x123', signer)).rejects.toThrow(
        'User cancelled signature',
      );
    });
  });

  describe('isUserCancellationError', () => {
    it('detects user cancellation in string error messages', () => {
      expect(isUserCancellationError(new Error('Transaction cancelled by user'))).toBe(true);
      expect(isUserCancellationError(new Error('User rejected the transaction'))).toBe(true);
      expect(isUserCancellationError(new Error('Request denied'))).toBe(true);
      expect(isUserCancellationError(new Error('Operation aborted'))).toBe(true);
      expect(isUserCancellationError('User canceled signature')).toBe(true);
    });

    it('detects EIP-1193 rejection code 4001', () => {
      expect(isUserCancellationError({ code: 4001, message: 'User rejected the request' })).toBe(
        true,
      );
    });

    it('returns false for non-cancellation errors', () => {
      expect(isUserCancellationError(new Error('Insufficient balance'))).toBe(false);
      expect(isUserCancellationError(new Error('Network timeout'))).toBe(false);
      expect(isUserCancellationError(null)).toBe(false);
      expect(isUserCancellationError(undefined)).toBe(false);
      expect(isUserCancellationError('')).toBe(false);
      expect(isUserCancellationError({ code: 5000, message: 'Internal error' })).toBe(false);
    });
  });
});
