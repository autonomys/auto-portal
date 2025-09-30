import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { usePositions } from '@/hooks/use-positions';
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { formatAI3, formatNumber } from '@/lib/formatting';
import { checkWithdrawalUnlockStatus, type WithdrawalUnlockStatus } from '@/lib/withdrawal-utils';
import type { PendingDeposit, PendingWithdrawal } from '@/types/position';

interface PendingOperationsProps {
  refreshInterval?: number;
  networkId?: string;
}

interface PendingDepositItemProps {
  deposit: PendingDeposit;
  operatorName: string;
}

interface PendingWithdrawalItemProps {
  withdrawal: PendingWithdrawal;
  operatorName: string;
  unlockStatus?: WithdrawalUnlockStatus;
}

interface UnlockableSummaryProps {
  totalAmount: number;
  count: number;
  onClaimAll: () => void;
  isClaimingAll: boolean;
  progress?: { completed: number; total: number; current?: string } | null;
}

const PendingDepositItem: React.FC<PendingDepositItemProps> = ({ deposit, operatorName }) => (
  <div className="flex items-center justify-between p-3 bg-success-50 border border-success-200 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
      <div className="text-left">
        <div className="font-medium font-sans text-sm">{operatorName}</div>
        <div className="flex items-center gap-2 text-left">
          <div className="text-xs text-foreground font-sans">
            Effective at epoch {formatNumber(deposit.effectiveEpoch)}
          </div>
          <Tooltip
            content={`Converts to shares at epoch ${formatNumber(deposit.effectiveEpoch)}. Included in total as pending.`}
            side="top"
          >
            <div className="inline-flex items-center justify-center w-4 h-4 bg-muted rounded-full text-xs text-muted-foreground hover:bg-muted-foreground/20">
              i
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-mono font-semibold text-lg">+{formatAI3(deposit.amount, 4)}</div>
      <div className="text-xs text-muted-foreground font-sans mb-2">Staking portion</div>
      <Badge variant="success" size="sm">
        Pending
      </Badge>
    </div>
  </div>
);

