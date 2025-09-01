import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AmountInput } from './AmountInput';
//
import { useWithdrawalTransaction } from '@/hooks/use-withdrawal-transaction';
import { useOperators } from '@/hooks/use-operators';
import { useWallet } from '@/hooks/use-wallet';
import { formatAI3 } from '@/lib/formatting';
import { getWithdrawalPreview, validateWithdrawal } from '@/lib/withdrawal-utils';
import { TransactionPreview } from '@/components/transaction';
import type { UserPosition } from '@/types/position';

interface WithdrawalFormProps {
  position: UserPosition;
  onSuccess?: (withdrawalAmount: number, txHash?: string) => void;
  onCancel?: () => void;
}

type WithdrawalMethod = 'all' | 'partial';

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  position,
  onSuccess,
  onCancel,
}) => {
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('partial');
  const [amount, setAmount] = useState<string>('');
  const { operators } = useOperators();
  const { selectedAccount, isConnected } = useWallet();

  const {
    executeWithdraw,
    withdrawalState,
    withdrawalError,
    estimatedWithdrawalFee,
    estimateWithdrawalFee,
    canExecuteWithdrawal,
    withdrawalTxHash,
  } = useWithdrawalTransaction();

  // Find the operator data for validation
  const operator = operators.find(op => op.id === position.operatorId);

  // Parse amount as number when needed
  const amountNumber = parseFloat(amount) || 0;

  // Calculate withdrawal preview
  const withdrawalPreview = getWithdrawalPreview(
    withdrawalMethod === 'all' ? position.positionValue + position.storageFeeDeposit : amountNumber,
    withdrawalMethod,
    position.positionValue,
    position.storageFeeDeposit,
  );

  // Validate withdrawal for minimum stake requirements
  const validationResult =
    operator && selectedAccount
      ? validateWithdrawal(
          withdrawalMethod === 'all'
            ? position.positionValue + position.storageFeeDeposit
            : amountNumber,
          position.positionValue + position.storageFeeDeposit,
          operator,
          selectedAccount.address === operator.ownerAccount, // Check if user is the operator owner
        )
      : {
          isValid: false,
          warning: operator
            ? 'Unable to validate withdrawal: wallet not connected'
            : 'Unable to validate withdrawal: operator data not loaded',
        };

  // Estimate fee when amount changes
  useEffect(() => {
    if (withdrawalMethod === 'all') {
      estimateWithdrawalFee({
        operatorId: position.operatorId,
        withdrawalType: 'all',
      });
    } else if (withdrawalMethod === 'partial' && amountNumber > 0) {
      // Pass gross amount to SDK; it will account for storage refund internally
      estimateWithdrawalFee({
        operatorId: position.operatorId,
        amount: amountNumber,
        withdrawalType: 'partial',
      });
    }
  }, [withdrawalMethod, amountNumber, position.operatorId, estimateWithdrawalFee]);

  // Handle successful withdrawal (guard to prevent duplicate callback invocations)
  const lastHandledWithdrawalHashRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      withdrawalState === 'success' &&
      withdrawalTxHash &&
      lastHandledWithdrawalHashRef.current !== withdrawalTxHash
    ) {
      const actualAmount =
        validationResult.actualWithdrawalAmount ?? withdrawalPreview.grossWithdrawalAmount;
      onSuccess?.(actualAmount, withdrawalTxHash);
      lastHandledWithdrawalHashRef.current = withdrawalTxHash;
    }
  }, [
    withdrawalState,
    onSuccess,
    validationResult.actualWithdrawalAmount,
    withdrawalPreview.grossWithdrawalAmount,
    withdrawalTxHash,
  ]);

  const handleSubmit = async () => {
    if (!canExecuteWithdrawal || !validationResult.isValid) return;

    try {
      // Check if this should be treated as a full withdrawal
      const isEffectivelyFullWithdrawal =
        withdrawalMethod === 'all' || validationResult.willWithdrawAll;

      await executeWithdraw({
        operatorId: position.operatorId,
        // Pass gross amount for partial withdrawals; SDK computes shares and refund
        amount: isEffectivelyFullWithdrawal ? undefined : amountNumber,
        withdrawalType: isEffectivelyFullWithdrawal ? 'all' : 'partial',
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const isValidAmount =
    withdrawalMethod === 'all' ||
    (amountNumber > 0 && amountNumber <= position.positionValue + position.storageFeeDeposit);

  const showPreview =
    withdrawalMethod === 'all' || (withdrawalMethod === 'partial' && amountNumber > 0);

  // Amount input errors
  const amountErrors: string[] = [];
  if (withdrawalMethod === 'partial') {
    if (amount !== '' && amountNumber > position.positionValue + position.storageFeeDeposit) {
      amountErrors.push('Amount exceeds your total position value');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* Withdrawal Input Form */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-h3">Amount to withdraw</CardTitle>
        </CardHeader>
        <CardContent className="stack-lg flex flex-col flex-1">
          {/* Minimum Stake */}
          <div className="stack-xs">
            <div className="flex justify-between items-center">
              <span className="text-label text-muted-foreground">Minimum stake</span>
              <span className="text-code font-semibold">
                {operator ? formatAI3(operator.minimumNominatorStake, 4) : '--'}
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              Remaining stake must be greater than or equal to minimum stake, otherwise a full
              withdrawal will be forced
            </p>
          </div>
          {/* Wallet Connection Alert */}
          {!isConnected && (
            <Alert variant="warning">
              <AlertDescription>
                Connect your wallet to withdraw tokens from this position
              </AlertDescription>
            </Alert>
          )}

          {/* Withdrawal Method Selection */}
          <div className="stack-sm">
            <label className="text-label">Withdrawal Method</label>
            <div className="inline-sm">
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
            <AmountInput
              amount={amount}
              onAmountChange={handleAmountChange}
              errors={amountErrors}
              disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
              label="Total Amount to Receive"
              unit="AI3"
              onMaxClick={() =>
                setAmount(String(position.positionValue + position.storageFeeDeposit))
              }
            />
          )}

          {/* Minimum Stake Validation Warning */}
          {validationResult.warning && (
            <Alert variant={validationResult.willWithdrawAll ? 'warning' : 'destructive'}>
              <AlertDescription>
                <div className="stack-xs">
                  <div className="font-medium">
                    {validationResult.willWithdrawAll
                      ? 'Forced Full Withdrawal'
                      : 'Validation Error'}
                  </div>
                  <div>{validationResult.warning}</div>
                  {validationResult.willWithdrawAll && (
                    <div className="text-body-small">
                      Click "Withdraw Tokens" to confirm this full withdrawal.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning about two-step process */}
          <Alert variant="warning">
            <AlertDescription>
              <span className="font-medium">Two-step process:</span> After withdrawal request, funds
              will have a locking period of 14,400 blocks (~1 day) before you can claim them.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {withdrawalError && (
            <Alert variant="destructive">
              <AlertDescription>{withdrawalError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="inline-md pt-4 mt-auto">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={withdrawalState === 'signing' || withdrawalState === 'pending'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !isValidAmount ||
                !validationResult.isValid ||
                withdrawalState === 'signing' ||
                withdrawalState === 'pending' ||
                !canExecuteWithdrawal
              }
              className="flex-1"
            >
              {withdrawalState === 'signing'
                ? 'Signing...'
                : withdrawalState === 'pending'
                  ? 'Broadcasting...'
                  : !isConnected
                    ? 'Connect Wallet to Withdraw'
                    : validationResult.willWithdrawAll
                      ? 'Withdraw All Tokens'
                      : 'Withdraw Tokens'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <div className="h-full">
        {showPreview && isValidAmount ? (
          (() => {
            const actualGrossAmount =
              validationResult.actualWithdrawalAmount ?? withdrawalPreview.grossWithdrawalAmount;
            const actualNetAmount = validationResult.willWithdrawAll
              ? position.positionValue
              : withdrawalPreview.netStakeWithdrawal;
            const actualStorageFeeRefund = validationResult.willWithdrawAll
              ? position.storageFeeDeposit
              : withdrawalPreview.storageFeeRefund;

            const withdrawalItems: Array<{
              label: string;
              value: number;
              precision?: number;
              isPositive?: boolean;
              isNegative?: boolean;
              tooltip?: React.ReactNode;
            }> = [
              {
                label: 'Withdrawal Amount',
                value: actualGrossAmount,
                precision: 4,
                isPositive: true,
                tooltip: (
                  <div className="space-y-1">
                    <div className="flex justify-between gap-6">
                      <span>From stake</span>
                      <span className="font-mono">{formatAI3(actualNetAmount, 4)}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>Storage refund</span>
                      <span className="font-mono">{formatAI3(actualStorageFeeRefund, 4)}</span>
                    </div>
                  </div>
                ),
              },
              {
                label: 'Transaction Fee',
                value: estimatedWithdrawalFee || 0,
                precision: 6,
                isNegative: true,
              },
            ];

            const additionalInfo = (
              <div className="stack-sm">
                <div className="flex justify-between items-center">
                  <span className="text-label text-muted-foreground">Withdrawal Percentage:</span>
                  <span className="text-code font-medium">
                    {validationResult.willWithdrawAll ? '100' : withdrawalPreview.percentage}%
                  </span>
                </div>
                {validationResult.willWithdrawAll && (
                  <div className="flex justify-between items-center">
                    <span className="text-label text-muted-foreground">Withdrawal Type:</span>
                    <span className="text-code font-medium text-warning">Full (Forced)</span>
                  </div>
                )}
              </div>
            );

            return (
              <TransactionPreview
                type="withdrawal"
                title={validationResult.willWithdrawAll ? 'Full Withdrawal Summary' : undefined}
                className="h-full"
                items={withdrawalItems}
                totalLabel="You will receive"
                totalValue={actualGrossAmount}
                totalTooltip={`From stake: ${formatAI3(actualNetAmount, 4)} • Storage refund: ${formatAI3(actualStorageFeeRefund, 4)}`}
                additionalInfo={additionalInfo}
                notes={[
                  'Withdrawal requests are processed at the end of each epoch',
                  'Storage fee refunds depend on storage fund performance',
                  'Funds can be unlocked after 14,400 blocks (~1 day)',
                  validationResult.willWithdrawAll
                    ? 'This will close your entire position due to minimum stake requirements'
                    : withdrawalMethod === 'partial'
                      ? 'Remaining stake will continue earning rewards'
                      : 'This will close your entire position with this operator',
                ]}
              />
            );
          })()
        ) : (
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-body">
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
