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
    let unsubFn: (() => void) | null = null;
    let settled = false;

    const cleanup = () => {
      if (unsubFn) {
        try {
          unsubFn();
        } catch {
          // ignore cleanup errors
        }
        unsubFn = null;
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

    tx.signAndSend(accountAddress, { signer }, (result: ISubmittableResult) => {
      if (onProgress) {
        try {
          onProgress(result);
        } catch {
          // prevent callback exceptions from interfering with transaction lifecycle
        }
      }

      const { status, txHash, dispatchError, isError } = result;
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
        if (!settled) {
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
              blockHash: status.asFinalized?.toString(),
            });
          }
        }
      } else if (status?.isDropped || status?.isInvalid || status?.isUsurped) {
        settleResolve({
          success: false,
          error: status.isUsurped
            ? 'Transaction was usurped'
            : 'Transaction was dropped or invalid',
          txHash: txHash?.toString(),
        });
      } else if (isError) {
        settleResolve({
          success: false,
          error: 'Transaction encountered an error',
          txHash: txHash?.toString(),
        });
      }
    })
      .then((fn) => {
        unsubFn = fn;
        if (settled) {
          cleanup();
        }
      })
      .catch((error: unknown) => {
        settleReject(error);
      });
  });

export const isUserCancellationError = (error: unknown): boolean => {
  if (!error) return false;
  if (typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 4001) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /cancelled|canceled|rejected|denied|abort/i.test(message);
};
