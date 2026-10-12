import { unlockFunds, withdrawStakeAll, withdrawStakeByValue } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from './api-service';
import { signAndSendTx, type TxResult, isUserCancellationError } from './tx-utils';
import { shannonsToAi3, ai3ToShannons } from '@autonomys/auto-utils';

export interface WithdrawalParams {
  operatorId: string;
  amount?: number; // Gross amount in AI3 for partial withdrawal (total to receive)
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
    if (!senderAddress || typeof senderAddress !== 'string' || senderAddress.trim().length === 0) {
      throw new Error('Valid sender address is required for fee estimation');
    }

    try {
      const tx = await withdrawalService.createWithdrawTransaction(params, senderAddress.trim());
      const paymentInfo = await tx.paymentInfo(senderAddress.trim());
      const feeInAI3 = parseFloat(shannonsToAi3(paymentInfo.partialFee.toString()));
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
    if (!senderAddress || typeof senderAddress !== 'string' || senderAddress.trim().length === 0) {
      throw new Error('Valid sender address is required for fee estimation');
    }

    try {
      const tx = await withdrawalService.createUnlockTransaction(params);
      const paymentInfo = await tx.paymentInfo(senderAddress.trim());
      const feeInAI3 = parseFloat(shannonsToAi3(paymentInfo.partialFee.toString()));
      return feeInAI3;
    } catch (error) {
      console.error('Unlock fee estimation failed:', error);
      return 0.01; // Fallback fee
    }
  },

  /**
   * Create a withdraw extrinsic via helpers
   * @param params - Withdrawal parameters
   * @param senderAddress - Address of the account that will send the transaction
   * @returns Transaction ready for signing and sending
   */
  createWithdrawTransaction: async (params: WithdrawalParams, senderAddress: string) => {
    if (!params) {
      throw new Error('Withdrawal parameters are required');
    }

    const { operatorId, amount, withdrawalType } = params;

    if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
      throw new Error('Valid operator ID is required');
    }

    if (!senderAddress || typeof senderAddress !== 'string' || senderAddress.trim().length === 0) {
      throw new Error('Valid sender address is required');
    }

    const api = await getSharedApiConnection();

    if (withdrawalType === 'all') {
      return withdrawStakeAll({
        api,
        operatorId: operatorId.trim(),
        account: senderAddress.trim(),
      });
    }

    if (withdrawalType !== 'partial') {
      throw new Error(`Unsupported withdrawal type: ${String(withdrawalType)}`);
    }

    if (
      amount === undefined ||
      amount === null ||
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error('Amount must be a positive number for partial withdrawal');
    }

    const amountInShannons = ai3ToShannons(amount.toString());
    return withdrawStakeByValue({
      api,
      operatorId: operatorId.trim(),
      account: senderAddress.trim(),
      amountToWithdraw: amountInShannons,
    });
  },

  /**
   * Create an unlock transaction (funds or nominator)
   * @param params - Unlock parameters
   * @returns Transaction ready for signing and sending
   */
  createUnlockTransaction: async (params: UnlockParams) => {
    if (!params) {
      throw new Error('Unlock parameters are required');
    }

    const { operatorId } = params;

    if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
      throw new Error('Valid operator ID is required');
    }

    const api = await getSharedApiConnection();

    return unlockFunds({
      api,
      operatorId: operatorId.trim(),
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
    if (
      !account?.address ||
      typeof account.address !== 'string' ||
      account.address.trim().length === 0
    ) {
      throw new Error('Valid account address is required');
    }

    if (!injector?.signer) {
      throw new Error('Wallet signer is required');
    }

    try {
      const tx = await withdrawalService.createWithdrawTransaction(params, account.address.trim());

      const res: TxResult = await signAndSendTx(
        tx,
        account.address.trim(),
        injector.signer,
        progressCallback,
      );
      return res;
    } catch (error) {
      if (isUserCancellationError(error)) {
        throw error;
      }
      console.error('Withdrawal transaction failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
      return {
        success: false,
        error: errorMessage || 'Unknown error occurred',
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
    if (
      !account?.address ||
      typeof account.address !== 'string' ||
      account.address.trim().length === 0
    ) {
      throw new Error('Valid account address is required');
    }

    if (!injector?.signer) {
      throw new Error('Wallet signer is required');
    }

    try {
      const tx = await withdrawalService.createUnlockTransaction(params);

      const res: TxResult = await signAndSendTx(
        tx,
        account.address.trim(),
        injector.signer,
        progressCallback,
      );
      return res;
    } catch (error) {
      if (isUserCancellationError(error)) {
        throw error;
      }
      console.error('Unlock transaction failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
      return {
        success: false,
        error: errorMessage || 'Unknown error occurred',
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
    if (!params || !Array.isArray(params.operatorIds)) {
      throw new Error('Valid batch unlock parameters are required');
    }

    if (
      !account?.address ||
      typeof account.address !== 'string' ||
      account.address.trim().length === 0
    ) {
      throw new Error('Valid account address is required');
    }

    if (!injector?.signer) {
      throw new Error('Wallet signer is required');
    }

    const { operatorIds } = params;

    if (operatorIds.length === 0) {
      return {
        success: true,
        results: [],
        totalSuccess: 0,
        totalFailed: 0,
      };
    }

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
          if (isUserCancellationError(error)) {
            // User rejected the signature request in wallet - abort subsequent requests to prevent spamming
            results.push({
              operatorId,
              success: false,
              error: 'Transaction cancelled by user',
            });
            totalFailed++;
            break;
          }

          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: unknown }).message)
                : String(error);
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
          completed: results.length,
          total: operatorIds.length,
        });
      }

      return {
        success: totalFailed === 0 && totalSuccess > 0,
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
