import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { formatAI3 } from '@/lib/formatting';
import { getWithdrawalPreview } from '@/lib/withdrawal-utils';
import type { UserPosition } from '@/types/position';

interface WithdrawalFormProps {
  position: UserPosition;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WithdrawalMethod = 'all' | 'partial';

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  position,
  onSuccess,
  onCancel,
}) => {
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('partial');
  const [amount, setAmount] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);

  const {
    executeWithdraw,
    withdrawalState,
    withdrawalError,
    estimatedWithdrawalFee,
    estimateWithdrawalFee,
    canExecuteWithdrawal,
  } = useWithdrawalTransaction();

  // Calculate withdrawal preview
  const withdrawalPreview = getWithdrawalPreview(
    withdrawalMethod === 'all' ? position.positionValue + position.storageFeeDeposit : amount,
    withdrawalMethod,
    position.positionValue,
    position.storageFeeDeposit,
  );

  // Estimate fee when amount changes
  useEffect(() => {
    if (withdrawalMethod === 'all' || (withdrawalMethod === 'partial' && amount > 0)) {
      estimateWithdrawalFee({
        operatorId: position.operatorId,
        amount:
          withdrawalMethod === 'all'
            ? position.positionValue
            : withdrawalPreview.netStakeWithdrawal,
        withdrawalType: withdrawalMethod,
      });
    }
  }, [
    withdrawalMethod,
    amount,
    position.operatorId,
    position.positionValue,
    estimateWithdrawalFee,
    withdrawalPreview.netStakeWithdrawal,
  ]);

  // Handle successful withdrawal
  useEffect(() => {
    if (withdrawalState === 'success') {
      onSuccess?.();
    }
  }, [withdrawalState, onSuccess]);

  const handleSubmit = async () => {
    if (!canExecuteWithdrawal) return;

    try {
      await executeWithdraw({
        operatorId: position.operatorId,
        amount: withdrawalMethod === 'all' ? undefined : withdrawalPreview.netStakeWithdrawal,
        withdrawalType: withdrawalMethod,
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    setShowPreview(false);
  };

  const handlePreview = () => {
    if (withdrawalMethod === 'all' || (withdrawalMethod === 'partial' && amount > 0)) {
      setShowPreview(true);
    }
  };

  const isValidAmount =
    withdrawalMethod === 'all' ||
    (amount > 0 && amount <= position.positionValue + position.storageFeeDeposit);

  if (showPreview) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif">Confirm Withdrawal</CardTitle>
          <p className="text-sm text-muted-foreground">Review withdrawal details</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Withdrawal Summary */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm">Operator:</span>
              <span className="font-medium">{position.operatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Net Stake Withdrawal:</span>
              <span className="font-mono">
                {formatAI3(withdrawalPreview.netStakeWithdrawal, 4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Storage Fee Refund:</span>
              <span className="font-mono text-green-600">
                +{formatAI3(withdrawalPreview.storageFeeRefund, 4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Transaction Fee:</span>
              <span className="font-mono">{formatAI3(estimatedWithdrawalFee || 0, 6)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-medium">
              <span>Total to Receive:</span>
              <span className="font-mono text-green-600">
                {formatAI3(withdrawalPreview.grossWithdrawalAmount, 4)}
              </span>
            </div>
            {withdrawalMethod === 'partial' && (
              <div className="flex justify-between">
                <span className="text-sm">Remaining Position:</span>
                <span className="font-mono">
                  {formatAI3(withdrawalPreview.remainingPosition, 4)}
                </span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {withdrawalError && (
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-sans">{withdrawalError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1"
              disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
            >
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={!canExecuteWithdrawal} className="flex-1">
              {withdrawalState === 'signing'
                ? 'Signing...'
                : withdrawalState === 'pending'
                  ? 'Broadcasting...'
                  : 'Confirm Withdrawal'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-serif">Withdraw from {position.operatorName}</CardTitle>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Stake Value:</span>
            <span className="font-mono font-semibold">{formatAI3(position.positionValue, 4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Storage Fee Deposit:</span>
            <span className="font-mono text-sm">{formatAI3(position.storageFeeDeposit, 4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Total Position:</span>
            <span className="font-mono font-semibold">
              {formatAI3(position.positionValue + position.storageFeeDeposit, 4)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Withdrawal Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium font-sans">Withdrawal Method</label>
          <div className="flex gap-2">
            <Button
              variant={withdrawalMethod === 'partial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWithdrawalMethod('partial')}
              className="flex-1"
            >
              Partial
            </Button>
            <Button
              variant={withdrawalMethod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWithdrawalMethod('all')}
              className="flex-1"
            >
              Full Withdrawal
            </Button>
          </div>
        </div>

        {/* Amount Input for Partial Withdrawal */}
        {withdrawalMethod === 'partial' && (
          <div className="space-y-2">
            <label className="text-sm font-medium font-sans">Total Amount to Receive</label>
            <div className="relative">
              <Input
                type="number"
                value={amount || ''}
                onChange={e => handleAmountChange(Number(e.target.value) || 0)}
                placeholder="Enter total amount you want to receive"
                max={position.positionValue + position.storageFeeDeposit}
                className="font-mono pr-12"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                AI3
              </span>
            </div>
            {amount > position.positionValue + position.storageFeeDeposit && (
              <p className="text-sm text-destructive">Amount exceeds your total position value</p>
            )}
          </div>
        )}

        {/* Preview Information */}
        {isValidAmount && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Net Stake Withdrawal:</span>
              <span className="font-mono">
                {formatAI3(withdrawalPreview.netStakeWithdrawal, 4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Storage Fee Refund:</span>
              <span className="font-mono text-green-600">
                +{formatAI3(withdrawalPreview.storageFeeRefund, 4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Withdrawal Percentage:</span>
              <span className="font-mono">{withdrawalPreview.percentage}%</span>
            </div>
            {withdrawalMethod === 'partial' && (
              <div className="flex justify-between text-sm">
                <span>Remaining Position:</span>
                <span className="font-mono">
                  {formatAI3(withdrawalPreview.remainingPosition, 4)}
                </span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total to Receive:</span>
              <span className="font-mono text-green-600">
                {formatAI3(withdrawalPreview.grossWithdrawalAmount, 4)}
              </span>
            </div>
          </div>
        )}

        {/* Warning about two-step process */}
        <div className="p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-sans">
            <span className="font-medium">Two-step process:</span> After withdrawal request, funds
            will have a locking period before you can claim them.
          </p>
        </div>

        {/* Error Display */}
        {withdrawalError && (
          <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-sans">{withdrawalError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePreview}
            disabled={
              !isValidAmount || withdrawalState === 'signing' || withdrawalState === 'pending'
            }
            className="flex-1"
          >
            {withdrawalState === 'signing' || withdrawalState === 'pending'
              ? 'Processing...'
              : 'Preview'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
