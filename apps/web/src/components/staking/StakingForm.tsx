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
  const { refetch: refetchPositions } = usePositions();
  const stakingTransaction = useStakingTransaction();
  const submittedAmount = useRef('');

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
    const validation = validateStakingAmount(formState.amount, validationRules);
    const newCalculations = calculateStakingAmounts(formState.amount, 0);

    // Add transaction errors to validation errors
    const allErrors = [...validation.errors];
    if (stakingTransaction.error && !stakingTransaction.loading) {
      allErrors.push(stakingTransaction.error);
    }

    setFormState(prev => ({
      ...prev,
      isValid: validation.isValid && !stakingTransaction.loading,
      errors: allErrors,
      showPreview: validation.isValid && parseFloat(formState.amount) > 0,
      isSubmitting: stakingTransaction.loading,
    }));

    setCalculations(newCalculations);
  }, [formState.amount, operator, balance, stakingTransaction.loading, stakingTransaction.error]);

  const handleAmountChange = (amount: string) => {
    // Reset transaction state when amount changes
    if (stakingTransaction.state !== 'idle') {
      stakingTransaction.reset();
    }

    setFormState(prev => ({
      ...prev,
      amount,
    }));
  };

  const handleSubmit = async () => {
    if (!formState.isValid || formState.isSubmitting || !stakingTransaction.canExecute) return;

    const amount = parseFloat(formState.amount);
    if (isNaN(amount) || amount <= 0) return;

    submittedAmount.current = formState.amount;

    try {
      // Execute the real staking transaction
      await stakingTransaction.execute({
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
    if (stakingTransaction.isSuccess && stakingTransaction.txHash) {
      // Refresh positions data to show the new pending deposit
      refetchPositions();

      // Reset form after a delay to show success state
      const timerId = setTimeout(() => {
        onSubmit(submittedAmount.current);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [stakingTransaction.isSuccess, stakingTransaction.txHash, refetchPositions, onSubmit]);

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
          />

          {/* Transaction Status */}
          {stakingTransaction.txHash && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="text-sm font-semibold text-primary font-sans mb-2">
                Transaction Status
              </h4>
              <div className="space-y-1 text-xs text-primary/80 font-mono">
                <div>Hash: {stakingTransaction.txHash}</div>
                {stakingTransaction.blockHash && <div>Block: {stakingTransaction.blockHash}</div>}
                {stakingTransaction.isSuccess && (
                  <div className="text-green-600 font-sans">
                    ✓ Confirmed - Stake will be active next epoch
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
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
              disabled={
                !formState.isValid || formState.isSubmitting || !stakingTransaction.canExecute
              }
              className="flex-1 font-sans"
            >
              {stakingTransaction.isSigning && 'Awaiting signature...'}
              {stakingTransaction.isPending && 'Submitting...'}
              {stakingTransaction.isSuccess && 'Success!'}
              {!stakingTransaction.loading && !stakingTransaction.isSuccess && 'Stake Tokens'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <div>
        {formState.showPreview ? (
          <TransactionPreview calculations={calculations} />
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
