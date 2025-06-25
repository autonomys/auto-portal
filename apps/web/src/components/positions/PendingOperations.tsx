import React from 'react';
import { usePositions } from '@/hooks/use-positions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PendingOperations: React.FC = () => {
  const { positions, loading, error } = usePositions();

  const allPendingDeposits = positions.flatMap(position =>
    position.pendingDeposits.map(deposit => ({
      ...deposit,
      operatorId: position.operatorId,
      operatorName: position.operatorName,
      type: 'deposit' as const,
    })),
  );

  const allPendingWithdrawals = positions.flatMap(position =>
    position.pendingWithdrawals.map(withdrawal => ({
      ...withdrawal,
      operatorId: position.operatorId,
      operatorName: position.operatorName,
      type: 'withdrawal' as const,
    })),
  );

  const allPendingOperations = [...allPendingDeposits, ...allPendingWithdrawals];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-pulse">Loading pending operations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">Failed to load pending operations: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (allPendingOperations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No pending operations</p>
            <p className="text-sm">All your operations have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allPendingOperations.map((operation, index) => (
            <div
              key={`${operation.operatorId}-${operation.type}-${index}`}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{operation.operatorName}</h4>
                  <Badge variant={operation.type === 'deposit' ? 'secondary' : 'destructive'}>
                    {operation.type === 'deposit' ? 'Pending Deposit' : 'Pending Withdrawal'}
                  </Badge>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {operation.type === 'deposit' && 'effectiveEpoch' in operation && (
                    <div>Effective at epoch: {operation.effectiveEpoch}</div>
                  )}
                  {operation.type === 'withdrawal' && 'unlockAtBlock' in operation && (
                    <div>Unlocks at block: {operation.unlockAtBlock}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-lg">{operation.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
