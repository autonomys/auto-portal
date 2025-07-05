import React from 'react';
import { Button } from '@/components/ui/button';

interface TransactionActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  cancelText?: string;
  submitText?: string;
  loadingText?: string;
  isSuccess?: boolean;
  onContinue?: () => void;
  onReset?: () => void;
  continueText?: string;
  resetText?: string;
}

export const TransactionActions: React.FC<TransactionActionsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  isValid,
  cancelText = 'Cancel',
  submitText = 'Submit',
  loadingText = 'Processing...',
  isSuccess = false,
  onContinue,
  onReset,
  continueText = 'Continue',
  resetText = 'Reset',
}) => {
  if (isSuccess && onContinue && onReset) {
    return (
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onReset} className="flex-1 font-sans">
          {resetText}
        </Button>
        <Button onClick={onContinue} className="flex-1 font-sans">
          {continueText}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 pt-4">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1 font-sans"
      >
        {cancelText}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
        className="flex-1 font-sans"
      >
        {isSubmitting ? loadingText : submitText}
      </Button>
    </div>
  );
};