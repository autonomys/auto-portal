import { useEffect, useCallback } from 'react';
import { useOperatorStore } from '@/stores/operator-store';
import type { FilterState } from '@/types/operator';

/** Hook for operator data access and management. */
export const useOperators = () => {
  const operators = useOperatorStore(s => s.operators);
  const filteredOperators = useOperatorStore(s => s.filteredOperators);
  const stakedOperators = useOperatorStore(s => s.stakedOperators);
  const loading = useOperatorStore(s => s.loading);
  const error = useOperatorStore(s => s.error);
  const filters = useOperatorStore(s => s.filters);
  const isInitialized = useOperatorStore(s => s.isInitialized);
  const fetchOperators = useOperatorStore(s => s.fetchOperators);
  const setFilters = useOperatorStore(s => s.setFilters);
  const setUserPositions = useOperatorStore(s => s.setUserPositions);
  const resetFilters = useOperatorStore(s => s.resetFilters);
  const clearError = useOperatorStore(s => s.clearError);

  // Auto-fetch operators on first mount if not already initialized
  useEffect(() => {
    if (!isInitialized && operators.length === 0 && !loading && !error) {
      fetchOperators();
    }
  }, [isInitialized, operators.length, loading, error, fetchOperators]);

  return {
    // State
    filteredOperators,
    stakedOperators,
    allOperators: operators,
    loading,
    error,
    filters,

    // Computed values
    operatorCount: filteredOperators.length + stakedOperators.length,

    // Actions
    refetch: fetchOperators,
    updateFilters: setFilters,
    setUserPositions,
    resetFilters,
    clearError,
  };
};

/**
 * Hook for search and filtering functionality
 */
export const useOperatorFilters = () => {
  const filters = useOperatorStore(s => s.filters);
  const setFilters = useOperatorStore(s => s.setFilters);
  const storeResetFilters = useOperatorStore(s => s.resetFilters);

  const updateSearch = useCallback(
    (query: string) => {
      setFilters({ searchQuery: query });
    },
    [setFilters],
  );

  const updateDomain = useCallback(
    (domain: string) => {
      setFilters({ domainFilter: domain });
    },
    [setFilters],
  );

  const updateSort = useCallback(
    (sortBy: FilterState['sortBy'], sortOrder?: FilterState['sortOrder']) => {
      setFilters({
        sortBy,
        ...(sortOrder && { sortOrder }),
      });
    },
    [setFilters],
  );

  const toggleMyStakesOnly = useCallback(() => {
    setFilters({ myStakesOnly: !filters.myStakesOnly });
  }, [setFilters, filters.myStakesOnly]);

  const setMyStakesOnly = useCallback(
    (value: boolean) => {
      setFilters({ myStakesOnly: value });
    },
    [setFilters],
  );

  return {
    filters,
    updateSearch,
    updateDomain,
    updateSort,
    toggleMyStakesOnly,
    setMyStakesOnly,
    resetFilters: storeResetFilters,
    setFilters,
  };
};

/** Hook to read positions from the operator store (no fetching). */
export const useStoredPositions = () => {
  const userPositions = useOperatorStore(state => state.userPositions);
  return { positions: userPositions };
};
