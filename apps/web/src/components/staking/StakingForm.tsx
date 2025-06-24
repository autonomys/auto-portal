import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from './AmountInput';
import { TransactionPreview } from './TransactionPreview';
import type { Operator } from '@/types/operator';
import type { StakingFormState, StakingCalculations } from '@/types/staking';
import {
  calculateStakingAmounts,
  getValidationRules,
  validateStakingAmount,
  formatAI3Amount,
  DEFAULT_BALANCE,
} from '@/lib/staking-utils';

interface StakingFormProps {
  operator: Operator;
  onCancel: () => void;
  onSubmit: (amount: string) => void;
}

export const StakingForm: React.FC<StakingFormProps> = ({ operator, onCancel, onSubmit }) => {
  const [formState, setFormState] = useState<StakingFormState>({
    amount: '',
    isValid: false,
    errors: [],
    isSubmitting: false,
    showPreview: false,
  });

  const [calculations, setCalculations] = useState<StakingCalculations>({
    storageFound: 0,
    netStaking: 0,
    transactionFee: 0.01,
    totalRequired: 0,
    expectedRewards: 0,
  });

  const validationRules = getValidationRules(operator);

  // Update validation and calculations when amount changes
  useEffect(() => {
    const validation = validateStakingAmount(formState.amount, validationRules);
    const newCalculations = calculateStakingAmounts(formState.amount, operator.currentAPY);

    setFormState(prev => ({
      ...prev,
      isValid: validation.isValid,
      errors: validation.errors,
      showPreview: validation.isValid && parseFloat(formState.amount) > 0,
    }));

    setCalculations(newCalculations);
  }, [formState.amount, operator.currentAPY, validationRules]);

  const handleAmountChange = (amount: string) => {
    setFormState(prev => ({
      ...prev,
      amount,
    }));
  };

  const handleSubmit = async () => {
    if (!formState.isValid || formState.isSubmitting) return;

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate transaction submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubmit(formState.amount);
    } catch (error) {
      console.error('Transaction failed:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: ['Transaction failed. Please try again.'],
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Stake Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Stake Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Balance */}
          <div className="p-4 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground font-sans">
                Available Balance
              </span>
              <span className="text-lg font-mono font-semibold text-foreground">
                {formatAI3Amount(DEFAULT_BALANCE)} AI3
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <AmountInput
            amount={formState.amount}
            onAmountChange={handleAmountChange}
            errors={formState.errors}
            disabled={formState.isSubmitting}
          />

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
              disabled={!formState.isValid || formState.isSubmitting}
              className="flex-1 font-sans"
            >
              {formState.isSubmitting ? 'Processing...' : 'Stake Tokens'}
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