import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useOperatorFilters } from '@/hooks/use-operators';

const SEARCH_DEBOUNCE_MS = 300;

interface OperatorFiltersProps {
  loading?: boolean;
}

export const OperatorFilters: React.FC<OperatorFiltersProps> = ({ loading = false }) => {
  const { filters, updateSearch, toggleMyStakesOnly } = useOperatorFilters();
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  // Sync local state when filters are reset externally
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        updateSearch(localSearch);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [localSearch, filters.searchQuery, updateSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    updateSearch('');
  }, [updateSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search operators..."
          value={localSearch}
          onChange={handleSearchChange}
          className="pl-9 pr-9"
          size="sm"
          disabled={loading}
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* My Stakes Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          aria-checked={filters.myStakesOnly}
          onClick={toggleMyStakesOnly}
          disabled={loading}
          className={`
            relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${filters.myStakesOnly ? 'bg-primary' : 'bg-input'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm
              transition-transform duration-200 ease-in-out
              ${filters.myStakesOnly ? 'translate-x-[18px] bg-primary-foreground' : 'translate-x-[2px] bg-foreground'}
            `}
          />
        </button>
        <span className="text-sm text-foreground whitespace-nowrap">My Stakes</span>
      </label>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};
