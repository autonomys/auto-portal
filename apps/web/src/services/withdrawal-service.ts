import { getSharedApiConnection } from './api-service';
import { ai3ToShannons, shannonsToAI3 } from '@/lib/unit-conversion';
import { positionService } from './position-service';
import type { WithdrawalRequest, WithdrawalPreview, UnlockRequest } from '../types/position';

export interface WithdrawalResult {
  success: boolean;
  txHash?: string;
  error?: string;
  blockHash?: string;
}

export class WithdrawalService {
  private static instance: WithdrawalService;

  public static getInstance(): WithdrawalService {
    if (!WithdrawalService.instance) {
      WithdrawalService.instance = new WithdrawalService();
    }
    return WithdrawalService.instance;
  }

  /**
   * Get withdrawal preview with estimated amounts and fees
   */
  async getWithdrawalPreview(
    operatorId: string,
    amount: number,
    type: 'partial' | 'full',
    userAddress: string,
  ): Promise<WithdrawalPreview> {
    try {
      // Get current position data
      const positionSvc = await positionService();
      const position = await positionSvc.getPositionByOperator(userAddress, operatorId);

      if (!position) {
        throw new Error('No position found for operator');
      }

      const stakedAmount = type === 'full' ? position.positionValue : amount;
      const storageRatio = amount / position.positionValue;
      const storageAmount = position.storageFeeDeposit * storageRatio;
      const totalAmount = stakedAmount + storageAmount;

      // Get estimated fee
      const estimatedFee = await this.estimateWithdrawalFee(operatorId, stakedAmount, userAddress);

      // Get current block and calculate unlock block
      const api = await getSharedApiConnection();
      const currentBlock = await api.rpc.chain.getHeader();
      const unlockPeriod = 180; // blocks (adjust based on protocol)
      const unlockAt = currentBlock.number.toNumber() + unlockPeriod;

      // Estimate unlock time (assuming 6 second blocks)
      const estimatedUnlockTime = new Date(Date.now() + unlockPeriod * 6000).toISOString();

      return {
        stakedAmount: stakedAmount.toString(),
        storageAmount: storageAmount.toString(),
        totalAmount: totalAmount.toString(),
        estimatedFee: estimatedFee.toString(),
        unlockAt,
        estimatedUnlockTime,
      };
    } catch (error) {
      console.error('Error getting withdrawal preview:', error);
      throw new Error('Failed to get withdrawal preview');
    }
  }

  /**
   * Request withdrawal of staked tokens
   */
  async requestWithdrawal(
    request: WithdrawalRequest,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progressCallback?: (result: any) => void,
  ): Promise<WithdrawalResult> {
    try {
      const { operatorId, amount } = request;

      // Get API connection
      const api = await getSharedApiConnection();

      // Convert AI3 to shannons
      const amountInShannons = ai3ToShannons(parseFloat(amount));

      // Create the withdrawStake extrinsic
      // Note: This is a placeholder - actual implementation depends on available auto-consensus functions
      const tx = api.tx.domains.withdrawStake(operatorId, amountInShannons.toString());

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
      console.error('Error requesting withdrawal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request withdrawal',
      };
    }
  }

  /**
   * Unlock withdrawn funds after locking period
   */
  async unlockFunds(
    request: UnlockRequest,
    account: { address: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progressCallback?: (result: any) => void,
  ): Promise<WithdrawalResult> {
    try {
      const { operatorId } = request;

      // Get API connection
      const api = await getSharedApiConnection();

      // Create the unlockNominator extrinsic
      // Note: This is a placeholder - actual implementation depends on available auto-consensus functions
      const tx = api.tx.domains.unlockNominator(operatorId);

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
              console.log(`Unlock transaction included at blockHash ${status.asInblock}`);
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
      console.error('Error unlocking funds:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlock funds',
      };
    }
  }

  /**
   * Check if withdrawal is ready to unlock
   */
  async isReadyToUnlock(unlockAt: number): Promise<boolean> {
    try {
      const api = await getSharedApiConnection();
      const currentBlock = await api.rpc.chain.getHeader();
      return currentBlock.number.toNumber() >= unlockAt;
    } catch (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    try {
      const api = await getSharedApiConnection();
      const header = await api.rpc.chain.getHeader();
      return header.number.toNumber();
    } catch (error) {
      console.error('Error getting current block:', error);
      throw new Error('Failed to get current block');
    }
  }

  private async estimateWithdrawalFee(
    operatorId: string,
    amount: number,
    senderAddress: string,
  ): Promise<number> {
    try {
      // Get API connection
      const api = await getSharedApiConnection();

      // Convert AI3 to shannons
      const amountInShannons = ai3ToShannons(amount);

      // Create transaction to estimate fee
      const tx = api.tx.domains.withdrawStake(operatorId, amountInShannons.toString());
      const paymentInfo = await tx.paymentInfo(senderAddress);

      // Convert fee from shannons to AI3
      return shannonsToAI3(paymentInfo.partialFee.toString());
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 0.01; // Return reasonable fallback fee
    }
  }
}

export const withdrawalService = WithdrawalService.getInstance();
