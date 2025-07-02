import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from './AmountInput';
import { TransactionPreview } from './TransactionPreview';
import { useBalance } from '@/hooks/use-balance';
import { usePositions } from '@/hooks/use-positions';
import { useStakingTransaction } from '@/hooks/use-staking-transaction';
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
  const {
    execute,
    isSigning,
    isPending,
    isSuccess,
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
    const validationRules = getValidationRules(operator, availableBalance);
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
  }, [formState.amount, operator, balance, stakingLoading, stakingError, estimatedFee]);

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
    if (stakingLoading) {
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
          <CardTitle className="text-lg font-serif">Amount to Stake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Balance */}
          <div className="p-4 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground font-sans">
                Available Balance
              </span>
              <span className="text-lg font-mono font-semibold text-foreground">
                {balanceLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : balance ? (
                  formatAI3(balance.free)
                ) : (
                  'Connect wallet'
                )}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <AmountInput
            amount={formState.amount}
            onAmountChange={handleAmountChange}
            errors={formState.errors}
            disabled={formState.isSubmitting}
            availableBalance={balance ? parseFloat(balance.free) : 0}
            estimatedFee={estimatedFee ?? undefined}
          />

          {/* Transaction Status */}
          {txHash && (
            <div
              className={`p-4 border rounded-lg ${
                isSuccess ? 'bg-green-50 border-green-200' : 'bg-primary/5 border-primary/20'
              }`}
            >
              <h4
                className={`text-sm font-semibold font-sans mb-2 ${
                  isSuccess ? 'text-green-800' : 'text-primary'
                }`}
              >
                {isSuccess ? 'Transaction Successful!' : 'Transaction Status'}
              </h4>
              <div className="space-y-1 text-xs font-mono">
                <div className={isSuccess ? 'text-green-700' : 'text-primary/80'}>
                  Hash: {txHash}
                </div>
                {stakingError && (
                  <div className={`text-red-700 font-sans mt-2 font-medium`}>{stakingError}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {isSuccess ? (
              // Success state buttons
              <>
                <Button variant="outline" onClick={() => reset()} className="flex-1 font-sans">
                  Stake More
                </Button>
                <Button onClick={handleContinue} className="flex-1 font-sans">
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
                  className="flex-1 font-sans"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formState.isValid || formState.isSubmitting || !canExecute}
                  className="flex-1 font-sans"
                >
                  {isSigning && 'Awaiting signature...'}
                  {isPending && 'Submitting...'}
                  {!stakingLoading && 'Stake Tokens'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <div>
        {formState.showPreview ? (
          <TransactionPreview calculations={calculations} feeLoading={stakingLoading} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="font-sans">Enter an amount to see transaction preview</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
