import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  operatorId: string;
  unlockStatus?: WithdrawalUnlockStatus;
  onUnlock: (operatorId: string) => void;
  isUnlocking: boolean;
}

const PendingDepositItem: React.FC<PendingDepositItemProps> = ({ deposit, operatorName }) => (
  <div className="flex items-center justify-between p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      <div>
        <div className="font-medium font-sans text-sm">{operatorName}</div>
        <div className="text-xs text-muted-foreground font-sans">
          Deposit • Effective at epoch {formatNumber(deposit.effectiveEpoch)}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-mono font-semibold text-yellow-700">+{formatAI3(deposit.amount, 4)}</div>
      <Badge variant="secondary" className="text-xs">
        Pending
      </Badge>
    </div>
  </div>
);

const PendingWithdrawalItem: React.FC<PendingWithdrawalItemProps> = ({
  withdrawal,
  operatorName,
  operatorId,
  unlockStatus,
  onUnlock,
  isUnlocking,
}) => {
  const isUnlockable = unlockStatus?.isUnlockable || false;

  return (
    <div className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isUnlockable ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
          }`}
        ></div>
        <div className="text-left">
          <div className="font-medium font-sans text-sm text-left">{operatorName}</div>
          <div className="text-xs text-muted-foreground font-sans text-left">
            {isUnlockable ? (
              <span className="text-green-600 font-medium">Ready to unlock</span>
            ) : unlockStatus?.estimatedTimeRemaining ? (
              <div className="flex items-center gap-2 text-left">
                <div className="text-sm font-medium text-foreground">
                  Ready in {unlockStatus.estimatedTimeRemaining}
                </div>
                <Tooltip
                  content={`Unlocks at domain block ${withdrawal.unlockAtBlock > 0 ? formatNumber(withdrawal.unlockAtBlock) : 'TBD'}${unlockStatus.blocksRemaining > 0 ? ` (${formatNumber(unlockStatus.blocksRemaining)} blocks remaining)` : ''}`}
                  side="top"
                >
                  <div className="inline-flex items-center justify-center w-4 h-4 bg-muted rounded-full text-xs text-muted-foreground hover:bg-muted-foreground/20 cursor-help">
                    i
                  </div>
                </Tooltip>
              </div>
            ) : (
              <span>
                Withdrawal • Unlocks at domain block{' '}
                {withdrawal.unlockAtBlock > 0 ? formatNumber(withdrawal.unlockAtBlock) : 'TBD'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-start justify-end gap-4">
          <div className="text-right">
            <div className="font-mono font-semibold text-orange-700 text-lg">
              {formatAI3(withdrawal.grossWithdrawalAmount, 4)}
            </div>
            <div className="text-xs text-muted-foreground font-sans mb-2">
              Stake: {formatAI3(withdrawal.stakeWithdrawalAmount, 2)} + Refund:{' '}
              {formatAI3(withdrawal.storageFeeRefund, 2)}
            </div>
            <Badge variant={isUnlockable ? 'default' : 'destructive'} className="text-xs">
              {isUnlockable ? 'Unlockable' : 'Withdrawing'}
            </Badge>
          </div>
          {isUnlockable && (
            <Button
              size="sm"
              onClick={() => onUnlock(operatorId)}
              disabled={isUnlocking}
              className="text-xs px-4 py-2 h-auto"
            >
              {isUnlocking ? 'Unlocking...' : 'Claim'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PendingOperations: React.FC<PendingOperationsProps> = ({
  refreshInterval,
  networkId,
}) => {
  const { positions, loading, error, refetch } = usePositions({
    refreshInterval,
    networkId,
  });

  const { executeUnlock, unlockState, unlockError, resetUnlock } = useWithdrawalTransaction();

  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Map<string, WithdrawalUnlockStatus>>(
    new Map(),
  );
  const [unlockingOperator, setUnlockingOperator] = useState<string | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  // Collect all pending deposits sorted by epoch
  const allPendingDeposits = useMemo(() => {
    const deps: Array<PendingDeposit & { operatorName: string }> = [];
    positions.forEach(position => {
      position.pendingDeposits.forEach(deposit => {
        deps.push({ ...deposit, operatorName: position.operatorName });
      });
    });
    deps.sort((a, b) => a.effectiveEpoch - b.effectiveEpoch);
    return deps;
  }, [positions]);

  // Collect all pending withdrawals sorted by unlock block
  const allPendingWithdrawals = useMemo(() => {
    const wds: Array<PendingWithdrawal & { operatorName: string; operatorId: string }> = [];
    positions.forEach(position => {
      position.pendingWithdrawals.forEach(withdrawal => {
        wds.push({
          ...withdrawal,
          operatorName: position.operatorName,
          operatorId: position.operatorId,
        });
      });
    });
    wds.sort((a, b) => a.unlockAtBlock - b.unlockAtBlock);
    return wds;
  }, [positions]);

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

  // Handle unlock success
  useEffect(() => {
    if (unlockState === 'success') {
      // Refresh positions data
      refetch();
      // Reset unlock state
      resetUnlock();
      setUnlockingOperator(null);
    }
  }, [unlockState, refetch, resetUnlock]);

  const handleUnlock = async (operatorId: string) => {
    setUnlockingOperator(operatorId);

    try {
      await executeUnlock({
        operatorId,
        unlockType: 'funds', // Default to unlockFunds
      });
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockingOperator(null);
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
          {/* Error display for unlock failures */}
          {unlockError && (
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-sans">Unlock failed: {unlockError}</p>
            </div>
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
                      operatorId={withdrawal.operatorId}
                      unlockStatus={unlockStatus}
                      onUnlock={handleUnlock}
                      isUnlocking={unlockingOperator === withdrawal.operatorId}
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
