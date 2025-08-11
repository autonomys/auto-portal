import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OperatorFilters, OperatorGrid, OperatorTable } from '@/components/operators';
import { useOperators, useOperatorFilters } from '@/hooks/use-operators';

export const OperatorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { operators, loading, error, operatorCount, clearError } = useOperators();
  const { filters, setFilters } = useOperatorFilters();

  // Derive view mode from URL params with proper validation, default to grid
  const getValidatedViewMode = (): 'grid' | 'table' => {
    const viewParam = searchParams.get('view');
    return viewParam === 'grid' || viewParam === 'table' ? viewParam : 'grid';
  };

  const viewMode = getValidatedViewMode();

  const handleStake = (operatorId: string) => {
    navigate(`/staking/${operatorId}`);
  };

  const handleViewDetails = (operatorId: string) => {
    navigate(`/operators/${operatorId}`);
  };

  const handleWithdraw = (operatorId: string) => {
    navigate(`/withdraw/${operatorId}`);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('view', mode);
      return params;
    });
  };

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Operators</h1>
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
              onClick={() => handleViewModeChange('grid')}
              className="h-8 px-3"
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
              className="h-8 px-3"
            >
              <List className="w-4 h-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Operator Display */}
      {viewMode === 'grid' ? (
        <OperatorGrid
          operators={operators}
          loading={loading}
          onStake={handleStake}
          onViewDetails={handleViewDetails}
          onWithdraw={handleWithdraw}
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
  );
};
