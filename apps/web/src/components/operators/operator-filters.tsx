import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ domainFilter: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [
      FilterState['sortBy'],
      FilterState['sortOrder'],
    ];
    onFiltersChange({ sortBy, sortOrder });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      domainFilter: 'all',
      sortBy: 'apy',
      sortOrder: 'desc',
    });
  };

  const getSortValue = () => {
    return `${filters.sortBy}-${filters.sortOrder}`;
  };

  const hasActiveFilters = () => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.domainFilter !== 'all' ||
      filters.sortBy !== 'apy' ||
      filters.sortOrder !== 'desc'
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Domain Filter */}
          <select
            value={filters.domainFilter}
            onChange={handleDomainChange}
            className="px-3 py-2 border border-input bg-background rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary min-w-[160px]"
            disabled={loading}
          >
            <option value="all">All Domains</option>
            <option value="0">Auto EVM</option>
            <option value="1">Auto Consensus</option>
          </select>

          {/* Sort Options */}
          <select
            value={getSortValue()}
            onChange={handleSortChange}
            className="px-3 py-2 border border-input bg-background rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary min-w-[180px]"
            disabled={loading}
          >
            <option value="apy-desc">Sort: APY (High to Low)</option>
            <option value="apy-asc">Sort: APY (Low to High)</option>
            <option value="totalStaked-desc">Sort: Total Staked (High to Low)</option>
            <option value="totalStaked-asc">Sort: Total Staked (Low to High)</option>
            <option value="uptime-desc">Sort: Uptime (High to Low)</option>
            <option value="uptime-asc">Sort: Uptime (Low to High)</option>
            <option value="tax-asc">Sort: Tax (Low to High)</option>
            <option value="tax-desc">Sort: Tax (High to Low)</option>
          </select>

          {/* Reset Button */}
          {hasActiveFilters() && (
            <Button variant="outline" onClick={resetFilters} disabled={loading} className="text-sm">
              Reset
            </Button>
          )}
        </div>

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
          {filters.domainFilter !== 'all' && (
            <> in {filters.domainFilter === '0' ? 'Auto EVM' : 'Auto Consensus'}</>
          )}
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
