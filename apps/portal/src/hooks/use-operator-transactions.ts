import { useState, useEffect, useCallback, useRef } from 'react';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import { useWallet } from './use-wallet';
import { chainPulseClient } from '@/services/chain-pulse-client';
import type {
  OperatorTransaction,
  DepositTransaction,
  WithdrawalTransaction,
} from '@/types/transactions';

const PAGE_SIZE = 20;

const sortByTimestampDesc = (txs: OperatorTransaction[]): OperatorTransaction[] =>
  [...txs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

interface UseOperatorTransactionsReturn {
  transactions: OperatorTransaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useOperatorTransactions = (operatorId: string): UseOperatorTransactionsReturn => {
  const { isConnected, selectedAccount } = useWallet();
  const [transactions, setTransactions] = useState<OperatorTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositOffset, setDepositOffset] = useState(0);
  const [withdrawalOffset, setWithdrawalOffset] = useState(0);
  const [hasMoreDeposits, setHasMoreDeposits] = useState(true);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const requestIdRef = useRef(0);

  const fetchTransactions = useCallback(
    async (depOffset: number, wdOffset: number, append: boolean) => {
      if (!operatorId || !isConnected || !selectedAccount) return;

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const [deposits, withdrawals] = await Promise.all([
          hasMoreDeposits || !append
            ? chainPulseClient.getDeposits(operatorId, selectedAccount.address, {
                limit: PAGE_SIZE,
                offset: depOffset,
              })
            : Promise.resolve([]),
          hasMoreWithdrawals || !append
            ? chainPulseClient.getWithdrawals(operatorId, selectedAccount.address, {
                limit: PAGE_SIZE,
                offset: wdOffset,
              })
            : Promise.resolve([]),
        ]);

        if (requestId !== requestIdRef.current) return;

        const depositTxs: DepositTransaction[] = deposits.map(d => {
          const amount = shannonsToAi3(BigInt(d.amount));
          const storageFee = shannonsToAi3(BigInt(d.storage_fee));
          const totalAmount = shannonsToAi3(BigInt(d.amount) + BigInt(d.storage_fee));
          return {
            type: 'deposit' as const,
            operatorId: d.operator_id,
            amount,
            storageFee,
            totalAmount,
            blockHeight: d.block_height,
            timestamp: new Date(d.timestamp),
          };
        });

        const withdrawalTxs: WithdrawalTransaction[] = withdrawals.map(w => ({
          type: 'withdrawal' as const,
          operatorId: w.operator_id,
          shares: w.shares,
          amount: shannonsToAi3(BigInt(w.amount)),
          storageFeeRefund: shannonsToAi3(BigInt(w.storage_fee_refund)),
          blockHeight: w.block_height,
          timestamp: new Date(w.timestamp),
        }));

        const newTxs = [...depositTxs, ...withdrawalTxs];

        if (append) {
          setTransactions(prev => sortByTimestampDesc([...prev, ...newTxs]));
        } else {
          setTransactions(sortByTimestampDesc(newTxs));
        }

        setHasMoreDeposits(deposits.length >= PAGE_SIZE);
        setHasMoreWithdrawals(withdrawals.length >= PAGE_SIZE);
        setDepositOffset(depOffset + deposits.length);
        setWithdrawalOffset(wdOffset + withdrawals.length);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
        setError(msg);
        console.error('Transaction fetch error:', err);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [isConnected, selectedAccount, operatorId, hasMoreDeposits, hasMoreWithdrawals],
  );

  const refetch = useCallback(async () => {
    setDepositOffset(0);
    setWithdrawalOffset(0);
    setHasMoreDeposits(true);
    setHasMoreWithdrawals(true);
    await fetchTransactions(0, 0, false);
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (!hasMoreDeposits && !hasMoreWithdrawals) return;
    await fetchTransactions(depositOffset, withdrawalOffset, true);
  }, [fetchTransactions, depositOffset, withdrawalOffset, hasMoreDeposits, hasMoreWithdrawals]);

  useEffect(() => {
    setTransactions([]);
    setError(null);
    if (isConnected && selectedAccount) {
      setDepositOffset(0);
      setWithdrawalOffset(0);
      setHasMoreDeposits(true);
      setHasMoreWithdrawals(true);
      fetchTransactions(0, 0, false);
    }
    return () => {
      // Invalidate any in-flight fetch so it becomes a no-op after unmount.
      requestIdRef.current++; // eslint-disable-line react-hooks/exhaustive-deps
    };
  }, [isConnected, selectedAccount, operatorId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    transactions,
    loading,
    error,
    hasMore: hasMoreDeposits || hasMoreWithdrawals,
    loadMore,
    refetch,
  };
};
