import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatAI3Amount, DEFAULT_BALANCE } from '@/lib/staking-utils';

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  errors: string[];
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  onAmountChange,
  errors,
  disabled = false,
}) => {
  const handleMaxClick = () => {
    onAmountChange(formatAI3Amount(DEFAULT_BALANCE));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or valid numeric input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground font-sans">
        Amount to Stake
      </label>
      <div className="relative">
        <Input
          type="text"
          value={amount}
          onChange={handleInputChange}
          placeholder="0.00"
          disabled={disabled}
          className={`font-mono text-lg pr-20 ${
            errors.length > 0 ? 'border-destructive' : ''
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMaxClick}
            disabled={disabled}
            className="h-7 px-3 text-xs font-sans"
          >
            MAX
          </Button>
          <span className="text-muted-foreground font-mono text-sm">AI3</span>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive font-sans">
              {error}
            </p>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground font-sans">
        Available balance: {formatAI3Amount(DEFAULT_BALANCE)} AI3
      </p>
    </div>
  );
};