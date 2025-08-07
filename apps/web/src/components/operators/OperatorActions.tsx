import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';

interface OperatorActionsProps {
  operator: Operator;
  userPosition?: UserPosition | null;
}

export const OperatorActions: React.FC<OperatorActionsProps> = ({ operator, userPosition }) => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  const handleStake = () => {
    navigate(`/staking/${operator.id}`);
  };

  const handleWithdraw = () => {
    navigate(`/withdraw/${operator.id}`);
  };

  const hasPosition = userPosition && userPosition.positionValue > 0;
  const isOperatorActive = operator.status === 'active';
  const canStake = isConnected && isOperatorActive;
  const canWithdraw = isConnected && hasPosition;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 font-sans" onClick={handleStake} disabled={!canStake} size="lg">
            {hasPosition ? 'Add More Stake' : 'Stake to this Operator'}
          </Button>

          {hasPosition && (
            <Button
              variant="outline"
              className="flex-1 font-sans"
              onClick={handleWithdraw}
              disabled={!canWithdraw}
              size="lg"
            >
              Withdraw Stake
            </Button>
          )}
        </div>

        {!isConnected && (
          <p className="text-body-small text-muted-foreground mt-4 text-center">
            <span className="font-medium">Connect your wallet</span> to stake or withdraw tokens.
          </p>
        )}
        {isConnected && !isOperatorActive && (
          <p className="text-body-small text-muted-foreground mt-4 text-center">
            This operator is currently <span className="font-medium">{operator.status}</span> and
            not accepting new stakes.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
