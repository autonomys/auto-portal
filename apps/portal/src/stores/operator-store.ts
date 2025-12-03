import { create } from 'zustand';
import type { OperatorStore, FilterState, Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';
import { operatorService } from '@/services/operator-service';
import indexerService from '@/services/indexer-service';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  domainFilter: 'all',
  sortBy: 'totalStaked',
  sortOrder: 'desc',
  myStakesOnly: false,
};

export const useOperatorStore = create<OperatorStore>((set, get) => ({
  // State
  operators: [],
  filteredOperators: [],
  stakedOperators: [],
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  isInitialized: false,
  userPositions: [],

  // Actions
  fetchOperators: async () => {
    const { loading } = get();

    // Prevent concurrent fetches
    if (loading) return;

    set({ loading: true, error: null, isInitialized: true });

    try {
      const opService = await operatorService(); // Use value from config
      const operators = await opService.getAllOperators();

      // Set base operators first for fast UI
      set({ operators, loading: false });

      // Apply current filters
      get().applyFilters();

      // Enrich with estimated APY windows (1/3/7/30d) in the background
      const enrichmentPromises = operators.map(async op => {
        try {
          const windows = await opService.estimateOperatorReturnDetailsWindows(op.id);
          const d1 = windows?.d1 ?? null;
          return { id: op.id, windows, d1 } as const;
        } catch {
          return { id: op.id, windows: {}, d1: null } as const;
        }
      });

      const results = await Promise.allSettled(enrichmentPromises);
      const idToWindows = new Map<
        string,
        OperatorStore['operators'][number]['estimatedReturnDetailsWindows']
      >();
      const idToD1 = new Map<
        string,
        OperatorStore['operators'][number]['estimatedReturnDetails'] | null
      >();
      for (const r of results) {
        if (r.status === 'fulfilled') {
          idToWindows.set(r.value.id, r.value.windows);
          idToD1.set(r.value.id, r.value.d1);
        }
      }

      const enriched = get().operators.map(op => {
        const windows = idToWindows.get(op.id) || undefined;
        const d1 = idToD1.get(op.id) || undefined;
        if (!windows && !d1) return op;
        return {
          ...op,
          ...(d1 ? { estimatedReturnDetails: d1 } : {}),
          ...(windows ? { estimatedReturnDetailsWindows: windows } : {}),
        };
      });

      set({ operators: enriched });
      get().applyFilters();

      // Enrich with active nominator counts in the background
      try {
        const countPromises = operators.map(async op => {
          try {
            const count = await indexerService.getNominatorCount(op.id);
            return { id: op.id, count } as const;
          } catch {
            return { id: op.id, count: null } as const;
          }
        });

        const countResults = await Promise.allSettled(countPromises);
        const idToCount = new Map<string, number>();
        for (const r of countResults) {
          if (r.status === 'fulfilled' && r.value.count !== null) {
            idToCount.set(r.value.id, r.value.count);
          }
        }

        if (idToCount.size > 0) {
          const withCounts = get().operators.map(op =>
            idToCount.has(op.id) ? { ...op, nominatorCount: idToCount.get(op.id)! } : op,
          );
          set({ operators: withCounts });
          get().applyFilters();
        }
      } catch {
        // Swallow errors; UI will render placeholders
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch operators';
      set({ loading: false, error: errorMessage });
    }
  },

  setFilters: (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    get().applyFilters();
  },

  setUserPositions: (positions: UserPosition[]) => {
    set({ userPositions: positions });
    get().applyFilters();
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
    get().applyFilters();
  },

  applyFilters: () => {
    const { operators, filters, userPositions } = get();

    // Build a map of operatorId -> position value for sorting and filtering
    const positionMap = new Map<string, number>();
    const stakedOperatorIds = new Set<string>();
    for (const pos of userPositions) {
      const totalValue =
        pos.positionValue + pos.storageFeeDeposit + (pos.pendingDeposit?.amount || 0);
      positionMap.set(pos.operatorId, totalValue);
      if (totalValue > 0) {
        stakedOperatorIds.add(pos.operatorId);
      }
    }

    let filtered = [...operators];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        op => op.name.toLowerCase().includes(query) || op.id.toLowerCase().includes(query),
      );
    }

    // Domain filter
    if (filters.domainFilter !== 'all') {
      filtered = filtered.filter(op => op.domainId === filters.domainFilter);
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      filtered = filtered.filter(op => filters.statusFilter!.includes(op.status));
    }

    // My stakes only filter
    if (filters.myStakesOnly) {
      filtered = filtered.filter(op => stakedOperatorIds.has(op.id));
    }

    // Helper to get sort value for a field
    const getSortValue = (op: Operator, field: typeof filters.sortBy): number | string => {
      switch (field) {
        case 'name':
          return op.name;
        case 'totalStaked':
          return parseFloat(op.totalPoolValue || op.totalStaked || '0');
        case 'nominatorCount':
          return op.nominatorCount ?? 0;
        case 'tax':
          return op.nominationTax;
        case 'apy':
          return op.estimatedReturnDetails?.annualizedReturn ?? 0;
        case 'status': {
          const statusOrder: Record<Operator['status'], number> = {
            active: 4,
            degraded: 3,
            inactive: 2,
            slashed: 1,
          };
          return statusOrder[op.status] ?? 0;
        }
        case 'yourPosition':
          return positionMap.get(op.id) ?? 0;
        default:
          return 0;
      }
    };

    // Compare function with tiebreakers: primary → totalStaked → name
    const compareOperators = (a: Operator, b: Operator): number => {
      const aVal = getSortValue(a, filters.sortBy);
      const bVal = getSortValue(b, filters.sortBy);

      let comparison: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        comparison = (aVal as number) - (bVal as number);
      }

      // Apply sort order
      if (filters.sortOrder === 'desc') {
        comparison = -comparison;
      }

      // If equal, use tiebreakers
      if (comparison === 0 && filters.sortBy !== 'totalStaked') {
        // Secondary: totalStaked (desc)
        const aStaked = parseFloat(a.totalPoolValue || a.totalStaked || '0');
        const bStaked = parseFloat(b.totalPoolValue || b.totalStaked || '0');
        comparison = bStaked - aStaked;
      }

      if (comparison === 0 && filters.sortBy !== 'name') {
        // Tertiary: name (asc)
        comparison = a.name.localeCompare(b.name);
      }

      return comparison;
    };

    // Sorting function
    const sortOperators = (ops: Operator[]): Operator[] => [...ops].sort(compareOperators);

    // Separate staked and non-staked operators, then sort each group
    const staked = filtered.filter(op => stakedOperatorIds.has(op.id));
    const nonStaked = filtered.filter(op => !stakedOperatorIds.has(op.id));

    const sortedStaked = sortOperators(staked);
    const sortedNonStaked = sortOperators(nonStaked);

    set({
      stakedOperators: sortedStaked,
      filteredOperators: sortedNonStaked,
    });
  },

  refreshOperatorData: async (operatorId: string) => {
    try {
      void operatorId;
      await get().fetchOperators();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh operator data';
      set({ error: errorMessage });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
