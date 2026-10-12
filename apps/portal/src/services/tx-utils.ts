// Shared helpers for sending transactions via Polkadot.js-style signAndSend
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';

export interface TxResult {
  success: boolean;
  txHash?: string;
  blockHash?: string;
  error?: string;
}

export interface SignAndSendOptions {
  timeout?: number;
}

export type TxProgressCallback = (result: ISubmittableResult) => void;

export const formatDispatchError = (
  dispatchError: unknown,
  registry?: { findMetaError?: (mod: unknown) => { section: string; name: string } },
): string => {
  if (!dispatchError) return 'Transaction failed during execution';
  if (typeof dispatchError === 'object' && dispatchError !== null) {
    const err = dispatchError as Record<string, unknown>;
    if (err.section && err.name) {
      return `Transaction failed: ${String(err.section)}.${String(err.name)}`;
    }
    const reg =
      registry ??
      (err.registry as
        | { findMetaError?: (mod: unknown) => { section: string; name: string } }
        | undefined);
    if (err.isModule) {
      if (err.asModule && reg?.findMetaError) {
        try {
          const { section, name } = reg.findMetaError(err.asModule);
          return `Transaction failed: ${section}.${name}`;
        } catch {
          // Fallback to string check
        }
      }
      const errStr = String(dispatchError);
      if (errStr && errStr !== '[object Object]') {
        return `Transaction failed: ${errStr}`;
      }
      return 'Transaction failed with module error';
    }
    if (typeof err.message === 'string' && err.message) {
      return `Transaction failed: ${err.message}`;
    }
    const errStr = String(dispatchError);
    if (errStr && errStr !== '[object Object]') {
      return `Transaction failed: ${errStr}`;
    }
  }
  return 'Transaction failed during execution';
};

export const signAndSendTx = async (
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  accountAddress: string,
  signer: Signer,
  onProgress?: TxProgressCallback,
  options?: SignAndSendOptions,
): Promise<TxResult> =>
  new Promise<TxResult>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    let isSettled = false;
    let hasReceivedStatus = false;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (unsub) {
        try {
          unsub();
        } catch {
          // ignore cleanup errors
        }
        unsub = undefined;
      }
    };

    const startTimeout = () => {
      if (options?.timeout !== undefined && options.timeout > 0 && !timeoutId && !isSettled) {
        timeoutId = setTimeout(() => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            reject(new Error(`Transaction timed out after ${options.timeout}ms`));
          }
        }, options.timeout);
      }
    };

    tx.signAndSend(accountAddress, { signer }, (result: ISubmittableResult) => {
      if (!hasReceivedStatus) {
        hasReceivedStatus = true;
        startTimeout();
      }
      if (onProgress) onProgress(result);

      const { status, txHash, dispatchError } = result;
      if (status?.isInBlock) {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          if (dispatchError) {
            resolve({
              success: false,
              error: formatDispatchError(
                dispatchError,
                (
                  tx as unknown as {
                    registry?: {
                      findMetaError?: (mod: unknown) => { section: string; name: string };
                    };
                  }
                )?.registry,
              ),
              txHash: txHash?.toString(),
            });
          } else {
            resolve({
              success: true,
              txHash: txHash?.toString(),
              blockHash: status.asInBlock?.toString(),
            });
          }
        }
      } else if (status?.isFinalized) {
        // no-op; we already resolved at isInBlock
      } else if (status?.isDropped || status?.isInvalid || status?.isUsurped) {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          const errorMsg = status.isUsurped
            ? 'Transaction was usurped by another transaction'
            : 'Transaction was dropped or invalid';
          resolve({
            success: false,
            error: errorMsg,
            txHash: txHash?.toString(),
          });
        }
      }
    })
      .then(unsubFn => {
        unsub = unsubFn;
        if (isSettled) {
          cleanup();
        }
      })
      .catch((error: unknown) => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          reject(error);
        }
      });
  });

export const isUserCancellationError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancelled|canceled|rejected|denied|abort/i.test(message);
};