const PendingWithdrawalItem: React.FC<PendingWithdrawalItemProps> = ({
  withdrawal,
  operatorName,
  unlockStatus,
}) => {
  const isUnlockable = unlockStatus?.isUnlockable || false;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isUnlockable
          ? 'bg-success-50 border border-success-200'
          : 'bg-warning-50 border border-warning-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isUnlockable ? 'bg-success-500' : 'bg-warning-500 animate-pulse'
          }`}
        ></div>
        <div className="text-left">
          <div className="font-medium font-sans text-sm text-left">{operatorName}</div>
          <div className="text-xs text-muted-foreground font-sans text-left">
            {isUnlockable ? (
              <span className="text-xs text-success-600 font-sans">Ready to unlock</span>
            ) : unlockStatus?.estimatedTimeRemaining ? (
              <div className="flex items-center gap-2 text-left">
                <div className="text-xs text-foreground font-sans">
                  Ready in {unlockStatus.estimatedTimeRemaining}
                </div>
                <Tooltip
                  content={`Unlocks at domain block ${withdrawal.unlockAtBlock > 0 ? formatNumber(withdrawal.unlockAtBlock) : 'TBD'}${unlockStatus.blocksRemaining > 0 ? ` (${formatNumber(unlockStatus.blocksRemaining)} blocks remaining)` : ''}`}
                  side="top"
                >
                  <div className="inline-flex items-center justify-center w-4 h-4 bg-muted rounded-full text-xs text-muted-foreground hover:bg-muted-foreground/20">
                    i
                  </div>
                </Tooltip>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground font-sans">
                Withdrawal • Unlocks at domain block{' '}
                {withdrawal.unlockAtBlock > 0 ? formatNumber(withdrawal.unlockAtBlock) : 'TBD'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-semibold text-lg">
          {formatAI3(withdrawal.grossWithdrawalAmount, 4)}
        </div>
        <div className="text-xs text-muted-foreground font-sans mb-2">
          Stake: {formatAI3(withdrawal.stakeWithdrawalAmount, 2)} + Refund:{' '}
          {formatAI3(withdrawal.storageFeeRefund, 2)}
        </div>
        <Badge variant={isUnlockable ? 'success' : 'warning'} size="sm">
          {isUnlockable ? 'Unlockable' : 'Withdrawing'}
        </Badge>
      </div>
    </div>
  );
};

const UnlockableSummary: React.FC<UnlockableSummaryProps> = ({
  totalAmount,
  count,
  onClaimAll,
  isClaimingAll,
  progress,
}) => (
  <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-success-800">
          Total Unlockable: {formatAI3(totalAmount, 4)} AI3
        </div>
        <div className="text-xs text-success-600">
          {count} withdrawal{count > 1 ? 's' : ''} ready
        </div>
        {progress && progress.total > 0 && (
          <div className="text-xs text-success-600 mt-1">
            Progress: {progress.completed}/{progress.total}
            {progress.current && ` (Processing ${progress.current})`}
          </div>
        )}
      </div>
      <Button
        onClick={onClaimAll}
        disabled={isClaimingAll}
        className="bg-black text-white hover:bg-gray-800"
      >
        {isClaimingAll ? 'Claiming...' : 'Claim All'}
      </Button>
    </div>
  </div>
);

export const PendingOperations: React.FC<PendingOperationsProps> = ({
  refreshInterval,
  networkId,
}) => {
  const { positions, loading, error, refetch } = usePositions({
    refreshInterval,
    networkId,
  });

  const {
    executeBatchUnlock,
    batchUnlockState,
    batchUnlockError,
    batchUnlockProgress,
    batchUnlockResult,
    resetBatchUnlock,
  } = useWithdrawalTransaction();

  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Map<string, WithdrawalUnlockStatus>>(
    new Map(),
  );
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  // Collect all pending deposits sorted by epoch
  const allPendingDeposits = useMemo(() => {
    const deps: Array<PendingDeposit & { operatorName: string }> = [];
    positions.forEach(position => {
      if (position.pendingDeposit) {
        deps.push({ ...position.pendingDeposit, operatorName: position.operatorName });
      }
    });
    deps.sort((a, b) => a.effectiveEpoch - b.effectiveEpoch);
    return deps;
  }, [positions]);

  // Collect all pending withdrawals sorted by unlock block
  const allPendingWithdrawals = useMemo(() => {
    const withdrawals: Array<PendingWithdrawal & { operatorName: string; operatorId: string }> = [];
    positions.forEach(position => {
      position.pendingWithdrawals.forEach(withdrawal => {
        withdrawals.push({
          ...withdrawal,
          operatorName: position.operatorName,
          operatorId: position.operatorId,
        });
      });
    });
    withdrawals.sort((a, b) => a.unlockAtBlock - b.unlockAtBlock);
    return withdrawals;
  }, [positions]);

  // Calculate unlockable withdrawals and total amount
  const unlockableData = useMemo(() => {
    const unlockable = allPendingWithdrawals.filter(withdrawal => {
      const statusKey = `${withdrawal.operatorId}-${withdrawal.unlockAtBlock}`;
      const unlockStatus = withdrawalStatuses.get(statusKey);
      return unlockStatus?.isUnlockable || false;
    });

    const totalAmount = unlockable.reduce(
      (sum, withdrawal) => sum + withdrawal.grossWithdrawalAmount,
      0,
    );
    const operatorIds = [...new Set(unlockable.map(w => w.operatorId))];

    return {
      withdrawals: unlockable,
      totalAmount,
      count: unlockable.length,
      operatorIds,
    };
  }, [allPendingWithdrawals, withdrawalStatuses]);

  // Check withdrawal unlock statuses
  useEffect(() => {
    const checkStatuses = async () => {
      if (allPendingWithdrawals.length === 0) return;

      try {
        const statusMap = new Map<string, WithdrawalUnlockStatus>();
        let currentBlockNumber: number | null = null;

        // Check each withdrawal's unlock status
        for (const withdrawal of allPendingWithdrawals) {
          const status = await checkWithdrawalUnlockStatus(withdrawal.unlockAtBlock);
          const key = `${withdrawal.operatorId}-${withdrawal.unlockAtBlock}`;
          statusMap.set(key, status);

          // Use the current block number from the first status check
          if (currentBlockNumber === null) {
            currentBlockNumber = status.currentDomainBlock;
          }
        }

        setWithdrawalStatuses(statusMap);
        setCurrentBlock(currentBlockNumber);
      } catch (err) {
        console.error('Failed to check withdrawal statuses:', err);
      }
    };

    checkStatuses();

    // Refresh statuses every 30 seconds
    const interval = setInterval(checkStatuses, 30000);
    return () => clearInterval(interval);
  }, [allPendingWithdrawals]);

  // Handle batch unlock success
  useEffect(() => {
    if (batchUnlockState === 'success') {
      // Refresh positions data
      refetch();
      // Reset batch unlock state after a short delay
      setTimeout(() => {
        resetBatchUnlock();
      }, 3000);
    }
  }, [batchUnlockState, refetch, resetBatchUnlock]);

  const handleClaimAll = async () => {
    if (unlockableData.operatorIds.length === 0) return;

    try {
      await executeBatchUnlock({
        operatorIds: unlockableData.operatorIds,
        unlockType: 'funds',
      });
    } catch (error) {
      console.error('Batch claim failed:', error);
    }
  };

  const totalPendingOperations = allPendingDeposits.length + allPendingWithdrawals.length;

  if (loading && positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Pending Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse text-muted-foreground font-sans">
              Loading pending operations...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Pending Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            <p className="font-sans">Failed to load pending operations</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalPendingOperations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Pending Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-sans">No pending operations</p>
            <p className="text-sm mt-1">All your transactions have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif">Pending Operations</CardTitle>
          <Badge variant="outline" className="text-xs font-sans">
            {totalPendingOperations} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Error display for batch unlock failures */}
          {batchUnlockError && (
            <Alert variant="destructive">
              <AlertDescription>Batch claim failed: {batchUnlockError}</AlertDescription>
            </Alert>
          )}

          {/* Success display for batch unlock results */}
          {batchUnlockResult && batchUnlockState === 'success' && (
            <Alert variant="success">
              <AlertDescription>
                Successfully claimed {batchUnlockResult.totalSuccess} of{' '}
                {batchUnlockResult.results.length} withdrawals
              </AlertDescription>
            </Alert>
          )}

          {/* Unlockable Summary */}
          {unlockableData.count > 0 && (
            <UnlockableSummary
              totalAmount={unlockableData.totalAmount}
              count={unlockableData.count}
              onClaimAll={handleClaimAll}
              isClaimingAll={batchUnlockState === 'signing' || batchUnlockState === 'pending'}
              progress={batchUnlockProgress}
            />
          )}

          {/* Pending Deposits */}
          {allPendingDeposits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground font-sans mb-3">
                Pending Deposits ({allPendingDeposits.length})
              </h4>
              <div className="space-y-2">
                {allPendingDeposits.map((deposit, index) => (
                  <PendingDepositItem
                    key={`${deposit.operatorName}-${deposit.effectiveEpoch}-${index}`}
                    deposit={deposit}
                    operatorName={deposit.operatorName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Withdrawals */}
          {allPendingWithdrawals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground font-sans">
                  Pending Withdrawals ({allPendingWithdrawals.length})
                </h4>
                {currentBlock && (
                  <div className="text-xs text-muted-foreground font-mono">
                    Current Domain Block: {formatNumber(currentBlock)}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {allPendingWithdrawals.map((withdrawal, index) => {
                  const statusKey = `${withdrawal.operatorId}-${withdrawal.unlockAtBlock}`;
                  const unlockStatus = withdrawalStatuses.get(statusKey);

                  return (
                    <PendingWithdrawalItem
                      key={`${withdrawal.operatorName}-${withdrawal.unlockAtBlock}-${index}`}
                      withdrawal={withdrawal}
                      operatorName={withdrawal.operatorName}
                      unlockStatus={unlockStatus}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
