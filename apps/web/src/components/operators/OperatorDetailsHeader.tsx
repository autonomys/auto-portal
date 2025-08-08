import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressDisplay } from '@/components/wallet/AddressDisplay';
import { formatNumber, formatPercentage } from '@/lib/formatting';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';

interface OperatorDetailsHeaderProps {
  operator: Operator;
  userPosition?: UserPosition | null;
}

export const OperatorDetailsHeader: React.FC<OperatorDetailsHeaderProps> = ({
  operator,
  userPosition,
}) => {
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

  const calculateUserStakePercentage = (): string => {
    if (!userPosition || userPosition.positionValue === 0) {
      return '0.00';
    }

    const totalStaked = parseFloat(operator.totalStaked);
    if (totalStaked === 0) {
      return '0.00';
    }

    const userStakeValue =
      userPosition.positionValue +
      (userPosition.pendingDeposit ? userPosition.pendingDeposit.amount : 0);
    const percentage = (userStakeValue / totalStaked) * 100;

    return percentage.toFixed(2);
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        {/* Header Section */}
        <div className="inline-lg mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl text-code">
              {getOperatorInitial(operator.name)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-h2">{operator.name}</h1>
            <p className="text-body text-muted-foreground">Domain: {operator.domainName}</p>
          </div>
          <Badge variant={getStatusVariant(operator.status)} className="text-sm">
            {operator.status}
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-code">
              {formatPercentage(operator.nominationTax)}
            </p>
            <p className="text-body-small text-muted-foreground">Tax</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-code">{formatNumber(operator.totalStaked)} AI3</p>
            <p className="text-body-small text-muted-foreground">Total Staked</p>
          </div>
          {userPosition && userPosition.positionValue > 0 ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-code text-primary">
                {calculateUserStakePercentage()}%
              </p>
              <p className="text-body-small text-muted-foreground">Your Share</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-2xl font-bold text-code">
                {formatNumber(operator.minimumNominatorStake)} AI3
              </p>
              <p className="text-body-small text-muted-foreground">Min Stake</p>
            </div>
          )}
        </div>

        {/* User Position Details (if exists) */}
        {userPosition && userPosition.positionValue > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h4 className="text-h4 mb-3">Your Position</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-label text-muted-foreground">Current Stake:</span>
                <span className="text-code font-medium">
                  {formatNumber(userPosition.positionValue.toString())} AI3
                </span>
              </div>
              {userPosition.pendingDeposit && (
                <div className="flex justify-between items-center">
                  <span className="text-label text-muted-foreground">Pending:</span>
                  <span className="text-code font-medium text-warning">
                    {formatNumber(userPosition.pendingDeposit.amount.toString())} AI3
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-label text-muted-foreground">Storage Fund:</span>
                <span className="text-code font-medium">
                  {formatNumber((userPosition.positionValue * 0.2).toString())} AI3
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-4">
            <div>
              <span className="text-label text-muted-foreground block mb-1">Operator ID</span>
              <span className="text-code">{operator.id}</span>
            </div>
            <div>
              <span className="text-label text-muted-foreground block mb-1">Domain ID</span>
              <span className="text-code">{operator.domainId}</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-label text-muted-foreground block mb-1">Signing Key</span>
            <AddressDisplay address={operator.ownerAccount} showCopy={true} className="text-code" />
          </div>

          {/* Educational Footer */}
          <div className="text-body-small text-muted-foreground">
            <p className="mb-2">
              <span className="font-medium text-foreground">Storage Fund:</span> 20% of stakes
              support network infrastructure.
              <span className="font-medium text-foreground ml-4">Activation:</span> New stakes
              become active in the next epoch.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
