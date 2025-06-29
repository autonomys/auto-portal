import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePositions } from '@/hooks/use-positions';
import { formatAI3, formatTimeAgo } from '@/lib/formatting';
import type { UserPosition } from '@/types/position';

interface ActivePositionsTableProps {
  refreshInterval?: number;
  networkId?: string;
  onOperatorClick?: (operatorId: string) => void;
  onWithdrawClick?: (position: UserPosition) => void;
}

interface PositionRowProps {
  position: UserPosition;
  onOperatorClick?: (operatorId: string) => void;
  onWithdrawClick?: (position: UserPosition) => void;
}

const PositionRow: React.FC<PositionRowProps> = ({
  position,
  onOperatorClick,
  onWithdrawClick,
}) => {
  const getStatusVariant = (status: UserPosition['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'withdrawing':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: UserPosition['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'withdrawing':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h4 className="font-medium font-sans">{position.operatorName}</h4>
          <Badge variant={getStatusVariant(position.status)} className="text-xs">
            {position.status}
          </Badge>
        </div>

        {/* Position Details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground font-sans">
          <div>
            <span className="block text-xs text-muted-foreground">Storage Fee</span>
            <span className="font-mono">{formatAI3(position.storageFeeDeposit, 4)}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Last Updated</span>
            <span>{formatTimeAgo(position.lastUpdated.getTime())}</span>
          </div>
        </div>

        {/* Pending Operations */}
        {(position.pendingDeposits.length > 0 || position.pendingWithdrawals.length > 0) && (
          <div className="flex gap-4 text-sm">
            {position.pendingDeposits.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className={getStatusColor('pending')}>
                  {position.pendingDeposits.length} pending deposit
                  {position.pendingDeposits.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {position.pendingWithdrawals.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className={getStatusColor('withdrawing')}>
                  {position.pendingWithdrawals.length} pending withdrawal
                  {position.pendingWithdrawals.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-right space-y-2">
        <div className="text-xl font-mono font-bold text-foreground">
          {formatAI3(position.positionValue, 2)}
        </div>
        <div className="flex gap-2">
          {onWithdrawClick && position.status === 'active' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onWithdrawClick(position)}
              className="text-xs font-sans"
            >
              Withdraw
            </Button>
          )}
          {onOperatorClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOperatorClick(position.operatorId)}
              className="text-xs font-sans"
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActivePositionsTable: React.FC<ActivePositionsTableProps> = ({
  refreshInterval,
  networkId,
  onOperatorClick,
  onWithdrawClick,
}) => {
  const { positions, loading, error, lastUpdated } = usePositions({
    refreshInterval,
    networkId,
  });

  if (loading && positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse text-muted-foreground font-sans">
              Loading positions...
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
          <CardTitle className="font-serif">Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p className="font-sans">Failed to load positions</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-sans text-lg">No active positions found</p>
            <p className="text-sm mt-2">Stake with an operator to see your positions here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif">Active Positions</CardTitle>
          {lastUpdated && (
            <div className="text-xs text-muted-foreground font-sans">
              Last updated: {formatTimeAgo(lastUpdated.getTime())}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map(position => (
            <PositionRow
              key={position.operatorId}
              position={position}
              onOperatorClick={onOperatorClick}
              onWithdrawClick={onWithdrawClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
