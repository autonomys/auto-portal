import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signAndSendTx, formatDispatchError, isUserCancellationError } from '../tx-utils';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';

describe('tx-utils', () => {
  describe('formatDispatchError', () => {
    it('returns default message when dispatchError is null or undefined', () => {
      expect(formatDispatchError(null)).toBe('Transaction failed during execution');
      expect(formatDispatchError(undefined)).toBe('Transaction failed during execution');
    });

    it('decodes module error with registry.findMetaError', () => {
      const mockRegistry = {
        findMetaError: vi.fn().mockReturnValue({
          section: 'staking',
          name: 'CannotWithdraw',
        }),
      };
      const moduleErr = {
        isModule: true,
        asModule: '0x0102',
      };
      expect(formatDispatchError(moduleErr, mockRegistry)).toBe(
        'Transaction failed: staking.CannotWithdraw',
      );
    });

    it('formats direct section and name properties', () => {
      const directErr = {
        section: 'balances',
        name: 'InsufficientBalance',
      };
      expect(formatDispatchError(directErr)).toBe(
        'Transaction failed: balances.InsufficientBalance',
      );
    });

    it('formats module error with string representation', () => {
      const moduleErr = {
        isModule: true,
        toString: () => 'staking.CannotWithdraw',
      };
      expect(formatDispatchError(moduleErr)).toBe('Transaction failed: staking.CannotWithdraw');
    });

    it('falls back to module error label if toString is generic object', () => {
      const moduleErr = {
        isModule: true,
        toString: () => '[object Object]',
      };
      expect(formatDispatchError(moduleErr)).toBe('Transaction failed with module error');
    });

    it('formats non-module object with toString', () => {
      const tokenErr = {
        isModule: false,
        toString: () => 'token.BelowMinimum',
      };
      expect(formatDispatchError(tokenErr)).toBe('Transaction failed: token.BelowMinimum');
    });
  });

  describe('isUserCancellationError', () => {
    it('detects common cancellation and rejection messages', () => {
      expect(isUserCancellationError(new Error('User cancelled transaction'))).toBe(true);
      expect(isUserCancellationError(new Error('Request was canceled'))).toBe(true);
      expect(isUserCancellationError(new Error('Transaction rejected by user'))).toBe(true);
      expect(isUserCancellationError(new Error('User denied access'))).toBe(true);
      expect(isUserCancellationError(new Error('Operation aborted'))).toBe(true);
      expect(isUserCancellationError('Cancelled by extension')).toBe(true);
    });

    it('returns false for unrelated errors', () => {
      expect(isUserCancellationError(new Error('Connection timed out'))).toBe(false);
      expect(isUserCancellationError(new Error('Insufficient balance'))).toBe(false);
      expect(isUserCancellationError(null)).toBe(false);
      expect(isUserCancellationError(undefined)).toBe(false);
    });
  });

  describe('signAndSendTx', () => {
    const mockAccount = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const mockSigner = {} as Signer;
    let mockUnsub: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.clearAllMocks();
      mockUnsub = vi.fn();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const createMockTx = (executeHandler: (cb: (result: ISubmittableResult) => void) => void) =>
      ({
        signAndSend: vi.fn((_account, _opts, callback) => {
          executeHandler(callback);
          return Promise.resolve(mockUnsub);
        }),
      }) as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

    it('resolves successfully on isInBlock and invokes unsub', async () => {
      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: { toString: () => '0xblockhash123' },
        },
        txHash: { toString: () => '0xtxhash123' },
      } as unknown as ISubmittableResult;

      const tx = createMockTx(cb => cb(mockResult));
      const onProgress = vi.fn();

      const result = await signAndSendTx(tx, mockAccount, mockSigner, onProgress);

      expect(result).toEqual({
        success: true,
        txHash: '0xtxhash123',
        blockHash: '0xblockhash123',
      });
      expect(onProgress).toHaveBeenCalledWith(mockResult);
      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });

    it('resolves with error when dispatchError is present inBlock and invokes unsub', async () => {
      const mockResult = {
        status: {
          isInBlock: true,
          asInBlock: { toString: () => '0xblockhash123' },
        },
        txHash: { toString: () => '0xtxhash123' },
        dispatchError: {
          isModule: true,
          toString: () => 'system.BadOrigin',
        },
      } as unknown as ISubmittableResult;

      const tx = createMockTx(cb => cb(mockResult));
      const result = await signAndSendTx(tx, mockAccount, mockSigner);

      expect(result).toEqual({
        success: false,
        error: 'Transaction failed: system.BadOrigin',
        txHash: '0xtxhash123',
      });
      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });

    it('resolves with failure and cleans up when transaction is dropped or invalid', async () => {
      const mockResult = {
        status: {
          isDropped: true,
        },
        txHash: { toString: () => '0xtxhash456' },
      } as unknown as ISubmittableResult;

      const tx = createMockTx(cb => cb(mockResult));
      const result = await signAndSendTx(tx, mockAccount, mockSigner);

      expect(result).toEqual({
        success: false,
        error: 'Transaction was dropped or invalid',
        txHash: '0xtxhash456',
      });
      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });

    it('resolves with failure and cleans up when transaction is usurped', async () => {
      const mockResult = {
        status: {
          isUsurped: true,
        },
        txHash: { toString: () => '0xtxhash789' },
      } as unknown as ISubmittableResult;

      const tx = createMockTx(cb => cb(mockResult));
      const result = await signAndSendTx(tx, mockAccount, mockSigner);

      expect(result).toEqual({
        success: false,
        error: 'Transaction was usurped by another transaction',
        txHash: '0xtxhash789',
      });
      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });

    it('propagates wallet rejection error', async () => {
      const tx = {
        signAndSend: vi.fn().mockRejectedValue(new Error('User cancelled transaction in wallet')),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      await expect(signAndSendTx(tx, mockAccount, mockSigner)).rejects.toThrow(
        'User cancelled transaction in wallet',
      );
    });

    it('rejects with timeout and cleans up subscription when timeout is exceeded', async () => {
      vi.useFakeTimers();

      const tx = {
        signAndSend: vi.fn((_account, _opts, callback) => {
          callback({
            status: { isReady: true },
          } as unknown as ISubmittableResult);
          return Promise.resolve(mockUnsub);
        }),
      } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

      const promise = signAndSendTx(tx, mockAccount, mockSigner, undefined, { timeout: 1000 });
      const assertion = expect(promise).rejects.toThrow('Transaction timed out after 1000ms');

      await vi.advanceTimersByTimeAsync(1000);
      await assertion;

      expect(mockUnsub).toHaveBeenCalledTimes(1);
    });
  });
});
