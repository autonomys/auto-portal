import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Operator } from '@/types/operator';

interface OperatorCardProps {
  operator: Operator;
  onStake: (operatorId: string) => void;
  onViewDetails: (operatorId: string) => void;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({
  operator,
  onStake,
  onViewDetails,
}) => {
  const getStatusVariant = (status: Operator['status']) => {
    switch (status) {
      case 'active':
        return 'default'; // Green badge
      case 'degraded':
        return 'secondary'; // Yellow/warning badge
      case 'inactive':
        return 'outline'; // Gray badge
      case 'slashed':
        return 'destructive'; // Red badge
      default:
        return 'outline';
    }
  };

  const getOperatorInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
  };

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
              <h3 className="text-lg font-semibold text-foreground">
                {operator.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {operator.domainName}
              </p>
            </div>
          </div>
          <Badge variant={getStatusVariant(operator.status)}>
            {operator.status}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {operator.currentAPY.toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-muted-foreground">APY</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {operator.nominationTax}%
            </div>
            <div className="text-sm font-medium text-muted-foreground">Tax</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatNumber(operator.minimumNominatorStake)}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Min Stake</div>
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-foreground font-mono">
              {formatNumber(operator.totalStaked)} AI3
            </div>
            <div className="text-xs text-muted-foreground">Total Staked</div>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {operator.nominatorCount}
            </div>
            <div className="text-xs text-muted-foreground">Nominators</div>
          </div>
        </div>

        {/* Performance */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Uptime</span>
            <span className="text-sm font-mono text-success-600">
              {operator.uptime.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${operator.uptime}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={() => onStake(operator.id)}
          >
            Stake
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onViewDetails(operator.id)}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};