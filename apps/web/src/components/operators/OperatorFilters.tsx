import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { FilterState } from '@/types/operator';

interface OperatorFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  totalResults: number;
  loading?: boolean;
}

export const OperatorFilters: React.FC<OperatorFiltersProps> = ({
  filters,
  onFiltersChange,
  totalResults,
  loading = false,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ searchQuery: e.target.value });
  };

  return (
    <div className="space-y-4">
      {/* Search Only */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3"></div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search operators..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full sm:w-64"
            disabled={loading}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing <span className="font-medium text-foreground">{totalResults} operators</span>
          {filters.searchQuery && <> matching "{filters.searchQuery}"</>}
        </p>

        {loading && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};
