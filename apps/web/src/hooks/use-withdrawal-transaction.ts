import { useState, useCallback } from 'react';
import { useWallet } from './use-wallet';
import {
  withdrawalService,
  type WithdrawalParams,
  type UnlockParams,
  type WithdrawalResult,
} from '@/services/withdrawal-service';

export type WithdrawalTransactionState = 'idle' | 'signing' | 'pending' | 'success' | 'error';

interface UseWithdrawalTransactionReturn {
  // State
  withdrawalState: WithdrawalTransactionState;
  unlockState: WithdrawalTransactionState;
  withdrawalLoading: boolean;
  unlockLoading: boolean;
  withdrawalError: string | null;
  unlockError: string | null;
  withdrawalTxHash: string | null;
  unlockTxHash: string | null;
  withdrawalBlockHash: string | null;
  unlockBlockHash: string | null;
  estimatedWithdrawalFee: number | null;
  estimatedUnlockFee: number | null;
  feeLoading: boolean;

  // Actions
  executeWithdraw: (params: WithdrawalParams) => Promise<void>;
  executeUnlock: (params: UnlockParams) => Promise<void>;
  resetWithdrawal: () => void;
  resetUnlock: () => void;
  resetAll: () => void;
  estimateWithdrawalFee: (params: WithdrawalParams) => Promise<void>;
  estimateUnlockFee: (params: UnlockParams) => Promise<void>;

  // Computed
  isWithdrawalIdle: boolean;
  isWithdrawalSigning: boolean;
  isWithdrawalPending: boolean;
  isWithdrawalSuccess: boolean;
  isWithdrawalError: boolean;
  canExecuteWithdrawal: boolean;

  isUnlockIdle: boolean;
  isUnlockSigning: boolean;
  isUnlockPending: boolean;
  isUnlockSuccess: boolean;
  isUnlockError: boolean;
  canExecuteUnlock: boolean;
}

