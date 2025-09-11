import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { indexerService } from '@/services/indexer-service';
import type { DepositRow, WithdrawalRow } from '@/types/indexer';
import type {
  OperatorTransaction,
  DepositTransaction,
  WithdrawalTransaction,
} from '@/types/transactions';
import { deriveDepositStatus, deriveWithdrawalStatus } from '@/lib/transaction-status';
import { getCurrentDomainEpochIndex } from '@/lib/epoch-utils';
import {
  checkWithdrawalUnlockStatus,
  getCurrentDomainBlockNumber,
  type WithdrawalUnlockStatus,
} from '@/lib/withdrawal-utils';
import { multiplySharesBySharePrice } from '@/lib/fixed-point';

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

// legacy mappers replaced by rich mapping inside useMemo

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
  const [currentDomainEpoch, setCurrentDomainEpoch] = useState<number | null>(null);
  const [withdrawalUnlockStatuses, setWithdrawalUnlockStatuses] = useState<
    Array<WithdrawalUnlockStatus | null>
  >([]);
  const [epochToSharePrice, setEpochToSharePrice] = useState<Record<number, string>>({});

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

      // Determine domain id (prefer deposits, fallback to withdrawals)
      const domainIdStr = dep.rows[0]?.domain_id ?? wit.rows[0]?.domain_id;
      const domainIdNum = domainIdStr ? Number(domainIdStr) : NaN;

      // Resolve current domain epoch (RPC preferred, fallback to latest share price epoch)
      let resolvedEpoch: number | null = null;
      if (Number.isFinite(domainIdNum)) {
        try {
          resolvedEpoch = await getCurrentDomainEpochIndex(domainIdNum);
        } catch {
          // ignore, fallback below
        }
      }
      if (resolvedEpoch === null) {
        try {
          const latest = await indexerService.getOperatorLatestSharePrices(operatorId, 1);
          resolvedEpoch = latest[0]?.epoch_index ?? null;
        } catch {
          resolvedEpoch = null;
        }
      }

      // Fetch share prices for withdrawal epochs to derive amounts from shares
      let epochPriceMap: Record<number, string> = {};
      try {
        const epochs = wit.rows
          .map(r => Number(r.withdrawal_in_shares_domain_epoch || ''))
          .filter(e => Number.isFinite(e));
        const domainIdForPrices = domainIdStr;
        if (epochs.length > 0 && domainIdForPrices) {
          const priceRows = await indexerService.getOperatorSharePricesByEpochs(
            operatorId,
            domainIdForPrices,
            epochs,
          );
          epochPriceMap = priceRows.reduce<Record<number, string>>((acc, row) => {
            acc[row.epoch_index] = row.share_price;
            return acc;
          }, {});
        }
      } catch {
        epochPriceMap = {};
      }

      // Compute unlock statuses for withdrawals (use current domain block if available)
      let unlockStatuses: Array<WithdrawalUnlockStatus | null> = [];
      try {
        if (Number.isFinite(domainIdNum) && wit.rows.length > 0) {
          const currentBlock = await getCurrentDomainBlockNumber(Number(domainIdNum));
          unlockStatuses = await Promise.all(
            wit.rows.map(async row => {
              const unlockBlock = Number(row.withdrawal_in_shares_unlock_block || '0');
              if (!Number.isFinite(unlockBlock) || unlockBlock <= 0) return null;
              try {
                return await checkWithdrawalUnlockStatus(unlockBlock, currentBlock);
              } catch {
                return null;
              }
            }),
          );
        }
      } catch {
        unlockStatuses = [];
      }

      setCurrentDomainEpoch(resolvedEpoch);
      setEpochToSharePrice(epochPriceMap);
      setWithdrawalUnlockStatuses(unlockStatuses);

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
    const depTxs = deposits.map(row => {
      const status = deriveDepositStatus(row, currentDomainEpoch ?? undefined);
      const tx: DepositTransaction = {
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
      return tx;
    });

    const witTxs = withdrawals.map((row, idx) => {
      const unlockStatus = withdrawalUnlockStatuses[idx] ?? undefined;
      const status = deriveWithdrawalStatus(row, unlockStatus);

      // Derive amount from shares when needed: amount = shares * share_price / 1e18
      let amount = row.total_withdrawal_amount ?? '0';
      const hasProvidedAmount = Number(amount || '0') > 0;
      const sharesStr = row.withdrawal_in_shares_amount;
      const epochStr = row.withdrawal_in_shares_domain_epoch;

      if (!hasProvidedAmount && sharesStr && epochStr) {
        const epochIndex = Number(epochStr);
        const sharePrice = epochToSharePrice[epochIndex];
        if (sharePrice) {
          amount = multiplySharesBySharePrice(sharesStr, sharePrice);
        }
      }

      const tx: WithdrawalTransaction = {
        id: row.id,
        operatorId: row.operator_id,
        domainId: row.domain_id,
        address: row.address,
        timestamp: row.timestamp,
        blockHeight: row.block_height,
        extrinsicIds: row.extrinsic_ids,
        eventIds: row.event_ids,
        type: 'withdrawal',
        amount: amount,
        storageFeeRefund: row.total_storage_fee_withdrawal ?? '0',
        unlockBlock: row.withdrawal_in_shares_unlock_block?.toString(),
        status,
      };
      return tx;
    });
    return [...depTxs, ...witTxs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [deposits, withdrawals, currentDomainEpoch, withdrawalUnlockStatuses]);

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
