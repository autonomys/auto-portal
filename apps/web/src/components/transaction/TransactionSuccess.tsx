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
}) => (
  <div className="py-12 max-w-2xl mx-auto">
    <Card className="text-center">
      <CardContent className="pt-8 pb-8">
        <div className="stack-lg">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            {icon || (
              <svg
                className="w-8 h-8 text-success"
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
          <div className="stack-sm">
            <h2 className="text-h2">{title}</h2>
            <p className="text-body text-muted-foreground">{description}</p>
          </div>

          {txHash && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-label text-muted-foreground mb-1">Transaction Hash</p>
              <p className="text-code break-all">{txHash}</p>
            </div>
          )}

          <div className="inline-md justify-center">
            {onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionText}
              </Button>
            )}
            <Button onClick={onPrimaryAction}>{primaryActionText}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
