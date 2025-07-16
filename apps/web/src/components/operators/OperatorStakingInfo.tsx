import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatting';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';

interface OperatorStakingInfoProps {
  operator: Operator;
  userPosition?: UserPosition | null;
}

export const OperatorStakingInfo: React.FC<OperatorStakingInfoProps> = ({
  operator,
  userPosition,
}) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Staking Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stack-md">
          <div className="flex justify-between items-center">
            <span className="text-label text-muted-foreground">Minimum Stake Required:</span>
            <span className="text-code font-medium">
              {formatNumber(operator.minimumNominatorStake)} AI3
            </span>
          </div>

          {userPosition && userPosition.positionValue > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-label text-muted-foreground">Your Current Stake:</span>
                <span className="text-code font-medium text-primary">
                  {formatNumber(userPosition.positionValue.toString())} AI3 (
                  {calculateUserStakePercentage()}%)
                </span>
              </div>

              {userPosition.pendingDeposit && (
                <div className="flex justify-between items-center">
                  <span className="text-label text-muted-foreground">Pending Deposit:</span>
                  <span className="text-code font-medium text-warning">
                    {formatNumber(userPosition.pendingDeposit.amount.toString())} AI3
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-label text-muted-foreground">Your Current Stake:</span>
              <span className="text-code font-medium">0.00 AI3 (0.00%)</span>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <div className="stack-sm">
              <h4 className="text-h4">Storage Fund Information</h4>
              <p className="text-body-small text-muted-foreground">
                20% of your stake supports network infrastructure through the storage fund. This
                helps maintain the network's data availability and consensus mechanism.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="stack-sm">
              <h4 className="text-h4">Stake Activation</h4>
              <p className="text-body-small text-muted-foreground">
                New stakes are activated in the next epoch. Your rewards will start accumulating
                once your stake becomes active in the consensus process.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
