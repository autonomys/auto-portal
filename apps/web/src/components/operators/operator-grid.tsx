import React from 'react';
import { OperatorCard } from './operator-card';
import type { Operator } from '@/types/operator';

interface OperatorGridProps {
  operators: Operator[];
  loading?: boolean;
  onStake: (operatorId: string) => void;
  onViewDetails: (operatorId: string) => void;
}

export const OperatorGrid: React.FC<OperatorGridProps> = ({
  operators,
  loading = false,
  onStake,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading skeletons */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border border-border rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="w-16 h-6 bg-muted rounded" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="h-16 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-2 bg-muted rounded mb-4" />
            <div className="flex gap-3">
              <div className="h-10 bg-muted rounded flex-1" />
              <div className="h-10 bg-muted rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (operators.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No operators found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find more operators.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {operators.map(operator => (
        <OperatorCard
          key={operator.id}
          operator={operator}
          onStake={onStake}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
