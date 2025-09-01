import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatAI3, formatNumber, formatPercentage, getAPYColor } from '@/lib/formatting';
import { usePositions } from '@/hooks/use-positions';
import { Tooltip } from '@/components/ui/tooltip';
import { ApyTooltip } from '@/components/operators/ApyTooltip';
import { OperatorPoolBreakdown } from '@/components/operators/OperatorPoolBreakdown';
import { PositionBreakdown } from '@/components/positions';
import type { Operator } from '@/types/operator';

interface OperatorCardProps {
  operator: Operator;
  onStake: (operatorId: string) => void;
  onWithdraw: (operatorId: string) => void;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({ operator, onStake, onWithdraw }) => {
  const { positions } = usePositions({ refreshInterval: 0 });
  const userPosition = positions.find(p => p.operatorId === operator.id);
  const getStatusVariant = (status: Operator['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'slashed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOperatorInitial = (name: string) => name.charAt(0).toUpperCase();

  const hasUserPosition =
    !!userPosition &&
    (userPosition.positionValue > 0 ||
      userPosition.storageFeeDeposit > 0 ||
      userPosition.pendingDeposit);

  return (
    <Card className="hover:shadow-lg hover:border-primary-200 transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {getOperatorInitial(operator.name)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{operator.name}</h3>
              <p className="text-sm text-muted-foreground">{operator.domainName}</p>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(operator.nominationTax)} tax
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusVariant(operator.status)}>{operator.status}</Badge>
            <div className="text-right">
              {operator.estimatedReturnDetails ? (
                <Tooltip
                  side="top"
                  content={<ApyTooltip windows={operator.estimatedReturnDetailsWindows} />}
                >
                  {(() => {
                    const displayApy = operator.estimatedReturnDetails.annualizedReturn * 100;
                    return (
                      <div className={`text-sm font-mono cursor-help ${getAPYColor(displayApy)}`}>
                        {displayApy.toFixed(2)}%
                      </div>
                    );
                  })()}
                </Tooltip>
              ) : (
                <div className="text-sm font-mono text-muted-foreground">NA</div>
              )}
              <div className="text-xs text-muted-foreground">Est. APY</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            {operator.totalPoolValue ? (
              <Tooltip
                side="top"
                content={
                  <OperatorPoolBreakdown
                    totalStaked={operator.totalStaked}
                    totalStorageFund={operator.totalStorageFund}
                  />
                }
              >
                <div className="text-2xl font-bold font-mono cursor-help">
                  {formatNumber(operator.totalPoolValue)} AI3
                </div>
              </Tooltip>
            ) : (
              <div className="text-2xl font-bold font-mono text-muted-foreground">--</div>
            )}
            <div className="text-xs text-muted-foreground">Operator Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">
              {typeof operator.nominatorCount === 'number'
                ? formatNumber(operator.nominatorCount)
                : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Nominators</div>
          </div>
        </div>

        {/* Your Position (if any) */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            {userPosition ? (
              <Tooltip content={<PositionBreakdown position={userPosition} />} side="top">
                <span className="text-sm font-medium text-foreground font-mono cursor-help whitespace-nowrap">
                  {formatAI3(
                    userPosition.positionValue +
                      userPosition.storageFeeDeposit +
                      (userPosition.pendingDeposit?.amount || 0),
                    2,
                  )}
                </span>
              </Tooltip>
            ) : (
              <span className="text-sm font-medium text-foreground font-mono">0.00</span>
            )}
            <div className="text-xs text-muted-foreground">Your Total Position</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => onStake(operator.id)}>
            Stake
          </Button>
          <Button
            variant="warningOutline"
            className="flex-1"
            onClick={() => onWithdraw(operator.id)}
            disabled={!hasUserPosition}
          >
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
