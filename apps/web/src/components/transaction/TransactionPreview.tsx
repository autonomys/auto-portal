import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { formatAI3 } from '@/lib/formatting';

type TransactionType = 'staking' | 'withdrawal';

interface TransactionItem {
  label: string;
  value: number;
  tooltip?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  loading?: boolean;
  precision?: number;
}

interface TransactionPreviewProps {
  type: TransactionType;
  title?: string;
  items: TransactionItem[];
  totalLabel: string;
  totalValue: number;
  totalLoading?: boolean;
  additionalInfo?: React.ReactNode;
  notes?: string[];
  className?: string;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  type,
  title,
  items,
  totalLabel,
  totalValue,
  totalLoading = false,
  additionalInfo,
  notes,
  className = '',
}) => {
  const defaultTitle = type === 'staking' ? 'Transaction Breakdown' : 'Withdrawal Summary';
  const displayTitle = title || defaultTitle;

  const formatValue = (value: number, precision = 4, loading = false) => {
    if (loading) {
      return <span className="animate-pulse text-muted-foreground">Estimating...</span>;
    }
    return formatAI3(value, precision);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-serif">{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground font-sans">{item.label}</span>
                {item.tooltip && (
                  <Tooltip content={item.tooltip} side="top">
                    <InfoIcon className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </Tooltip>
                )}
              </div>
              <span
                className={`font-mono font-medium ${
                  item.isPositive
                    ? 'text-success-600'
                    : item.isNegative
                      ? 'text-destructive'
                      : 'text-foreground'
                }`}
              >
                {item.isPositive && '+'}
                {formatValue(item.value, item.precision, item.loading)}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-sans font-semibold text-foreground">{totalLabel}</span>
          <span className="font-mono font-bold text-foreground text-lg">
            {totalLoading ? (
              <span className="animate-pulse text-muted-foreground">Calculating...</span>
            ) : (
              <span className={type === 'withdrawal' ? 'text-success-600' : 'text-foreground'}>
                {type === 'withdrawal' && '+'}
                {formatAI3(totalValue, 4)}
              </span>
            )}
          </span>
        </div>

        {/* Additional Information */}
        {additionalInfo && <div className="pt-2">{additionalInfo}</div>}

        {/* Important Notes */}
        {notes && notes.length > 0 && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-semibold text-primary font-sans mb-2">Important Notes</h4>
            <ul className="text-xs text-primary/80 space-y-1 font-sans">
              {notes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
