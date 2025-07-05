import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TransactionSuccessProps {
  title: string;
  description: string;
  txHash?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryActionText: string;
  secondaryActionText?: string;
  icon?: React.ReactNode;
}

export const TransactionSuccess: React.FC<TransactionSuccessProps> = ({
  title,
  description,
  txHash,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionText,
  secondaryActionText = 'Back',
  icon,
}) => {
  return (
    <div className="py-12 max-w-2xl mx-auto">
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon || (
              <svg
                className="w-8 h-8 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground font-sans mb-6">{description}</p>
          
          {txHash && (
            <div className="mb-6 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground font-sans mb-1">Transaction Hash</p>
              <p className="text-xs font-mono text-foreground break-all">{txHash}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction} className="font-sans">
                {secondaryActionText}
              </Button>
            )}
            <Button onClick={onPrimaryAction} className="font-sans">
              {primaryActionText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};