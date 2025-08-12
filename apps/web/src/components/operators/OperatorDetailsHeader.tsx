import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressDisplay } from '@/components/wallet/AddressDisplay';
import { formatAI3 } from '@/lib/formatting';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

    const userStakeValue = userPosition.positionValue + (userPosition.pendingDeposit?.amount || 0);
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

        {/* Key Metrics Grid: Tax, Total Staked, Your Share */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <div className="text-center">
            <p className="text-2xl font-bold text-code text-primary">
              {userPosition ? `${calculateUserStakePercentage()}%` : '--'}
            </p>
            <p className="text-body-small text-muted-foreground">Your Share</p>
          </div>
        </div>

        {/* Two Cards: Left = Operator IDs; Right = Your Position breakdown, plus actions at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left card: Operator identifiers */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-h4 mb-3">Operator Details</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-label text-muted-foreground block mb-1">Operator ID</span>
                  <span className="text-code">{operator.id}</span>
                </div>
                <div>
                  <span className="text-label text-muted-foreground block mb-1">Domain ID</span>
                  <span className="text-code">{operator.domainId}</span>
                </div>
                <div>
                  <span className="text-label text-muted-foreground block mb-1">Signing Key</span>
                  <AddressDisplay
                    address={operator.ownerAccount}
                    showCopy={true}
                    className="text-code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right card: Your position (stacked) */}
          <Card>
            <CardContent className="pt-4 flex flex-col h-full">
              <h4 className="text-h4 mb-3">Your Position</h4>
              {userPosition ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-label text-muted-foreground">Staked (active)</span>
                    <span className="text-code">{formatAI3(userPosition.positionValue, 4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-label text-muted-foreground">Storage fund</span>
                    <span className="text-code">
                      {formatAI3(userPosition.storageFeeDeposit, 4)}
                    </span>
                  </div>
                  {userPosition.pendingDeposit && (
                    <div className="flex items-center justify-between">
                      <span className="text-label text-muted-foreground">
                        Pending (awaiting epoch)
                      </span>
                      <span className="text-code">
                        {formatAI3(userPosition.pendingDeposit.amount, 4)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-1 flex items-center justify-between">
                    <span className="text-body font-semibold">Total Value</span>
                    <span className="text-code font-bold">
                      {formatAI3(
                        userPosition.positionValue +
                          userPosition.storageFeeDeposit +
                          (userPosition.pendingDeposit?.amount || 0),
                        4,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No position yet</p>
                </div>
              )}

              {/* Actions bottom-aligned */}
              <div className="mt-auto pt-4">
                {userPosition ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 font-sans"
                      size="lg"
                      onClick={() => navigate(`/staking/${operator.id}`)}
                    >
                      Add More Stake
                    </Button>
                    <Button
                      variant="warningOutline"
                      className="flex-1 font-sans"
                      size="lg"
                      onClick={() => navigate(`/withdraw/${operator.id}`)}
                      disabled={userPosition.positionValue <= 0}
                    >
                      Withdraw Stake
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full font-sans"
                    size="lg"
                    onClick={() => navigate(`/staking/${operator.id}`)}
                    disabled={operator.status !== 'active'}
                  >
                    Stake to this Operator
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
