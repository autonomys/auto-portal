import { useState, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { stakingService, type StakingParams, type StakingResult } from '@/services/staking-service';
import { TRANSACTION_FEE } from '@/lib/staking-utils';
import { isUserCancellationError } from '@/services/tx-utils';

export type TransactionState = 'idle' | 'signing' | 'pending' | 'success' | 'error';

interface UseStakingTransactionReturn {
  // State
  state: TransactionState;
  loading: boolean;
  error: string | null;
  txHash: string | null;
  blockHash: string | null;
  estimatedFee: number | null;
  feeLoading: boolean;
  wasCancelled: boolean;

  // Actions
  execute: (params: StakingParams) => Promise<void>;
  reset: () => void;
  estimateFee: (params: StakingParams) => Promise<void>;

  // Computed
  isIdle: boolean;
  isSigning: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  canExecute: boolean;
}

export const useStakingTransaction = (): UseStakingTransactionReturn => {
  const { selectedAccount, injector, isConnected } = useWallet();

  const [state, setState] = useState<TransactionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [wasCancelled, setWasCancelled] = useState(false);

  const estimateFee = useCallback(
    async (params: StakingParams) => {
      if (!isConnected || !selectedAccount) {
        return;
      }

      setFeeLoading(true);
      try {
        const fee = await stakingService.estimateTransactionFee(params, selectedAccount.address);
        setEstimatedFee(fee);
      } catch (err) {
        console.error('Fee estimation error:', err);
        // Set fallback fee on error
        setEstimatedFee(TRANSACTION_FEE);
      } finally {
        setFeeLoading(false);
      }
    },
    [isConnected, selectedAccount],
  );

  const execute = useCallback(
    async (params: StakingParams) => {
      // Validate prerequisites
      if (!isConnected || !selectedAccount || !injector) {
        setError('Wallet not connected');
        setState('error');
        return;
      }

      if (state !== 'idle') {
        console.warn('Transaction already in progress');
        return;
      }

      // Reset previous state
      setError(null);
      setTxHash(null);
      setBlockHash(null);
      setWasCancelled(false);

      try {
        setState('signing');

        // Execute the staking transaction
        const result: StakingResult = await stakingService.nominate(
          params,
          selectedAccount,
          injector,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (result.status?.isBroadcast) {
              setState('pending');
            }
          },
        );

        if (result.success) {
          setState('success');
          setTxHash(result.txHash || null);
          setBlockHash(result.blockHash || null);
        } else {
          setState('error');
          setError(result.error || 'Transaction failed');
          setTxHash(result.txHash || null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        // Treat wallet rejection/cancel as a benign cancel, not an error
        if (isUserCancellationError(err)) {
          setState('idle');
          setError(null);
          setWasCancelled(true);
        } else {
          setState('error');
          setError(errorMessage);
          console.error('Staking transaction error:', err);
        }
      }
    },
    [isConnected, selectedAccount, injector, state],
  );

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setTxHash(null);
    setBlockHash(null);
    setEstimatedFee(null);
    setFeeLoading(false);
    setWasCancelled(false);
  }, []);

  // Computed values
  const loading = state === 'signing' || state === 'pending';
  const isIdle = state === 'idle';
  const isSigning = state === 'signing';
  const isPending = state === 'pending';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const canExecute = isConnected && !!selectedAccount && !!injector && state === 'idle';

  return {
    // State
    state,
    loading,
    error,
    txHash,
    blockHash,
    estimatedFee,
    feeLoading,
    wasCancelled,

    // Actions
    execute,
    reset,
    estimateFee,

    // Computed
    isIdle,
    isSigning,
    isPending,
    isSuccess,
    isError,
    canExecute,
  };
};
