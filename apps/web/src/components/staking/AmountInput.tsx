import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatAI3Amount, TRANSACTION_FEE } from '@/lib/staking-utils';

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  errors: string[];
  disabled?: boolean;
  availableBalance?: number;
  estimatedFee?: number;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  onAmountChange,
  errors,
  disabled = false,
  availableBalance = 0,
  estimatedFee,
}) => {
  const feeToUse = (estimatedFee ?? TRANSACTION_FEE) * 3;

  const handleMaxClick = () => {
    // Calculate maximum stakeable amount by subtracting transaction fee from available balance
    // Use estimated fee * 3 as requested to account for fee buffer
    const maxStakeableAmount = Math.max(0, availableBalance - feeToUse);
    onAmountChange(formatAI3Amount(maxStakeableAmount, 5));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or valid numeric input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className="stack-sm">
      <label className="block text-label">Amount to Stake</label>
      <div className="relative">
        <Input
          type="text"
          value={amount}
          onChange={handleInputChange}
          placeholder="0.00"
          disabled={disabled}
          className={`text-code text-lg pr-20 ${errors.length > 0 ? 'border-destructive' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 inline-sm pr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMaxClick}
            disabled={disabled || availableBalance <= feeToUse}
            className="h-7 px-3 text-caption"
          >
            MAX
          </Button>
          <span className="text-muted-foreground text-code">AI3</span>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="stack-xs">
          {errors.map((error, index) => (
            <p key={index} className="text-body-small text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