export const useWithdrawalTransaction = (): UseWithdrawalTransactionReturn => {
  const { selectedAccount, injector, isConnected } = useWallet();

  // Withdrawal state
  const [withdrawalState, setWithdrawalState] = useState<WithdrawalTransactionState>('idle');
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalTxHash, setWithdrawalTxHash] = useState<string | null>(null);
  const [withdrawalBlockHash, setWithdrawalBlockHash] = useState<string | null>(null);

  // Unlock state
  const [unlockState, setUnlockState] = useState<WithdrawalTransactionState>('idle');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockTxHash, setUnlockTxHash] = useState<string | null>(null);
  const [unlockBlockHash, setUnlockBlockHash] = useState<string | null>(null);

  // Fee estimation state
  const [estimatedWithdrawalFee, setEstimatedWithdrawalFee] = useState<number | null>(null);
  const [estimatedUnlockFee, setEstimatedUnlockFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const estimateWithdrawalFee = useCallback(
    async (params: WithdrawalParams) => {
      if (!isConnected || !selectedAccount) {
        return;
      }

      setFeeLoading(true);
      try {
        const fee = await withdrawalService.estimateWithdrawalFee(params, selectedAccount.address);
        setEstimatedWithdrawalFee(fee);
      } catch (err) {
        console.error('Withdrawal fee estimation error:', err);
        setEstimatedWithdrawalFee(0.01); // Fallback fee
      } finally {
        setFeeLoading(false);
      }
    },
    [isConnected, selectedAccount],
  );

  const estimateUnlockFee = useCallback(
    async (params: UnlockParams) => {
      if (!isConnected || !selectedAccount) {
        return;
      }

      setFeeLoading(true);
      try {
        const fee = await withdrawalService.estimateUnlockFee(params, selectedAccount.address);
        setEstimatedUnlockFee(fee);
      } catch (err) {
        console.error('Unlock fee estimation error:', err);
        setEstimatedUnlockFee(0.01); // Fallback fee
      } finally {
        setFeeLoading(false);
      }
    },
    [isConnected, selectedAccount],
  );

  const executeWithdraw = useCallback(
    async (params: WithdrawalParams) => {
      // Validate prerequisites
      if (!isConnected || !selectedAccount || !injector) {
        setWithdrawalError('Wallet not connected');
        setWithdrawalState('error');
        return;
      }

      if (withdrawalState !== 'idle') {
        console.warn('Withdrawal transaction already in progress');
        return;
      }

      // Reset previous state
      setWithdrawalError(null);
      setWithdrawalTxHash(null);
      setWithdrawalBlockHash(null);

      try {
        setWithdrawalState('signing');

        // Execute the withdrawal transaction
        const result: WithdrawalResult = await withdrawalService.requestWithdrawal(
          params,
          selectedAccount,
          injector,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (result.status?.isBroadcast) {
              setWithdrawalState('pending');
            }
          },
        );

        if (result.success) {
          setWithdrawalState('success');
          setWithdrawalTxHash(result.txHash || null);
          setWithdrawalBlockHash(result.blockHash || null);
        } else {
          setWithdrawalState('error');
          setWithdrawalError(result.error || 'Withdrawal transaction failed');
          setWithdrawalTxHash(result.txHash || null);
        }
      } catch (err) {
        setWithdrawalState('error');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setWithdrawalError(errorMessage);
        console.error('Withdrawal transaction error:', err);
      }
    },
    [isConnected, selectedAccount, injector, withdrawalState],
  );

  const executeUnlock = useCallback(
    async (params: UnlockParams) => {
      // Validate prerequisites
      if (!isConnected || !selectedAccount || !injector) {
        setUnlockError('Wallet not connected');
        setUnlockState('error');
        return;
      }

      if (unlockState !== 'idle') {
        console.warn('Unlock transaction already in progress');
        return;
      }

      // Reset previous state
      setUnlockError(null);
      setUnlockTxHash(null);
      setUnlockBlockHash(null);

      try {
        setUnlockState('signing');

        // Execute the unlock transaction
        const result: WithdrawalResult = await withdrawalService.unlockFunds(
          params,
          selectedAccount,
          injector,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (result.status?.isBroadcast) {
              setUnlockState('pending');
            }
          },
        );

        if (result.success) {
          setUnlockState('success');
          setUnlockTxHash(result.txHash || null);
          setUnlockBlockHash(result.blockHash || null);
        } else {
          setUnlockState('error');
          setUnlockError(result.error || 'Unlock transaction failed');
          setUnlockTxHash(result.txHash || null);
        }
      } catch (err) {
        setUnlockState('error');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setUnlockError(errorMessage);
        console.error('Unlock transaction error:', err);
      }
    },
    [isConnected, selectedAccount, injector, unlockState],
  );

  const resetWithdrawal = useCallback(() => {
    setWithdrawalState('idle');
    setWithdrawalError(null);
    setWithdrawalTxHash(null);
    setWithdrawalBlockHash(null);
    setEstimatedWithdrawalFee(null);
  }, []);

  const resetUnlock = useCallback(() => {
    setUnlockState('idle');
    setUnlockError(null);
    setUnlockTxHash(null);
    setUnlockBlockHash(null);
    setEstimatedUnlockFee(null);
  }, []);

  const resetAll = useCallback(() => {
    resetWithdrawal();
    resetUnlock();
    setFeeLoading(false);
  }, [resetWithdrawal, resetUnlock]);

  // Computed values
  const withdrawalLoading = withdrawalState === 'signing' || withdrawalState === 'pending';
  const unlockLoading = unlockState === 'signing' || unlockState === 'pending';

  const isWithdrawalIdle = withdrawalState === 'idle';
  const isWithdrawalSigning = withdrawalState === 'signing';
  const isWithdrawalPending = withdrawalState === 'pending';
  const isWithdrawalSuccess = withdrawalState === 'success';
  const isWithdrawalError = withdrawalState === 'error';
  const canExecuteWithdrawal =
    isConnected && !!selectedAccount && !!injector && withdrawalState === 'idle';

  const isUnlockIdle = unlockState === 'idle';
  const isUnlockSigning = unlockState === 'signing';
  const isUnlockPending = unlockState === 'pending';
  const isUnlockSuccess = unlockState === 'success';
  const isUnlockError = unlockState === 'error';
  const canExecuteUnlock = isConnected && !!selectedAccount && !!injector && unlockState === 'idle';

  return {
    // State
    withdrawalState,
    unlockState,
    withdrawalLoading,
    unlockLoading,
    withdrawalError,
    unlockError,
    withdrawalTxHash,
    unlockTxHash,
    withdrawalBlockHash,
    unlockBlockHash,
    estimatedWithdrawalFee,
    estimatedUnlockFee,
    feeLoading,

    // Actions
    executeWithdraw,
    executeUnlock,
    resetWithdrawal,
    resetUnlock,
    resetAll,
    estimateWithdrawalFee,
    estimateUnlockFee,

    // Computed
    isWithdrawalIdle,
    isWithdrawalSigning,
    isWithdrawalPending,
    isWithdrawalSuccess,
    isWithdrawalError,
    canExecuteWithdrawal,

    isUnlockIdle,
    isUnlockSigning,
    isUnlockPending,
    isUnlockSuccess,
    isUnlockError,
    canExecuteUnlock,
  };
};
