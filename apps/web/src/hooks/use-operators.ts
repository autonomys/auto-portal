import { useEffect } from 'react';
import { useOperatorStore } from '@/stores/operator-store';
import type { FilterState } from '@/types/operator';

/**
 * Hook for operator data access and management
 */
export const useOperators = () => {
  const {
    operators,
    filteredOperators,
    loading,
    error,
    filters,
    fetchOperators,
    setFilters,
    refreshOperatorData,
    clearError,
  } = useOperatorStore();

  // Auto-fetch operators on first mount
  useEffect(() => {
    if (operators.length === 0 && !loading && !error) {
      fetchOperators();
    }
  }, [operators.length, loading, error, fetchOperators]);

  return {
    // State
    operators: filteredOperators, // Return filtered operators by default
    allOperators: operators, // Access to unfiltered data if needed
    loading,
    error,
    filters,

    // Computed values
    operatorCount: filteredOperators.length,
    averageAPY: filteredOperators.length > 0 
      ? filteredOperators.reduce((sum, op) => sum + op.currentAPY, 0) / filteredOperators.length 
      : 0,

    // Actions
    refetch: fetchOperators,
    updateFilters: setFilters,
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
  const { filters, setFilters } = useOperatorStore();

  const updateSearch = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const updateDomain = (domain: string) => {
    setFilters({ domainFilter: domain });
  };

  const updateSort = (sortBy: FilterState['sortBy'], sortOrder?: FilterState['sortOrder']) => {
    setFilters({ 
      sortBy, 
      ...(sortOrder && { sortOrder })
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      domainFilter: 'all',
      sortBy: 'apy',
      sortOrder: 'desc',
      minAPY: undefined,
      maxAPY: undefined,
      minUptime: undefined,
      statusFilter: undefined,
    });
  };

  return {
    filters,
    updateSearch,
    updateDomain,
    updateSort,
    resetFilters,
    setFilters,
  };
};