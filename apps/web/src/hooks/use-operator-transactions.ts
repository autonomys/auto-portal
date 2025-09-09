import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { indexerService } from '@/services/indexer-service';
import type { DepositRow, WithdrawalRow } from '@/types/indexer';
import type {
  OperatorTransaction,
  DepositTransaction,
  WithdrawalTransaction,
} from '@/types/transactions';

interface UseOperatorTransactionsOptions {
  pageSize?: number;
  refreshInterval?: number; // ms
}

interface UseOperatorTransactionsReturn {
  deposits: DepositRow[];
  withdrawals: WithdrawalRow[];
  transactions: OperatorTransaction[];
  depositsCount: number;
  withdrawalsCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  page: number;
  setPage: (p: number) => void;
}

const toDepositTx = (row: DepositRow): DepositTransaction => {
  const isPending = Number(row.pending_amount || '0') > 0;
  const status: DepositTransaction['status'] = isPending
    ? 'pending'
    : row.processed
      ? 'finalized'
      : 'processing';

  return {
    id: row.id,
    operatorId: row.operator_id,
    domainId: row.domain_id,
    address: row.address,
    timestamp: row.timestamp,
    blockHeight: row.block_height,
    extrinsicIds: row.extrinsic_ids,
    eventIds: row.event_ids,
    type: 'deposit',
    amount: row.pending_amount ?? '0',
    storageFee: row.pending_storage_fee_deposit ?? row.known_storage_fee_deposit ?? '0',
    effectiveEpoch: row.pending_effective_domain_epoch?.toString(),
    status,
  };
};

const toWithdrawalTx = (row: WithdrawalRow): WithdrawalTransaction => {
  const isPending = Number(row.total_pending_withdrawals || '0') > 0;
  const status: WithdrawalTransaction['status'] = isPending ? 'pending_unlock' : 'recorded';

  return {
    id: row.id,
    operatorId: row.operator_id,
    domainId: row.domain_id,
    address: row.address,
    timestamp: row.timestamp,
    blockHeight: row.block_height,
    extrinsicIds: row.extrinsic_ids,
    eventIds: row.event_ids,
    type: 'withdrawal',
    amount: row.total_withdrawal_amount ?? '0',
    storageFeeRefund: row.total_storage_fee_withdrawal ?? '0',
    unlockBlock: row.withdrawal_in_shares_unlock_block?.toString(),
    status,
  };
};

export const useOperatorTransactions = (
  operatorId: string,
  options: UseOperatorTransactionsOptions = {},
): UseOperatorTransactionsReturn => {
  const { pageSize = 25, refreshInterval } = options;
  const { isConnected, selectedAccount } = useWallet();

  const [page, setPage] = useState(0);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [depositsCount, setDepositsCount] = useState(0);
  const [withdrawalsCount, setWithdrawalsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isConnected || !selectedAccount || !operatorId) return;

    setLoading(true);
    setError(null);
    try {
      const [dep, wit] = await Promise.all([
        indexerService.getDepositsByOperator({
          address: selectedAccount.address,
          operatorId,
          limit: pageSize,
          offset: page * pageSize,
        }),
        indexerService.getWithdrawalsByOperator({
          address: selectedAccount.address,
          operatorId,
          limit: pageSize,
          offset: page * pageSize,
        }),
      ]);

      setDeposits(dep.rows);
      setWithdrawals(wit.rows);
      setDepositsCount(dep.totalCount);
      setWithdrawalsCount(wit.totalCount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(msg);

      console.error('useOperatorTransactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedAccount, operatorId, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [operatorId, selectedAccount?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    const id = setInterval(fetchData, refreshInterval);
    return () => clearInterval(id);
  }, [fetchData, refreshInterval]);

  const transactions = useMemo<OperatorTransaction[]>(() => {
    const depTxs = deposits.map(toDepositTx);
    const witTxs = withdrawals.map(toWithdrawalTx);
    return [...depTxs, ...witTxs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [deposits, withdrawals]);

  return {
    deposits,
    withdrawals,
    transactions,
    depositsCount,
    withdrawalsCount,
    totalCount: depositsCount + withdrawalsCount,
    loading,
    error,
    refetch: fetchData,
    page,
    setPage,
  };
};
