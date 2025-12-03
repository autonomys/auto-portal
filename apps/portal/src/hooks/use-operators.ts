import { useEffect } from 'react';
import { useOperatorStore } from '@/stores/operator-store';
import type { FilterState } from '@/types/operator';

/** Hook for operator data access and management. */
export const useOperators = () => {
  const {
    operators,
    filteredOperators,
    stakedOperators,
    loading,
    error,
    filters,
    isInitialized,
    fetchOperators,
    setFilters,
    setUserPositions,
    resetFilters,
    refreshOperatorData,
    clearError,
  } = useOperatorStore();

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
    refreshOperator: refreshOperatorData,
    clearError,
  };
};

/**
 * Hook for accessing individual operator data
 */
export const useOperator = (operatorId: string) => {
  const { operators, loading, error, refreshOperatorData } = useOperatorStore();

  const operator = operators.find(op => op.id === operatorId);

  return {
    operator,
    loading,
    error,
    refresh: () => refreshOperatorData(operatorId),
  };
};

/**
 * Hook for search and filtering functionality
 */
export const useOperatorFilters = () => {
  const { filters, setFilters, resetFilters: storeResetFilters } = useOperatorStore();

  const updateSearch = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const updateDomain = (domain: string) => {
    setFilters({ domainFilter: domain });
  };

  const updateSort = (sortBy: FilterState['sortBy'], sortOrder?: FilterState['sortOrder']) => {
    setFilters({
      sortBy,
      ...(sortOrder && { sortOrder }),
    });
  };

  const toggleMyStakesOnly = () => {
    setFilters({ myStakesOnly: !filters.myStakesOnly });
  };

  const setMyStakesOnly = (value: boolean) => {
    setFilters({ myStakesOnly: value });
  };

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
