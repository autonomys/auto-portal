import { useState, useCallback } from 'react';
import { useWallet } from './use-wallet';
import {
  withdrawalService,
  type WithdrawalParams,
  type UnlockParams,
  type BatchUnlockParams,
  type WithdrawalResult,
  type BatchWithdrawalResult,
} from '@/services/withdrawal-service';
import { isUserCancellationError } from '@/services/tx-utils';

export type WithdrawalTransactionState = 'idle' | 'signing' | 'pending' | 'success' | 'error';

interface UseWithdrawalTransactionReturn {
  // State
  withdrawalState: WithdrawalTransactionState;
  unlockState: WithdrawalTransactionState;
  batchUnlockState: WithdrawalTransactionState;
  withdrawalLoading: boolean;
  unlockLoading: boolean;
  batchUnlockLoading: boolean;
  withdrawalError: string | null;
  unlockError: string | null;
  batchUnlockError: string | null;
  withdrawalTxHash: string | null;
  unlockTxHash: string | null;
  withdrawalBlockHash: string | null;
  unlockBlockHash: string | null;
  estimatedWithdrawalFee: number | null;
  estimatedUnlockFee: number | null;
  feeLoading: boolean;
  batchUnlockProgress: { completed: number; total: number; current?: string } | null;
  batchUnlockResult: BatchWithdrawalResult | null;
  wasWithdrawalCancelled: boolean;
  wasUnlockCancelled: boolean;

  // Actions
  executeWithdraw: (params: WithdrawalParams) => Promise<void>;
  executeUnlock: (params: UnlockParams) => Promise<void>;
  executeBatchUnlock: (params: BatchUnlockParams) => Promise<void>;
  resetWithdrawal: () => void;
  resetUnlock: () => void;
  resetBatchUnlock: () => void;
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

  isBatchUnlockIdle: boolean;
  isBatchUnlockSigning: boolean;
  isBatchUnlockPending: boolean;
  isBatchUnlockSuccess: boolean;
  isBatchUnlockError: boolean;
  canExecuteBatchUnlock: boolean;
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

  // Batch unlock state
  const [batchUnlockState, setBatchUnlockState] = useState<WithdrawalTransactionState>('idle');
  const [batchUnlockError, setBatchUnlockError] = useState<string | null>(null);
  const [batchUnlockProgress, setBatchUnlockProgress] = useState<{
    completed: number;
    total: number;
    current?: string;
  } | null>(null);
  const [batchUnlockResult, setBatchUnlockResult] = useState<BatchWithdrawalResult | null>(null);

