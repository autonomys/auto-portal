import React, { useState } from 'react';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { OperatorFilters, OperatorGrid, OperatorTable } from '@/components/operators';
import { useOperators, useOperatorFilters } from '@/hooks/use-operators';

interface OperatorsPageProps {
  onBack?: () => void;
  onStake?: (operatorId: string) => void;
  onViewDetails?: (operatorId: string) => void;
  onNavigate?: (page: 'dashboard' | 'operators') => void;
  currentPage?: 'dashboard' | 'operators';
}

export const OperatorsPage: React.FC<OperatorsPageProps> = ({
  onBack,
  onStake,
  onViewDetails,
  onNavigate,
  currentPage,
}) => {
  const { operators, loading, error, operatorCount, clearError } = useOperators();
  const { filters, setFilters } = useOperatorFilters();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
    <Layout onNavigate={onNavigate} currentPage={currentPage}>
      <div className="py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-semibold text-foreground">Choose Operator</h1>
          </div>
        </div>

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
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between mb-4">
            <OperatorFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalResults={operatorCount}
              loading={loading}
            />

            {/* View Toggle (Desktop Only) */}
            <div className="hidden lg:flex items-center space-x-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats (when data is loaded) */}
        {!loading && operators.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{operatorCount} operators</span>
            </p>
          </div>
        )}

        {/* Operator Display */}
        {viewMode === 'grid' ? (
          <OperatorGrid
            operators={operators}
            loading={loading}
            onStake={handleStake}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <OperatorTable
            operators={operators}
            loading={loading}
            onStake={handleStake}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Load More (placeholder for future pagination) */}
        {!loading && operators.length > 0 && operators.length >= 10 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              Load More Operators
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </Layout>
  );
};
