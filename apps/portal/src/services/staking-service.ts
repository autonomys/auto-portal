import { nominateOperator } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from './api-service';
import { signAndSendTx, type TxResult, isUserCancellationError } from './tx-utils';
import { shannonsToAi3, ai3ToShannons } from '@autonomys/auto-utils';

export interface StakingParams {
  operatorId: string;
  amount: number; // Amount in AI3
}

export interface StakingResult {
  success: boolean;
  txHash?: string;
  error?: string;
  blockHash?: string;
}

export interface FeeEstimation {
  partialFee: string; // Fee in AI3
  weight: string;
}

export const stakingService = {
  /**
   * Estimate transaction fee for a nominate operation
   * @param params - Staking parameters (operatorId and amount in AI3)
   * @param senderAddress - Address of the account that will send the transaction
   * @returns Promise that resolves to fee estimation in AI3
   */
  estimateTransactionFee: async (params: StakingParams, senderAddress: string): Promise<number> => {
    if (!senderAddress || typeof senderAddress !== 'string' || senderAddress.trim().length === 0) {
      throw new Error('Valid sender address is required for fee estimation');
    }

    try {
      // Create the transaction
      const tx = await stakingService.createNominateTransaction(params);

      // Get payment info for fee estimation
      const paymentInfo = await tx.paymentInfo(senderAddress.trim());

      // Convert fee from shannons to AI3
      const feeInAI3 = parseFloat(shannonsToAi3(paymentInfo.partialFee.toString()));

      return feeInAI3;
    } catch (error) {
      console.error('Fee estimation failed:', error);
      // Return a reasonable fallback fee if estimation fails
      return 0.01;
    }
  },

  /**
   * Create a nominateOperator extrinsic
   * @param params - Staking parameters (operatorId and amount in AI3)
   * @returns Transaction ready for signing and sending
   */
  createNominateTransaction: async (params: StakingParams) => {
    if (!params) {
      throw new Error('Staking parameters are required');
    }

    const { operatorId, amount } = params;

    if (!operatorId || typeof operatorId !== 'string' || operatorId.trim().length === 0) {
      throw new Error('Valid operator ID is required');
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Staking amount must be a positive number');
    }

    // Get API connection
    const api = await getSharedApiConnection();

    // Convert AI3 to shannons
    const amountInShannons = ai3ToShannons(amount.toString());

    // Create the nominateOperator extrinsic
    const tx = await nominateOperator({
      api,
      operatorId: operatorId.trim(),
      amountToStake: amountInShannons,
    });

    return tx;
  },

  /**
   * Sign and send a nominate transaction
   * @param params - Staking parameters
   * @param account - Account to sign with
   * @param injector - Wallet injector for signing
   * @param progressCallback - Optional callback for real-time transaction status updates
   * @returns Promise that resolves with transaction result
   */
  nominate: async (
    params: StakingParams,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progressCallback?: (result: any) => void,
  ): Promise<StakingResult> => {
    if (
      !account?.address ||
      typeof account.address !== 'string' ||
      account.address.trim().length === 0
    ) {
      throw new Error('Valid account address is required for nomination');
    }

    if (!injector?.signer) {
      throw new Error('Wallet signer is required for nomination');
    }

    try {
      // Create the transaction
      const tx = await stakingService.createNominateTransaction(params);

      const res: TxResult = await signAndSendTx(
        tx,
        account.address.trim(),
        injector.signer,
        progressCallback,
      );
      return res;
    } catch (error) {
      // Re-throw cancellations so UI can treat as benign cancel
      if (isUserCancellationError(error)) {
        throw error;
      }
      console.error('Staking transaction failed:', error);
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
};
