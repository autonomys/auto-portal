// Shared helpers for sending transactions via Polkadot.js-style signAndSend

export interface TxResult {
  success: boolean;
  txHash?: string;
  blockHash?: string;
  error?: string;
}

interface TxStatusLike {
  isInBlock?: boolean;
  asInBlock?: { toString(): string };
  isFinalized?: boolean;
  asFinalized?: { toString(): string };
  isDropped?: boolean;
  isInvalid?: boolean;
}

interface TxEventRecordLike {
  event: { section: string; method: string };
}

interface TxCallbackResultLike {
  status?: TxStatusLike;
  txHash?: { toString(): string };
  events?: TxEventRecordLike[];
}

type SignAndSendFn = (
  address: string,
  options: { signer: unknown },
  cb: (result: TxCallbackResultLike) => void,
) => Promise<unknown>;

export type TxProgressCallback = (result: TxCallbackResultLike) => void;

export const signAndSendTx = async (
  tx: { signAndSend: SignAndSendFn },
  accountAddress: string,
  signer: unknown,
  onProgress?: TxProgressCallback,
): Promise<TxResult> =>
  new Promise<TxResult>((resolve, reject) => {
    const unsubPromise = tx
      .signAndSend(accountAddress, { signer }, (result: TxCallbackResultLike) => {
        if (onProgress) onProgress(result);

        const { status, txHash, events } = result;
        if (status?.isInBlock) {
          const errorEvent = events?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (eventRecord: any) =>
              eventRecord.event.section === 'system' &&
              eventRecord.event.method === 'ExtrinsicFailed',
          );

          if (errorEvent) {
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
