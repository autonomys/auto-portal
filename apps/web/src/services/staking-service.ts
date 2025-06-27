import { nominateOperator } from '@autonomys/auto-consensus';
import { ai3ToShannons, shannonsToAI3 } from '@/lib/unit-conversion';
import { getSharedApiConnection } from './api-service';

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
    try {
      // Create the transaction
      const tx = await stakingService.createNominateTransaction(params);

      // Get payment info for fee estimation
      const paymentInfo = await tx.paymentInfo(senderAddress);

      // Convert fee from shannons to AI3
      const feeInAI3 = shannonsToAI3(paymentInfo.partialFee.toString());

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
    const { operatorId, amount } = params;

    // Get API connection
    const api = await getSharedApiConnection();

    // Convert AI3 to shannons
    const amountInShannons = ai3ToShannons(amount);

    // Create the nominateOperator extrinsic
    const tx = await nominateOperator({
      api,
      operatorId,
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
    try {
      // Create the transaction
      const tx = await stakingService.createNominateTransaction(params);

      return new Promise(resolve => {
        // Sign and send the transaction
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
              console.log(`Transaction included at blockHash ${status.asInBlock}`);
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
                  error: 'Transaction failed during execution',
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
              console.log(`Transaction finalized at blockHash ${status.asFinalized}`);
            } else if (status.isDropped || status.isInvalid) {
              resolve({
                success: false,
                error: 'Transaction was dropped or invalid',
                txHash: txHash.toString(),
              });
            }
          },
        );
      });
    } catch (error) {
      console.error('Staking transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
