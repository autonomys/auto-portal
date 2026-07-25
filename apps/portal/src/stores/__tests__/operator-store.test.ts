import { describe, it, expect, beforeEach } from 'vitest';
import { useOperatorStore } from '../operator-store';
import type { Operator } from '@/types/operator';
import type { UserPosition } from '@/types/position';

// Mock operators data
const mockOperators: Operator[] = [
  {
    id: 'op1',
    name: 'Alpha Operator',
    domainId: 'domain1',
    domainName: 'Auto EVM',
    ownerAccount: 'owner1',
    nominationTax: 5.0, // 5%
    minimumNominatorStake: '10',
    status: 'active',
    totalStaked: '1000',
    totalPoolValue: '1000',
    nominatorCount: 5,
    estimatedReturnDetails: {
      annualizedReturn: 0.12,
      periodReturn: 0.01,
      startDate: new Date(),
      endDate: new Date(),
    },
  },
  {
    id: 'op2',
    name: 'Beta Operator',
    domainId: 'domain1',
    domainName: 'Auto EVM',
    ownerAccount: 'owner2',
    nominationTax: 10.0, // 10%
    minimumNominatorStake: '10',
    status: 'active',
    totalStaked: '2500',
    totalPoolValue: '2500',
    nominatorCount: 15,
    estimatedReturnDetails: {
      annualizedReturn: 0.08,
      periodReturn: 0.015,
      startDate: new Date(),
      endDate: new Date(),
    },
  },
  {
    id: 'op3',
    name: 'Gamma Operator',
    domainId: 'domain1',
    domainName: 'Auto EVM',
    ownerAccount: 'owner3',
    nominationTax: 2.5, // 2.5%
    minimumNominatorStake: '10',
    status: 'degraded',
    totalStaked: '500',
    totalPoolValue: '500',
    nominatorCount: 2,
    estimatedReturnDetails: {
      annualizedReturn: 0.15,
      periodReturn: 0.02,
      startDate: new Date(),
      endDate: new Date(),
    },
  },
];

// Mock user positions
const mockPositions: UserPosition[] = [
  {
    operatorId: 'op1',
    operatorName: 'Alpha Operator',
    positionValue: 100,
    storageFeeDeposit: 10,
    pendingDeposit: null,
    pendingWithdrawals: [],
    status: 'active',
    lastUpdated: new Date(),
  },
];

describe('Operator Store Sorting and Filtering', () => {
  beforeEach(() => {
    // Reset store state and filters before each test
    const store = useOperatorStore.getState();
    store.resetFilters();
    useOperatorStore.setState({
      operators: [...mockOperators],
      userPositions: [],
      filteredOperators: [],
      stakedOperators: [],
    });
  });

  it('applies default sorting (totalPoolValue descending)', () => {
    const store = useOperatorStore.getState();
    store.applyFilters();

    const { filteredOperators } = useOperatorStore.getState();
    expect(filteredOperators).toHaveLength(3);
    // op2 ($2500) -> op1 ($1000) -> op3 ($500)
    expect(filteredOperators[0].id).toBe('op2');
    expect(filteredOperators[1].id).toBe('op1');
    expect(filteredOperators[2].id).toBe('op3');
  });

  it('filters by search query (case-insensitive)', () => {
    const store = useOperatorStore.getState();
    store.setFilters({ searchQuery: 'alpha' });

    const { filteredOperators } = useOperatorStore.getState();
    expect(filteredOperators).toHaveLength(1);
    expect(filteredOperators[0].id).toBe('op1');
  });

  it('filters by "My Stakes Only"', () => {
    const store = useOperatorStore.getState();
    store.setUserPositions(mockPositions);
    store.setFilters({ myStakesOnly: true });

    const { stakedOperators, filteredOperators } = useOperatorStore.getState();
    // Since myStakesOnly is true, stakedOperators contains user positions, and filteredOperators is empty (or non-matching is filtered out)
    expect(stakedOperators).toHaveLength(1);
    expect(stakedOperators[0].id).toBe('op1');
    expect(filteredOperators).toHaveLength(0);
  });

  it('sorts by estimated APY descending', () => {
    const store = useOperatorStore.getState();
    store.setFilters({ sortBy: 'apy', sortOrder: 'desc' });

    const { filteredOperators } = useOperatorStore.getState();
    // op3 (15%) -> op1 (12%) -> op2 (8%)
    expect(filteredOperators[0].id).toBe('op3');
    expect(filteredOperators[1].id).toBe('op1');
    expect(filteredOperators[2].id).toBe('op2');
  });

  it('sorts by nomination tax ascending', () => {
    const store = useOperatorStore.getState();
    store.setFilters({ sortBy: 'tax', sortOrder: 'asc' });

    const { filteredOperators } = useOperatorStore.getState();
    // op3 (2.5%) -> op1 (5%) -> op2 (10%)
    expect(filteredOperators[0].id).toBe('op3');
    expect(filteredOperators[1].id).toBe('op1');
    expect(filteredOperators[2].id).toBe('op2');
  });

  it('resets all filters back to default values', () => {
    const store = useOperatorStore.getState();
    store.setFilters({
      searchQuery: 'gamma',
      myStakesOnly: true,
      sortBy: 'tax',
      sortOrder: 'asc',
    });

    store.resetFilters();

    const { filters } = useOperatorStore.getState();
    expect(filters.searchQuery).toBe('');
    expect(filters.myStakesOnly).toBe(false);
    expect(filters.sortBy).toBe('totalStaked');
    expect(filters.sortOrder).toBe('desc');
  });
});
