import React from 'react';
import { formatAI3 } from '@/lib/formatting';

interface FeeDisplayProps {
  fee: number;
  loading?: boolean;
  label?: string;
  className?: string;
}

export const FeeDisplay: React.FC<FeeDisplayProps> = ({
  fee,
  loading = false,
  label = 'Transaction Fee',
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-sm text-muted-foreground font-sans">{label}</span>
      <span className="font-mono font-medium text-foreground">
        {loading ? (
          <span className="animate-pulse text-muted-foreground">Estimating...</span>
        ) : (
          formatAI3(fee, 6)
        )}
      </span>
    </div>
  );
};
