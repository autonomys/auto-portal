import type { ReturnDetails } from '@/lib/apy';

export interface Operator {
  id: string;
  name: string; // Display name or default to ID
  domainId: string;
  domainName: string; // "Auto EVM" (currently only domain)
  ownerAccount: string;

  // Pool Configuration
  nominationTax: number; // Percentage (0-100)
  minimumNominatorStake: string; // In AI3

  // Current Status
  status: 'active' | 'inactive' | 'slashed' | 'degraded';
  totalStaked: string; // Total AI3 in pool
  // Derived metrics (optional)
  estimatedReturnDetails?: ReturnDetails;
  estimatedReturnDetailsWindows?: ReturnDetailsWindows;
  // Aggregates
  totalStorageFund?: string; // Operator-level storage fund balance in AI3
  totalPoolValue?: string; // totalStaked + totalStorageFund in AI3
}

export interface OperatorStats {
  sharePrice: string;
  totalShares: string;
  totalStaked: string;
}

export type FilterState = {
  searchQuery: string;
  domainFilter: string;
  sortBy: 'totalStaked' | 'tax' | 'id' | 'minimumStake';
  sortOrder: 'asc' | 'desc';

  statusFilter?: Operator['status'][];
};

export interface ReturnDetailsWindows {
  d1?: ReturnDetails;
  d3?: ReturnDetails;
  d7?: ReturnDetails;
  d30?: ReturnDetails;
}

export interface OperatorStore {
  // State
  operators: Operator[];
  filteredOperators: Operator[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Filters
  filters: FilterState;

  // Actions
  fetchOperators: () => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  refreshOperatorData: (operatorId: string) => Promise<void>;
  clearError: () => void;
}
