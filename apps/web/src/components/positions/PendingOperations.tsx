import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePositions } from '@/hooks/use-positions';
import { useWallet } from '@/hooks/use-wallet';
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { withdrawalService } from '@/services/withdrawal-service';
import { formatAI3, formatNumber } from '@/lib/formatting';
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
  onUnlock?: (operatorId: string) => void;
  isUnlocking?: boolean;
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
  onUnlock,
  isUnlocking = false,
}) => {
  const [isReadyToUnlock, setIsReadyToUnlock] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  useEffect(() => {
    const checkUnlockStatus = async () => {
      try {
        const ready = await withdrawalService.isReadyToUnlock(withdrawal.unlockAtBlock);
        const block = await withdrawalService.getCurrentBlock();
        setIsReadyToUnlock(ready);
        setCurrentBlock(block);
      } catch (error) {
        console.error('Error checking unlock status:', error);
      }
    };

    checkUnlockStatus();
    const interval = setInterval(checkUnlockStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [withdrawal.unlockAtBlock]);

  const handleUnlock = () => {
    if (onUnlock && isReadyToUnlock) {
      onUnlock(operatorId);
    }
  };

  const getRemainingBlocks = () => {
    if (!currentBlock) return null;
    return Math.max(0, withdrawal.unlockAtBlock - currentBlock);
  };

  const getStatusBadge = () => {
    if (isReadyToUnlock) {
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
          Ready to Unlock
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-xs">
        Withdrawing
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${isReadyToUnlock ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}
        ></div>
        <div>
          <div className="font-medium font-sans text-sm">{operatorName}</div>
          <div className="text-xs text-muted-foreground font-sans">
            Withdrawal • Unlocks at block {formatNumber(withdrawal.unlockAtBlock)}
            {currentBlock && !isReadyToUnlock && (
              <span className="ml-1">({getRemainingBlocks()} blocks remaining)</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <div className="font-mono font-semibold text-orange-700">
            -{formatAI3(withdrawal.amount, 4)}
          </div>
          {getStatusBadge()}
        </div>
        {isReadyToUnlock && (
          <Button size="sm" onClick={handleUnlock} disabled={isUnlocking} className="text-xs">
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </Button>
        )}
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
  const { selectedAccount, injector } = useWallet();
  const { unlockState, executeUnlock, resetUnlock } = useWithdrawalTransaction(
    selectedAccount,
    injector,
  );

  const handleUnlock = async (operatorId: string) => {
    try {
      await executeUnlock({
        operatorId,
        withdrawalId: operatorId, // Using operatorId as withdrawalId for now
      });

      // Refresh positions after successful unlock
      if (unlockState === 'success') {
        await refetch();
      }
    } catch (error) {
      console.error('Error unlocking funds:', error);
    }
  };

  // Reset unlock state when it's successful
  useEffect(() => {
    if (unlockState === 'success') {
      resetUnlock();
      refetch();
    }
  }, [unlockState, resetUnlock, refetch]);

  // Collect all pending operations
  const allPendingDeposits: Array<PendingDeposit & { operatorName: string }> = [];
  const allPendingWithdrawals: Array<
    PendingWithdrawal & { operatorName: string; operatorId: string }
  > = [];

  positions.forEach(position => {
    position.pendingDeposits.forEach(deposit => {
      allPendingDeposits.push({
        ...deposit,
        operatorName: position.operatorName,
      });
    });

    position.pendingWithdrawals.forEach(withdrawal => {
      allPendingWithdrawals.push({
        ...withdrawal,
        operatorName: position.operatorName,
        operatorId: position.operatorId,
      });
    });
  });

  // Sort by epoch/block number
  allPendingDeposits.sort((a, b) => a.effectiveEpoch - b.effectiveEpoch);
  allPendingWithdrawals.sort((a, b) => a.unlockAtBlock - b.unlockAtBlock);

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
              <h4 className="text-sm font-medium text-muted-foreground font-sans mb-3">
                Pending Withdrawals ({allPendingWithdrawals.length})
              </h4>
              <div className="space-y-2">
                {allPendingWithdrawals.map((withdrawal, index) => (
                  <PendingWithdrawalItem
                    key={`${withdrawal.operatorName}-${withdrawal.unlockAtBlock}-${index}`}
                    withdrawal={withdrawal}
                    operatorName={withdrawal.operatorName}
                    operatorId={withdrawal.operatorId}
                    onUnlock={handleUnlock}
                    isUnlocking={unlockState === 'signing' || unlockState === 'pending'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
