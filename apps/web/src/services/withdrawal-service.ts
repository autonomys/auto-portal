import { withdrawStake, unlockFunds } from '@autonomys/auto-consensus';
import { ai3ToShannons, shannonsToAI3 } from '@/lib/unit-conversion';
import { getSharedApiConnection } from './api-service';

export interface WithdrawalParams {
  operatorId: string;
  amount?: number; // Amount in AI3 for partial withdrawal
  withdrawalType: 'all' | 'partial';
}

export interface UnlockParams {
  operatorId: string;
  unlockType: 'funds' | 'nominator';
}

export interface BatchUnlockParams {
  operatorIds: string[];
  unlockType: 'funds' | 'nominator';
}

export interface WithdrawalResult {
  success: boolean;
  txHash?: string;
  error?: string;
  blockHash?: string;
}

export interface BatchWithdrawalResult {
  success: boolean;
  results: Array<{
    operatorId: string;
    success: boolean;
    txHash?: string;
    error?: string;
  }>;
  totalSuccess: number;
  totalFailed: number;
}

export const withdrawalService = {
  /**
   * Estimate transaction fee for a withdrawal operation
   * @param params - Withdrawal parameters
   * @param senderAddress - Address of the account that will send the transaction
   * @returns Promise that resolves to fee estimation in AI3
   */
  estimateWithdrawalFee: async (
    params: WithdrawalParams,
    senderAddress: string,
  ): Promise<number> => {
    try {
      const tx = await withdrawalService.createWithdrawTransaction(params);
      const paymentInfo = await tx.paymentInfo(senderAddress);
      const feeInAI3 = shannonsToAI3(paymentInfo.partialFee.toString());
      return feeInAI3;
    } catch (error) {
      console.error('Withdrawal fee estimation failed:', error);
      return 0.01; // Fallback fee
    }
  },

  /**
   * Estimate transaction fee for an unlock operation
   * @param params - Unlock parameters
   * @param senderAddress - Address of the account that will send the transaction
   * @returns Promise that resolves to fee estimation in AI3
   */
  estimateUnlockFee: async (params: UnlockParams, senderAddress: string): Promise<number> => {
    try {
      const tx = await withdrawalService.createUnlockTransaction(params);
      const paymentInfo = await tx.paymentInfo(senderAddress);
      const feeInAI3 = shannonsToAI3(paymentInfo.partialFee.toString());
      return feeInAI3;
    } catch (error) {
      console.error('Unlock fee estimation failed:', error);
      return 0.01; // Fallback fee
    }
  },

  /**
   * Create a withdrawStake extrinsic
   * @param params - Withdrawal parameters
   * @returns Transaction ready for signing and sending
   */
  createWithdrawTransaction: async (params: WithdrawalParams) => {
    const { operatorId, amount, withdrawalType } = params;
    const api = await getSharedApiConnection();

    if (withdrawalType === 'all') {
      return withdrawStake({
        api,
        operatorId,
        all: true,
      });
    } else {
      if (!amount) {
        throw new Error('Amount is required for partial withdrawal');
      }

      const amountInShannons = ai3ToShannons(amount);
      return withdrawStake({
        api,
        operatorId,
        stake: amountInShannons,
      });
    }
  },

  /**
   * Create an unlock transaction (funds or nominator)
   * @param params - Unlock parameters
   * @returns Transaction ready for signing and sending
   */
  createUnlockTransaction: async (params: UnlockParams) => {
    const { operatorId } = params;
    const api = await getSharedApiConnection();

    return unlockFunds({
      api,
      operatorId,
    });
  },

  /**
   * Execute a withdrawal request (Step 1)
   * @param params - Withdrawal parameters
   * @param account - Account to sign with
   * @param injector - Wallet injector for signing
   * @param progressCallback - Optional callback for real-time transaction status updates
   * @returns Promise that resolves with transaction result
   */
  requestWithdrawal: async (
    params: WithdrawalParams,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progressCallback?: (result: any) => void,
  ): Promise<WithdrawalResult> => {
    try {
      const tx = await withdrawalService.createWithdrawTransaction(params);

      return new Promise(resolve => {
        tx.signAndSend(
          account.address,
          { signer: injector.signer },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (progressCallback) {
              progressCallback(result);
            }

            const { status, txHash, events } = result;
            if (status.isInBlock) {
              console.log(`Withdrawal transaction included at blockHash ${status.asInBlock}`);
              console.log(`Transaction hash: ${txHash}`);

              // Check for errors in events
              const errorEvent = events.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (eventRecord: any) =>
                  eventRecord.event.section === 'system' &&
                  eventRecord.event.method === 'ExtrinsicFailed',
              );

              if (errorEvent) {
                resolve({
                  success: false,
                  error: 'Withdrawal transaction failed during execution',
                  txHash: txHash.toString(),
                });
              } else {
                resolve({
                  success: true,
                  txHash: txHash.toString(),
                  blockHash: status.asInBlock.toString(),
                });
              }
            } else if (status.isFinalized) {
              console.log(`Withdrawal transaction finalized at blockHash ${status.asFinalized}`);
            } else if (status.isDropped || status.isInvalid) {
              resolve({
                success: false,
                error: 'Withdrawal transaction was dropped or invalid',
                txHash: txHash.toString(),
              });
            }
          },
        );
      });
    } catch (error) {
      console.error('Withdrawal transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Execute an unlock request (Step 2)
   * @param params - Unlock parameters
   * @param account - Account to sign with
   * @param injector - Wallet injector for signing
   * @param progressCallback - Optional callback for real-time transaction status updates
   * @returns Promise that resolves with transaction result
   */
  unlockFunds: async (
    params: UnlockParams,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progressCallback?: (result: any) => void,
  ): Promise<WithdrawalResult> => {
    try {
      const tx = await withdrawalService.createUnlockTransaction(params);

      return new Promise(resolve => {
        tx.signAndSend(
          account.address,
          { signer: injector.signer },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (progressCallback) {
              progressCallback(result);
            }

            const { status, txHash, events } = result;
            if (status.isInBlock) {
              console.log(`Unlock transaction included at blockHash ${status.asInBlock}`);
              console.log(`Transaction hash: ${txHash}`);

              // Check for errors in events
              const errorEvent = events.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (eventRecord: any) =>
                  eventRecord.event.section === 'system' &&
                  eventRecord.event.method === 'ExtrinsicFailed',
              );

              if (errorEvent) {
                resolve({
                  success: false,
                  error: 'Unlock transaction failed during execution',
                  txHash: txHash.toString(),
                });
              } else {
                resolve({
                  success: true,
                  txHash: txHash.toString(),
                  blockHash: status.asInBlock.toString(),
                });
              }
            } else if (status.isFinalized) {
              console.log(`Unlock transaction finalized at blockHash ${status.asFinalized}`);
            } else if (status.isDropped || status.isInvalid) {
              resolve({
                success: false,
                error: 'Unlock transaction was dropped or invalid',
                txHash: txHash.toString(),
              });
            }
          },
        );
      });
    } catch (error) {
      console.error('Unlock transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Execute multiple unlock requests in batch
   * @param params - Batch unlock parameters
   * @param account - Account to sign with
   * @param injector - Wallet injector for signing
   * @param progressCallback - Optional callback for progress updates
   * @returns Promise that resolves with batch operation result
   */
  batchUnlockFunds: async (
    params: BatchUnlockParams,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    progressCallback?: (progress: { completed: number; total: number; current?: string }) => void,
  ): Promise<BatchWithdrawalResult> => {
    const { operatorIds } = params;
    const results: BatchWithdrawalResult['results'] = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < operatorIds.length; i++) {
        const operatorId = operatorIds[i];

        if (progressCallback) {
          progressCallback({
            completed: i,
            total: operatorIds.length,
            current: operatorId,
          });
        }

        try {
          const result = await withdrawalService.unlockFunds(
            { operatorId, unlockType: params.unlockType },
            account,
            injector,
          );

          results.push({
            operatorId,
            success: result.success,
            txHash: result.txHash,
            error: result.error,
          });

          if (result.success) {
            totalSuccess++;
          } else {
            totalFailed++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          results.push({
            operatorId,
            success: false,
            error: errorMessage,
          });
          totalFailed++;
        }

        // Add a small delay between transactions to avoid overwhelming the network
        if (i < operatorIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (progressCallback) {
        progressCallback({
          completed: operatorIds.length,
          total: operatorIds.length,
        });
      }

      return {
        success: totalSuccess > 0,
        results,
        totalSuccess,
        totalFailed,
      };
    } catch (error) {
      console.error('Batch unlock failed:', error);
      return {
        success: false,
        results,
        totalSuccess,
        totalFailed,
      };
    }
  },
};
