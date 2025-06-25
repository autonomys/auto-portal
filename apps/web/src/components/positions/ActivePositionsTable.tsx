import React from 'react';
import { usePositions } from '@/hooks/use-positions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ActivePositionsTable: React.FC = () => {
  const { positions, loading, error } = usePositions();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-pulse">Loading positions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">Failed to load positions: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No active positions found</p>
            <p className="text-sm">Stake with an operator to see your positions here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map(position => (
            <div
              key={position.operatorId}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{position.operatorName}</h4>
                  <Badge
                    variant={
                      position.status === 'active'
                        ? 'default'
                        : position.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {position.status}
                  </Badge>
                </div>

                {/* Pending operations summary */}
                <div className="mt-2 text-sm text-muted-foreground">
                  {position.pendingDeposits.length > 0 && (
                    <div className="text-yellow-600">
                      {position.pendingDeposits.length} pending deposit
                      {position.pendingDeposits.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {position.pendingWithdrawals.length > 0 && (
                    <div className="text-orange-600">
                      {position.pendingWithdrawals.length} pending withdrawal
                      {position.pendingWithdrawals.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-lg">{position.positionValue}</div>
                <div className="text-sm text-muted-foreground">
                  Storage: {position.storageFeeDeposit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
