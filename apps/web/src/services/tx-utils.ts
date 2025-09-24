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
    const unsubPromise = tx
      .signAndSend(accountAddress, { signer }, (result: ISubmittableResult) => {
        if (onProgress) onProgress(result);

        const { status, txHash, dispatchError } = result;
        if (status?.isInBlock) {
          if (dispatchError) {
            resolve({
              success: false,
              error: 'Transaction failed during execution',
              txHash: txHash?.toString(),
            });
          } else {
            resolve({
              success: true,
              txHash: txHash?.toString(),
              blockHash: status.asInBlock?.toString(),
            });
          }
        } else if (status?.isFinalized) {
          // no-op; we already resolved at isInBlock
        } else if (status?.isDropped || status?.isInvalid) {
          resolve({
            success: false,
            error: 'Transaction was dropped or invalid',
            txHash: txHash?.toString(),
          });
        }
      })
      .catch((error: unknown) => {
        // Propagate wallet cancellation/rejection
        reject(error);
      });

    // Synchronous safety net
    if (unsubPromise && typeof (unsubPromise as Promise<unknown>).catch === 'function') {
      (unsubPromise as Promise<unknown>).catch((err: unknown) => reject(err));
    }
  });

export const isUserCancellationError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancelled|canceled|rejected|denied|abort/i.test(message);
};
