import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Operator } from '@/types/operator';
import { formatAI3AmountWithCommas } from '@/lib/staking-utils';

interface OperatorSummaryProps {
  operator: Operator;
}

export const OperatorSummary: React.FC<OperatorSummaryProps> = ({ operator }) => {
  const getStatusBadgeVariant = (status: Operator['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'degraded':
        return 'destructive';
      case 'slashed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getOperatorInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl font-mono">
              {getOperatorInitial(operator.name)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-serif font-semibold text-foreground">{operator.name}</h2>
            <p className="text-muted-foreground font-sans">Domain: {operator.domainName}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(operator.status)} className="font-sans">
            {operator.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-mono">
              {operator.nominationTax}%
            </p>
            <p className="text-sm text-muted-foreground font-sans">Tax Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-mono">
              {operator.nominationTax}%
            </p>
            <p className="text-sm text-muted-foreground font-sans">Tax</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-mono">0%</p>
            <p className="text-sm text-muted-foreground font-sans">Your Share</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono text-foreground">
              {formatAI3AmountWithCommas(parseFloat(operator.totalStaked) / 1000000)} AI3
            </p>
            <p className="text-sm text-muted-foreground font-sans">Pool Size</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground font-sans">
            <span className="font-medium">{operator.nominatorCount} nominators</span> • Min stake:{' '}
            <span className="font-mono">
              {formatAI3AmountWithCommas(parseFloat(operator.minimumNominatorStake) / 1000000)} AI3
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
