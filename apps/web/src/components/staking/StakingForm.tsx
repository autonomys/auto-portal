import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AmountInput } from './AmountInput';
import { TransactionPreview } from '@/components/transaction';
import { useBalance } from '@/hooks/use-balance';
import { usePositions, useOperatorPosition } from '@/hooks/use-positions';
import { useStakingTransaction } from '@/hooks/use-staking-transaction';
import { useWallet } from '@/hooks/use-wallet';
import { formatAI3 } from '@/lib/formatting';
import type { Operator } from '@/types/operator';
import type { StakingFormState, StakingCalculations } from '@/types/staking';
import {
  calculateStakingAmounts,
  getValidationRules,
  validateStakingAmount,
  TRANSACTION_FEE,
} from '@/lib/staking-utils';

interface StakingFormProps {
  operator: Operator;
  onCancel: () => void;
  onSubmit: (amount: string) => void;
}

export const StakingForm: React.FC<StakingFormProps> = ({ operator, onCancel, onSubmit }) => {
  const { balance, loading: balanceLoading } = useBalance();
  const { refetch: refetchPositions } = usePositions({ refreshInterval: 0 });
  const { position: currentPosition } = useOperatorPosition(operator.id);
  const { isConnected } = useWallet();
  const {
    execute,
    isSigning,
    isPending,
    isSuccess,
    isIdle,
    txHash,
    loading: stakingLoading,
    error: stakingError,
    estimatedFee,
    estimateFee,
    canExecute,
    reset,
  } = useStakingTransaction();
  const submittedAmount = useRef('');
  const currentAmount = useRef(0);

  const [formState, setFormState] = useState<StakingFormState>({
    amount: '',
    isValid: false,
    errors: [],
    isSubmitting: false,
    showPreview: false,
  });

  const [calculations, setCalculations] = useState<StakingCalculations>({
    storageFund: 0,
    netStaking: 0,
    transactionFee: TRANSACTION_FEE,
    totalRequired: 0,
    expectedRewards: 0,
  });

  // Update validation and calculations when amount changes
  useEffect(() => {
    const availableBalance = balance ? parseFloat(balance.free) : 0;
    const validationRules = getValidationRules(operator, availableBalance, currentPosition);
    const validation = validateStakingAmount(
      formState.amount,
      validationRules,
      estimatedFee ?? undefined,
    );
    const newCalculations = calculateStakingAmounts(formState.amount, 0, estimatedFee ?? undefined);

    // Add transaction errors to validation errors
    const allErrors = [...validation.errors];
    if (stakingError && !stakingLoading) {
      allErrors.push(stakingError);
    }

    setFormState(prev => ({
      ...prev,
      isValid: validation.isValid && !stakingLoading,
      errors: allErrors,
      showPreview: validation.isValid && parseFloat(formState.amount) > 0,
      isSubmitting: stakingLoading,
    }));

    setCalculations(newCalculations);
  }, [
    formState.amount,
    operator,
    balance,
    currentPosition,
    stakingLoading,
    stakingError,
    estimatedFee,
  ]);

  // Update current amount ref when form amount changes
  useEffect(() => {
    currentAmount.current = parseFloat(formState.amount) || 0;
  }, [formState.amount]);

  // Estimate fee when amount or operator changes (immediate, one-time)
  useEffect(() => {
    const amount = parseFloat(formState.amount);
    if (amount > 0 && !isNaN(amount)) {
      estimateFee({
        operatorId: operator.id,
        amount: amount,
      });
    }
  }, [formState.amount, operator.id, estimateFee]);

  // Periodic fee refresh (every 20 seconds) - only when there's a valid amount
  useEffect(() => {
    const intervalId = setInterval(() => {
      const amount = currentAmount.current;
      if (amount > 0 && !isNaN(amount)) {
        estimateFee({
          operatorId: operator.id,
          amount: amount,
        });
      }
    }, 20000); // 20 seconds

    return () => clearInterval(intervalId);
  }, [operator.id, estimateFee]);

  const handleAmountChange = (amount: string) => {
    // Reset transaction state when amount changes
    if (!isIdle) {
      reset();
    }

    setFormState(prev => ({
      ...prev,
      amount,
    }));
  };

  const handleSubmit = async () => {
    if (!formState.isValid || formState.isSubmitting || !canExecute) return;

    const amount = parseFloat(formState.amount);
    if (isNaN(amount) || amount <= 0) return;

    submittedAmount.current = formState.amount;

    try {
      // Execute the real staking transaction
      await execute({
        operatorId: operator.id,
        amount: amount,
      });

      // The transaction state will be updated by the hook
      // Success handling is done via useEffect below
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && txHash) {
      // Refresh positions data to show the new pending deposit
      refetchPositions();
    }
  }, [isSuccess, txHash, refetchPositions]);

  const handleContinue = () => {
    onSubmit(submittedAmount.current);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Stake Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Amount to Stake</CardTitle>
        </CardHeader>
        <CardContent className="stack-lg">
          {/* Current Position Info */}
          {currentPosition && currentPosition.positionValue > 0 && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-label text-muted-foreground">Current Position</span>
                <span className="text-code font-semibold text-success">
                  {formatAI3(currentPosition.positionValue + currentPosition.storageFeeDeposit)}
                </span>
              </div>
              <p className="text-body-small text-muted-foreground mt-1">
                You can stake any amount for subsequent nominations
              </p>
            </div>
          )}

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <Alert variant="warning">
              <AlertDescription>
                Connect your wallet to stake tokens with this operator
              </AlertDescription>
            </Alert>
          )}

          {/* Available Balance */}
          <div className="p-4 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-label text-muted-foreground">Available Balance</span>
              <span className="text-code font-semibold">
                {balanceLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : balance ? (
                  formatAI3(balance.free)
                ) : (
                  <span className="text-warning-700">Wallet not connected</span>
                )}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className={!isConnected ? 'opacity-60' : ''}>
            <AmountInput
              amount={formState.amount}
              onAmountChange={handleAmountChange}
              errors={isConnected ? formState.errors : []}
              disabled={!isConnected || formState.isSubmitting}
              availableBalance={balance ? parseFloat(balance.free) : 0}
              estimatedFee={estimatedFee ?? undefined}
            />
          </div>

          {/* Transaction Status */}
          {txHash && (
            <>
              {isSuccess ? (
                <Alert variant="success">
                  <AlertTitle>Transaction Successful!</AlertTitle>
                  <AlertDescription>
                    <div className="stack-xs text-code">
                      <div>Hash: {txHash}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="info">
                  <AlertTitle>Transaction Status</AlertTitle>
                  <AlertDescription>
                    <div className="stack-xs text-code">
                      <div>Hash: {txHash}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              {stakingError && (
                <Alert variant="destructive">
                  <AlertDescription>{stakingError}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="inline-md pt-4">
            {isSuccess ? (
              // Success state buttons
              <>
                <Button variant="outline" onClick={() => reset()} className="flex-1">
                  Stake More
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continue
                </Button>
              </>
            ) : (
              // Normal state buttons
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={formState.isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formState.isValid || formState.isSubmitting || !canExecute}
                  className="flex-1"
                >
                  {isSigning
                    ? 'Awaiting signature...'
                    : isPending
                      ? 'Submitting...'
                      : !isConnected
                        ? 'Connect Wallet to Stake'
                        : 'Stake Tokens'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <div>
        {formState.showPreview ? (
          <TransactionPreview
            type="staking"
            items={[
              {
                label: 'Staking Portion',
                value: calculations.netStaking,
                precision: 4,
              },
              {
                label: 'Storage Fund (20%)',
                value: calculations.storageFund,
                precision: 4,
                tooltip:
                  '20% of your stake is reserved as storage fees and refunded proportionally when you withdraw. Actual refund depends on storage fund performance.',
              },
              {
                label: 'Transaction Fee',
                value: calculations.transactionFee,
                precision: 8,
                loading: stakingLoading,
              },
            ]}
            totalLabel="Total Required"
            totalValue={calculations.totalRequired}
            totalLoading={stakingLoading}
            additionalInfo={
              calculations.expectedRewards > 0 && (
                <Card className="bg-success/10 border-success/20">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-body-small text-success">Estimated Annual Rewards</p>
                        <p className="text-caption text-success/80 mt-1">
                          Based on current staking configuration
                        </p>
                      </div>
                      <p className="text-code font-bold text-success text-xl">
                        ~{formatAI3(calculations.expectedRewards, 4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            }
            notes={[
              'Storage fund (20%) is held by the protocol and refunded when you withdraw',
              'Only the net staking amount (80%) earns rewards',
              'Rewards are automatically compounded to your position',
              'Stake will be active after next epoch transition (~10 minutes)',
              'Your stake will appear as "Pending" until the epoch transition occurs',
            ]}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-body">Enter an amount to see transaction preview</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
