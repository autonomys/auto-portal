import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage } from '@/lib/formatting';
import type { Operator } from '@/types/operator';

interface OperatorCardProps {
  operator: Operator;
  onStake: (operatorId: string) => void;
  onViewDetails: (operatorId: string) => void;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({ operator, onStake, onViewDetails }) => {
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

  return (
    <Card className="hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer">
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
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusVariant(operator.status)}>{operator.status}</Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">
              {formatPercentage(operator.nominationTax)}
            </div>
            <div className="text-xs text-muted-foreground">Tax</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">
              {formatNumber(operator.minimumNominatorStake)}
            </div>
            <div className="text-xs text-muted-foreground">Min Stake</div>
          </div>
        </div>

        {/* Pool Stats */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground font-mono">
              {formatNumber(operator.totalStaked)} AI3
            </div>
            <div className="text-xs text-muted-foreground">Total Staked</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => onStake(operator.id)}>
            Stake
          </Button>
          <Button variant="secondary" onClick={() => onViewDetails(operator.id)}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
