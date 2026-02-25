import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@/hooks/use-wallet';
import { useOperatorPosition } from '@/hooks/use-positions';
import { useOperatorTransactions } from '@/hooks/use-operator-transactions';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatAI3, formatNumber, formatTimeAgo } from '@/lib/formatting';
import { STAKE_RATIO } from '@/constants/staking';
import type { OperatorTransaction } from '@/types/transactions';
import type { UserPosition } from '@/types/position';

const buildPendingRows = (
  operatorId: string,
  position: UserPosition | null,
): OperatorTransaction[] => {
  if (!position) return [];
  const rows: OperatorTransaction[] = [];

  if (position.pendingDeposit) {
    const stakingAmount = position.pendingDeposit.amount;
    const totalAmount = stakingAmount / STAKE_RATIO;
    const storageFee = totalAmount - stakingAmount;
    rows.push({
      type: 'deposit',
      pending: true,
      operatorId,
      amount: String(stakingAmount),
      storageFee: String(storageFee),
      totalAmount: String(totalAmount),
      blockHeight: 0,
      timestamp: new Date(),
    });
  }

  for (const w of position.pendingWithdrawals) {
    rows.push({
      type: 'withdrawal',
      pending: true,
      operatorId,
      shares: '0',
      amount: String(w.grossWithdrawalAmount),
      storageFeeRefund: String(w.storageFeeRefund),
      blockHeight: 0,
      timestamp: new Date(),
    });
  }

  return rows;
};

const TransactionRow: React.FC<{ tx: OperatorTransaction }> = ({ tx }) => {
  const isDeposit = tx.type === 'deposit';
  const isPending = !!tx.pending;

  const amountCell = () => {
    if (isDeposit) return formatAI3(tx.totalAmount, 4);
    const shares = BigInt(tx.shares);
    if (shares !== 0n) return `${formatNumber(tx.shares)} shares`;
    const amount = parseFloat(tx.amount);
    if (amount > 0) return formatAI3(tx.amount, 4);
    return '-';
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Badge variant={isDeposit ? 'default' : 'secondary'}>
            {isDeposit ? 'Deposit' : 'Withdrawal'}
          </Badge>
          {isPending && (
            <Badge variant="outline" className="text-warning-800 border-warning-200">
              Pending
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right font-mono">{amountCell()}</td>
      <td className="py-3 px-4 text-right text-muted-foreground">
        {isPending ? '-' : tx.blockHeight.toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right text-muted-foreground">
        {isPending ? 'Pending' : formatTimeAgo(tx.timestamp.getTime())}
      </td>
    </tr>
  );
};

export const OperatorDetailPage: React.FC = () => {
  const { operatorId = '' } = useParams();
  const { isConnected } = useWallet();
  const { position, loading: positionLoading } = useOperatorPosition(operatorId);
  const {
    transactions,
    loading: txLoading,
    error: txError,
    hasMore,
    loadMore,
  } = useOperatorTransactions(operatorId);

  const displayTransactions = useMemo(
    () => [...buildPendingRows(operatorId, position), ...transactions],
    [operatorId, position, transactions],
  );

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
          View your position and transaction history for this operator.
        </Text>
      </div>

      <div>
        <Text as="h3" variant="h5" className="mb-3">
          Transaction History
        </Text>
        {(txLoading || positionLoading) && displayTransactions.length === 0 ? (
          <Text variant="bodySmall" className="text-muted-foreground">
            Loading transactions...
          </Text>
        ) : txError ? (
          <Text variant="bodySmall" className="text-error-600">
            {txError}
          </Text>
        ) : displayTransactions.length === 0 ? (
          <Text variant="bodySmall" className="text-muted-foreground">
            No transactions found for this operator.
          </Text>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-2 px-4 text-left font-medium text-muted-foreground">Type</th>
                    <th className="py-2 px-4 text-right font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="py-2 px-4 text-right font-medium text-muted-foreground">
                      Block
                    </th>
                    <th className="py-2 px-4 text-right font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTransactions.map((tx, i) => (
                    <TransactionRow
                      key={
                        tx.pending ? `pending-${tx.type}-${i}` : `${tx.type}-${tx.blockHeight}-${i}`
                      }
                      tx={tx}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="mt-3 flex justify-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={txLoading}>
                  {txLoading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
