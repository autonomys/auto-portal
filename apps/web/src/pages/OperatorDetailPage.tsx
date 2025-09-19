import React from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@/hooks/use-wallet';
import { useOperatorTransactions } from '@/hooks/use-operator-transactions';
import { useOperatorPosition } from '@/hooks/use-positions';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { formatAI3, formatTimeAgo } from '@/lib/formatting';
import { Badge } from '@/components/ui/badge';
import { getSemanticColors, getTransactionStatusColors } from '@/lib/design-tokens';
import { shannonsToAI3, ai3ToShannons } from '@/lib/unit-conversions';
import type { OperatorTransaction } from '@/types/transactions';
import { STORAGE_FUND_PERCENTAGE } from '@/constants/staking';

export const OperatorDetailPage: React.FC = () => {
  const { operatorId = '' } = useParams();
  const { isConnected } = useWallet();
  const { position, loading: positionLoading } = useOperatorPosition(operatorId);

  const {
    transactions,
    deposits,
    withdrawals,
    loading,
    error,
    page,
    setPage,
    depositsCount,
    withdrawalsCount,
  } = useOperatorTransactions(operatorId, { pageSize: 25 });

  const transactionsToRender = React.useMemo<OperatorTransaction[]>(() => {
    const hasPendingDepositRow = transactions.some(
      t => t.type === 'deposit' && t.status === 'pending',
    );

    // If there is a pending deposit, but no pending deposit row, add a synthetic deposit row representing the pending deposit
    if (!hasPendingDepositRow && position?.pendingDeposit) {
      const domainIdCandidate: string =
        (transactions[0] && (transactions[0] as OperatorTransaction).domainId) ||
        (deposits[0] && deposits[0].domain_id) ||
        (withdrawals[0] && withdrawals[0].domain_id) ||
        '0';
      const { amount } = position.pendingDeposit;
      const storageAi3 = amount * (STORAGE_FUND_PERCENTAGE / (1 - STORAGE_FUND_PERCENTAGE));
      const syntheticDeposit: OperatorTransaction = {
        id: `synthetic-deposit-${operatorId}-${
          position.pendingDeposit.effectiveEpoch ?? 'unknown'
        }`,
        operatorId: operatorId,
        domainId: String(domainIdCandidate),
        address: '',
        timestamp: new Date().toISOString(),
        blockHeight: '',
        extrinsicIds: undefined,
        eventIds: undefined,
        type: 'deposit',
        amount: ai3ToShannons(amount),
        storageFeeDeposit: ai3ToShannons(storageAi3),
        effectiveEpoch: position.pendingDeposit.effectiveEpoch,
        status: 'pending',
      } as OperatorTransaction;

      return [syntheticDeposit, ...transactions];
    }

    return transactions;
  }, [transactions, position, operatorId, deposits, withdrawals]);

  if (!operatorId) {
    return (
      <div className="p-6">
        <Text variant="h5">Invalid operator</Text>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <Text variant="h5">Connect your wallet to view operator details.</Text>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Text as="h2" variant="h2">
          Operator {operatorId}
        </Text>
        <Text as="p" variant="bodySmall" className="text-muted-foreground">
          View your deposits and withdrawals for this operator.
        </Text>
        {isConnected && !positionLoading && position && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {position.pendingDeposit && (
              <Badge
                variant="outline"
                className="bg-warning-100 text-warning-800 border-warning-200"
              >
                Pending deposit
              </Badge>
            )}
            {position.pendingWithdrawals.length > 0 && (
              <Badge
                variant="outline"
                className="bg-warning-100 text-warning-800 border-warning-200"
              >
                {position.pendingWithdrawals.length} pending withdrawal
                {position.pendingWithdrawals.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Text as="h3" variant="h3">
            Transactions
          </Text>
          <div className="flex items-center gap-2">
            <Text variant="bodySmall" className="text-muted-foreground">
              Deposits: {depositsCount}
            </Text>
            <Text variant="bodySmall" className="text-muted-foreground">
              Withdrawals: {withdrawalsCount}
            </Text>
          </div>
        </div>

        {error && (
          <Text variant="bodySmall" className={getSemanticColors('error').text}>
            {error}
          </Text>
        )}

        {loading ? (
          <Text variant="bodySmall">Loading...</Text>
        ) : transactionsToRender.length === 0 ? (
          <Text variant="bodySmall" className="text-muted-foreground">
            No transactions found.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Staked Amount</th>
                  <th className="py-2 pr-4">Storage Fee Deposit</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Block</th>
                </tr>
              </thead>
              <tbody>
                {transactionsToRender.map(tx => {
                  const normalizedStatus = (() => {
                    if (tx.type === 'deposit') {
                      return tx.status === 'complete' ? 'confirmed' : 'pending';
                    }
                    return tx.status === 'complete' ? 'confirmed' : 'pending';
                  })();
                  const statusClasses = getTransactionStatusColors(
                    normalizedStatus as 'pending' | 'confirmed',
                  );
                  const date = new Date(tx.timestamp);
                  return (
                    <tr key={`${tx.type}-${tx.id}`} className="border-t">
                      <td className="py-2 pr-4 capitalize">{tx.type}</td>
                      <td className="py-2 pr-4">
                        {'amount' in tx ? formatAI3(shannonsToAI3(tx.amount)) : ''}
                      </td>
                      <td className="py-2 pr-4">
                        {'storageFeeDeposit' in tx
                          ? formatAI3(shannonsToAI3(tx.storageFeeDeposit))
                          : 'storageFeeRefund' in tx
                            ? formatAI3(shannonsToAI3(tx.storageFeeRefund))
                            : ''}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className={statusClasses.badge}>
                          {'status' in tx ? tx.status : ''}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4" title={date.toLocaleString()}>
                        {formatTimeAgo(date.getTime())}
                      </td>
                      <td className="py-2 pr-4">{tx.blockHeight}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <Button
            variant="secondary"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <Text variant="bodySmall" className="text-muted-foreground">
            Page {page + 1}
          </Text>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={loading || (deposits.length === 0 && withdrawals.length === 0)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};
