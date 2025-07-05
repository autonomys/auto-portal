import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { formatAI3 } from '@/lib/formatting';
import { getWithdrawalPreview } from '@/lib/withdrawal-utils';
import { TransactionPreview } from '@/components/transaction';
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
  };

  const isValidAmount =
    withdrawalMethod === 'all' ||
    (amount > 0 && amount <= position.positionValue + position.storageFeeDeposit);

  const showPreview = withdrawalMethod === 'all' || (withdrawalMethod === 'partial' && amount > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Withdrawal Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">
            Withdraw from {position.operatorName}
          </CardTitle>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stake Value:</span>
              <span className="font-mono font-semibold">
                {formatAI3(position.positionValue, 4)}
              </span>
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
                  disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
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

          {/* Warning about two-step process */}
          <Alert variant="warning">
            <AlertDescription>
              <span className="font-medium">Two-step process:</span> After withdrawal request, funds
              will have a locking period before you can claim them.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {withdrawalError && (
            <Alert variant="destructive">
              <AlertDescription>{withdrawalError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 font-sans"
              disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !isValidAmount ||
                withdrawalState === 'signing' ||
                withdrawalState === 'pending' ||
                !canExecuteWithdrawal
              }
              className="flex-1 font-sans"
            >
              {withdrawalState === 'signing'
                ? 'Signing...'
                : withdrawalState === 'pending'
                  ? 'Broadcasting...'
                  : 'Withdraw Tokens'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <div>
        {showPreview && isValidAmount ? (
          (() => {
            const withdrawalItems: Array<{
              label: string;
              value: number;
              precision?: number;
              isPositive?: boolean;
              isNegative?: boolean;
              tooltip?: string;
            }> = [
              {
                label: 'Net Stake Withdrawal',
                value: withdrawalPreview.netStakeWithdrawal,
                precision: 4,
              },
              {
                label: 'Storage Fee Refund',
                value: withdrawalPreview.storageFeeRefund,
                precision: 4,
                isPositive: true,
                tooltip:
                  'Storage fees are refunded proportionally based on storage fund performance.',
              },
              {
                label: 'Transaction Fee',
                value: estimatedWithdrawalFee || 0,
                precision: 6,
                isNegative: true,
              },
            ];

            if (withdrawalMethod === 'partial') {
              withdrawalItems.push({
                label: 'Remaining Position',
                value: withdrawalPreview.remainingPosition,
                precision: 4,
                tooltip: 'The amount that will remain staked after this withdrawal.',
              });
            }

            const additionalInfo = (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-sans">Operator:</span>
                  <span className="font-medium">{position.operatorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-sans">
                    Withdrawal Percentage:
                  </span>
                  <span className="font-mono font-medium">{withdrawalPreview.percentage}%</span>
                </div>
              </div>
            );

            return (
              <TransactionPreview
                type="withdrawal"
                items={withdrawalItems}
                totalLabel="Total to Receive"
                totalValue={withdrawalPreview.grossWithdrawalAmount}
                additionalInfo={additionalInfo}
                notes={[
                  'Withdrawal requests are processed according to the protocol schedule',
                  'Storage fee refunds depend on storage fund performance',
                  'There is a locking period before funds can be claimed',
                  withdrawalMethod === 'partial'
                    ? 'Remaining stake will continue earning rewards'
                    : 'This will close your entire position with this operator',
                ]}
              />
            );
          })()
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="font-sans">
                  {withdrawalMethod === 'partial'
                    ? 'Enter an amount to see withdrawal preview'
                    : 'Review withdrawal details'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
