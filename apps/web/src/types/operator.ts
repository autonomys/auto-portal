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
  nominatorCount: number;

  // Performance Metrics (calculated from RPC)
  currentAPY: number; // Current annualized percentage yield

  // Calculated/Derived
  poolCapacity: number; // Percentage of max capacity
  isRecommended: boolean; // Algorithm-based recommendation
}

export interface OperatorStats {
  sharePrice: string;
  totalShares: string;
  totalStaked: string;
  nominatorCount: number;
}

export interface OperatorDetails extends Operator {
  // Extended details for operator profile page
  description?: string;
  website?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  // Historical performance data
  apyHistory: Array<{
    epoch: number;
    apy: number;
    timestamp: number;
  }>;
}

export type FilterState = {
  searchQuery: string;
  domainFilter: string;
  sortBy: 'apy' | 'totalStaked' | 'tax';
  sortOrder: 'asc' | 'desc';
  minAPY?: number;
  maxAPY?: number;
  statusFilter?: Operator['status'][];
};

export interface OperatorStore {
  // State
  operators: Operator[];
  filteredOperators: Operator[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters
  filters: FilterState;

  // Actions
  fetchOperators: () => Promise<void>;
  refreshOperators: () => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  refreshOperatorData: (operatorId: string) => Promise<void>;
  clearError: () => void;
}
