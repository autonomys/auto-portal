import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import type { Operator } from '@/types/operator';
import { useOperatorPosition } from '@/hooks/use-positions';
import { formatAI3AmountWithCommas } from '@/lib/staking-utils';

interface OperatorSummaryProps {
  operator: Operator;
}

export const OperatorSummary: React.FC<OperatorSummaryProps> = ({ operator }) => {
  const { position: userPosition } = useOperatorPosition(operator.id);

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

  const getOperatorInitial = (name: string) => name.charAt(0).toUpperCase();

  // Calculate user's share percentage
  const calculateUserShare = (): string => {
    if (!userPosition || userPosition.positionValue === 0) {
      return '0.00';
    }

    const totalStaked = parseFloat(operator.totalStaked);
    if (totalStaked === 0) {
      return '0.00';
    }

    const userStake =
      userPosition.positionValue +
      (userPosition.pendingDeposit ? userPosition.pendingDeposit.amount : 0);
    const sharePercentage = (userStake / totalStaked) * 100;

    return sharePercentage.toFixed(2);
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="inline-md mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl text-code">
              {getOperatorInitial(operator.name)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-h2">{operator.name}</h2>
            <p className="text-body text-muted-foreground">Domain: {operator.domainName}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(operator.status)}>{operator.status}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-code">{operator.nominationTax}%</p>
            <p className="text-body-small text-muted-foreground">Tax Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-code">{calculateUserShare()}%</p>
            <div className="inline-xs justify-center">
              <p className="text-body-small text-muted-foreground">Your Share</p>
              <div className="relative group">
                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-caption rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max">
                  {!userPosition || userPosition.positionValue === 0 ? (
                    'You have no position with this operator'
                  ) : (
                    <div>
                      {userPosition.pendingDeposit ? (
                        <>
                          <div>
                            Active: {formatAI3AmountWithCommas(userPosition.positionValue)} AI3
                          </div>
                          <div>
                            Pending: {formatAI3AmountWithCommas(userPosition.pendingDeposit.amount)}{' '}
                            AI3
                          </div>
                          <div className="border-t border-gray-600 pt-1 mt-1 font-medium">
                            Total:{' '}
                            {formatAI3AmountWithCommas(
                              userPosition.positionValue + userPosition.pendingDeposit.amount,
                            )}{' '}
                            AI3
                          </div>
                        </>
                      ) : (
                        `Your position: ${formatAI3AmountWithCommas(userPosition.positionValue)} AI3`
                      )}
                    </div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-code">
              {formatAI3AmountWithCommas(parseFloat(operator.totalStaked))} AI3
            </p>
            <p className="text-body-small text-muted-foreground">Pool Size</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-body-small text-muted-foreground">
            Min stake:{' '}
            <span className="text-code">
              {formatAI3AmountWithCommas(parseFloat(operator.minimumNominatorStake))} AI3
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
