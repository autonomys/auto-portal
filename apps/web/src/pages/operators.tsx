import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OperatorFilters, OperatorGrid } from '@/components/operators';
import { useOperators, useOperatorFilters } from '@/hooks/use-operators';

interface OperatorsPageProps {
  onBack?: () => void;
  onStake?: (operatorId: string) => void;
  onViewDetails?: (operatorId: string) => void;
}

export const OperatorsPage: React.FC<OperatorsPageProps> = ({
  onBack,
  onStake,
  onViewDetails,
}) => {
  const { operators, loading, error, operatorCount, averageAPY, clearError } = useOperators();
  const { filters, setFilters } = useOperatorFilters();

  const handleStake = (operatorId: string) => {
    if (onStake) {
      onStake(operatorId);
    } else {
      console.log('Stake to operator:', operatorId);
      // TODO: Navigate to staking flow
    }
  };

  const handleViewDetails = (operatorId: string) => {
    if (onViewDetails) {
      onViewDetails(operatorId);
    } else {
      console.log('View operator details:', operatorId);
      // TODO: Navigate to operator details page
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" onClick={onBack} className="p-2">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              )}
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">
                Choose Operator
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* TODO: Add logo or additional header elements */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-destructive">Error loading operators</h3>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={clearError}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="mb-8">
          <OperatorFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={operatorCount}
            loading={loading}
          />
        </div>

        {/* Summary Stats (when data is loaded) */}
        {!loading && operators.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-foreground">{operatorCount} operators</span>
              {averageAPY > 0 && (
                <>
                  {' • '}Average APY:{' '}
                  <span className="font-medium text-success-600">
                    {averageAPY.toFixed(1)}%
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Operator Grid */}
        <OperatorGrid
          operators={operators}
          loading={loading}
          onStake={handleStake}
          onViewDetails={handleViewDetails}
        />

        {/* Load More (placeholder for future pagination) */}
        {!loading && operators.length > 0 && operators.length >= 10 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              Load More Operators
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};