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
      <div className="inline-md pt-4">
        <Button variant="outline" onClick={onReset} className="flex-1">
          {resetText}
        </Button>
        <Button onClick={onContinue} className="flex-1">
          {continueText}
        </Button>
      </div>
    );
  }

  return (
    <div className="inline-md pt-4">
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
        {cancelText}
      </Button>
      <Button onClick={onSubmit} disabled={!isValid || isSubmitting} className="flex-1">
        {isSubmitting ? loadingText : submitText}
      </Button>
    </div>
  );
};
