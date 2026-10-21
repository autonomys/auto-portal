// Shared helpers for sending transactions via Polkadot.js-style signAndSend
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';

export interface TxResult {
  success: boolean;
  txHash?: string;
  blockHash?: string;
  error?: string;
}

export type TxProgressCallback = (result: ISubmittableResult) => void;

export const signAndSendTx = async (
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  accountAddress: string,
  signer: Signer,
  onProgress?: TxProgressCallback,
): Promise<TxResult> =>
  new Promise<TxResult>((resolve, reject) => {
    let settled = false;
    let unsub: (() => void) | undefined;

    const cleanup = () => {
      if (unsub) {
        try {
          unsub();
        } catch {
          // Ignore unsubscribe failures
        }
      }
    };

    const settleResolve = (result: TxResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const settleReject = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const unsubPromise = tx
      .signAndSend(accountAddress, { signer }, (result: ISubmittableResult) => {
        if (onProgress) onProgress(result);

        const { status, txHash, dispatchError } = result;
        if (status?.isInBlock) {
          if (dispatchError) {
            settleResolve({
              success: false,
              error: 'Transaction failed during execution',
              txHash: txHash?.toString(),
            });
          } else {
            settleResolve({
              success: true,
              txHash: txHash?.toString(),
              blockHash: status.asInBlock?.toString(),
            });
          }
        } else if (status?.isFinalized) {
          // no-op; we already resolved at isInBlock
        } else if (status?.isUsurped) {
          settleResolve({
            success: false,
            error: 'Transaction was usurped by another transaction',
            txHash: txHash?.toString(),
          });
        } else if (status?.isDropped || status?.isInvalid) {
          settleResolve({
            success: false,
            error: 'Transaction was dropped or invalid',
            txHash: txHash?.toString(),
          });
        }
      })
      .then((unsubFn: unknown) => {
        if (typeof unsubFn === 'function') {
          unsub = unsubFn as () => void;
          if (settled) cleanup();
        }
      })
      .catch((error: unknown) => {
        // Propagate wallet cancellation/rejection
        settleReject(error);
      });

    // Synchronous safety net
    if (unsubPromise && typeof (unsubPromise as Promise<unknown>).catch === 'function') {
      (unsubPromise as Promise<unknown>).catch((err: unknown) => settleReject(err));
    }
  });

export const isUserCancellationError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancelled|canceled|rejected|denied|abort/i.test(message);
};
