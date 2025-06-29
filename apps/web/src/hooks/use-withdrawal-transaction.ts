import { useState, useCallback } from 'react';
import { withdrawalService, type WithdrawalResult } from '@/services/withdrawal-service';
import type { WithdrawalRequest, UnlockRequest } from '@/types/position';

export type WithdrawalTransactionState = 'idle' | 'signing' | 'pending' | 'success' | 'error';

export interface UseWithdrawalTransactionResult {
  // Withdrawal state
  withdrawalState: WithdrawalTransactionState;
  withdrawalError: string | null;
  withdrawalTxHash: string | null;

  // Unlock state
  unlockState: WithdrawalTransactionState;
  unlockError: string | null;
  unlockTxHash: string | null;

  // Actions
  executeWithdraw: (request: WithdrawalRequest) => Promise<void>;
  executeUnlock: (request: UnlockRequest) => Promise<void>;

  // Reset functions
  resetWithdrawal: () => void;
  resetUnlock: () => void;
}

export const useWithdrawalTransaction = (
  account: { address: string } | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  injector: any,
): UseWithdrawalTransactionResult => {
  // Withdrawal state
  const [withdrawalState, setWithdrawalState] = useState<WithdrawalTransactionState>('idle');
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalTxHash, setWithdrawalTxHash] = useState<string | null>(null);

  // Unlock state
  const [unlockState, setUnlockState] = useState<WithdrawalTransactionState>('idle');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockTxHash, setUnlockTxHash] = useState<string | null>(null);

  const executeWithdraw = useCallback(
    async (request: WithdrawalRequest) => {
      if (!account || !injector) {
        setWithdrawalError('No account or injector available');
        return;
      }

      try {
        setWithdrawalState('signing');
        setWithdrawalError(null);
        setWithdrawalTxHash(null);

        const result: WithdrawalResult = await withdrawalService.requestWithdrawal(
          request,
          account,
          injector,
          progress => {
            if (progress.status.isReady) {
              setWithdrawalState('pending');
            }
          },
        );

        if (result.success) {
          setWithdrawalState('success');
          setWithdrawalTxHash(result.txHash || null);
        } else {
          setWithdrawalState('error');
          setWithdrawalError(result.error || 'Withdrawal failed');
        }
      } catch (error) {
        setWithdrawalState('error');
        setWithdrawalError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    },
    [account, injector],
  );

  const executeUnlock = useCallback(
    async (request: UnlockRequest) => {
      if (!account || !injector) {
        setUnlockError('No account or injector available');
        return;
      }

      try {
        setUnlockState('signing');
        setUnlockError(null);
        setUnlockTxHash(null);

        const result: WithdrawalResult = await withdrawalService.unlockFunds(
          request,
          account,
          injector,
          progress => {
            if (progress.status.isReady) {
              setUnlockState('pending');
            }
          },
        );

        if (result.success) {
          setUnlockState('success');
          setUnlockTxHash(result.txHash || null);
        } else {
          setUnlockState('error');
          setUnlockError(result.error || 'Unlock failed');
        }
      } catch (error) {
        setUnlockState('error');
        setUnlockError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    },
    [account, injector],
  );

  const resetWithdrawal = useCallback(() => {
    setWithdrawalState('idle');
    setWithdrawalError(null);
    setWithdrawalTxHash(null);
  }, []);

  const resetUnlock = useCallback(() => {
    setUnlockState('idle');
    setUnlockError(null);
    setUnlockTxHash(null);
  }, []);

  return {
    withdrawalState,
    withdrawalError,
    withdrawalTxHash,
    unlockState,
    unlockError,
    unlockTxHash,
    executeWithdraw,
    executeUnlock,
    resetWithdrawal,
    resetUnlock,
  };
};
