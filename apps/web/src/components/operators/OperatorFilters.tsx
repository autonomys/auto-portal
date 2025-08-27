import React from 'react';

interface OperatorFiltersProps {
  loading?: boolean;
}

export const OperatorFilters: React.FC<OperatorFiltersProps> = ({ loading = false }) => (
  <div className="space-y-4">
    {/* Loading indicator only */}
    {loading && (
      <div className="flex items-center justify-end space-x-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    )}
  </div>
);