  // Fee estimation state
  const [estimatedWithdrawalFee, setEstimatedWithdrawalFee] = useState<number | null>(null);
  const [estimatedUnlockFee, setEstimatedUnlockFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [wasWithdrawalCancelled, setWasWithdrawalCancelled] = useState(false);
  const [wasUnlockCancelled, setWasUnlockCancelled] = useState(false);

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
      setWasWithdrawalCancelled(false);

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
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        if (isUserCancellationError(err)) {
          setWithdrawalState('idle');
          setWithdrawalError(null);
          setWasWithdrawalCancelled(true);
        } else {
          setWithdrawalState('error');
          setWithdrawalError(errorMessage);
          console.error('Withdrawal transaction error:', err);
        }
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
      setWasUnlockCancelled(false);

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
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        if (isUserCancellationError(err)) {
          setUnlockState('idle');
          setUnlockError(null);
          setWasUnlockCancelled(true);
        } else {
          setUnlockState('error');
          setUnlockError(errorMessage);
          console.error('Unlock transaction error:', err);
        }
      }
    },
    [isConnected, selectedAccount, injector, unlockState],
  );

  const executeBatchUnlock = useCallback(
    async (params: BatchUnlockParams) => {
      // Validate prerequisites
      if (!isConnected || !selectedAccount || !injector) {
        setBatchUnlockError('Wallet not connected');
        setBatchUnlockState('error');
        return;
      }

      if (batchUnlockState !== 'idle') {
        console.warn('Batch unlock transaction already in progress');
        return;
      }

      // Reset previous state
      setBatchUnlockError(null);
      setBatchUnlockProgress(null);
      setBatchUnlockResult(null);

      try {
        setBatchUnlockState('signing');

        // Execute the batch unlock transaction
        const result: BatchWithdrawalResult = await withdrawalService.batchUnlockFunds(
          params,
          selectedAccount,
          injector,
          progress => {
            setBatchUnlockProgress(progress);
            if (progress.completed === 0) {
              setBatchUnlockState('pending');
            }
          },
        );

        setBatchUnlockResult(result);
        if (result.success) {
          setBatchUnlockState('success');
        } else {
          setBatchUnlockState('error');
          setBatchUnlockError(
            `Batch unlock failed: ${result.totalFailed} of ${result.results.length} operations failed`,
          );
        }
      } catch (err) {
        setBatchUnlockState('error');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setBatchUnlockError(errorMessage);
        console.error('Batch unlock transaction error:', err);
      }
    },
    [isConnected, selectedAccount, injector, batchUnlockState],
  );

  const resetWithdrawal = useCallback(() => {
    setWithdrawalState('idle');
    setWithdrawalError(null);
    setWithdrawalTxHash(null);
    setWithdrawalBlockHash(null);
    setEstimatedWithdrawalFee(null);
    setWasWithdrawalCancelled(false);
  }, []);

  const resetUnlock = useCallback(() => {
    setUnlockState('idle');
    setUnlockError(null);
    setUnlockTxHash(null);
    setUnlockBlockHash(null);
    setEstimatedUnlockFee(null);
    setWasUnlockCancelled(false);
  }, []);

  const resetBatchUnlock = useCallback(() => {
    setBatchUnlockState('idle');
    setBatchUnlockError(null);
    setBatchUnlockProgress(null);
    setBatchUnlockResult(null);
  }, []);

  const resetAll = useCallback(() => {
    resetWithdrawal();
    resetUnlock();
    resetBatchUnlock();
    setFeeLoading(false);
  }, [resetWithdrawal, resetUnlock, resetBatchUnlock]);

  // Computed values
  const withdrawalLoading = withdrawalState === 'signing' || withdrawalState === 'pending';
  const unlockLoading = unlockState === 'signing' || unlockState === 'pending';
  const batchUnlockLoading = batchUnlockState === 'signing' || batchUnlockState === 'pending';

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

  const isBatchUnlockIdle = batchUnlockState === 'idle';
  const isBatchUnlockSigning = batchUnlockState === 'signing';
  const isBatchUnlockPending = batchUnlockState === 'pending';
  const isBatchUnlockSuccess = batchUnlockState === 'success';
  const isBatchUnlockError = batchUnlockState === 'error';
  const canExecuteBatchUnlock =
    isConnected && !!selectedAccount && !!injector && batchUnlockState === 'idle';

  return {
    // State
    withdrawalState,
    unlockState,
    batchUnlockState,
    withdrawalLoading,
    unlockLoading,
    batchUnlockLoading,
    withdrawalError,
    unlockError,
    batchUnlockError,
    withdrawalTxHash,
    unlockTxHash,
    withdrawalBlockHash,
    unlockBlockHash,
    estimatedWithdrawalFee,
    estimatedUnlockFee,
    feeLoading,
    wasWithdrawalCancelled,
    wasUnlockCancelled,
    batchUnlockProgress,
    batchUnlockResult,

    // Actions
    executeWithdraw,
    executeUnlock,
    executeBatchUnlock,
    resetWithdrawal,
    resetUnlock,
    resetBatchUnlock,
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

    isBatchUnlockIdle,
    isBatchUnlockSigning,
    isBatchUnlockPending,
    isBatchUnlockSuccess,
    isBatchUnlockError,
    canExecuteBatchUnlock,
  };
};
