import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOperatorFilters } from '../use-operators';
import { useOperatorStore } from '@/stores/operator-store';

describe('useOperatorFilters Hook', () => {
  beforeEach(() => {
    useOperatorStore.getState().resetFilters();
  });

  it('cycleSort flips order when cycling the same field', () => {
    const { result } = renderHook(() => useOperatorFilters());
    expect(result.current.filters.sortBy).toBe('totalStaked');
    expect(result.current.filters.sortOrder).toBe('desc');

    act(() => {
      result.current.cycleSort('totalStaked');
    });

    expect(result.current.filters.sortBy).toBe('totalStaked');
    expect(result.current.filters.sortOrder).toBe('asc');
  });

  it('cycleSort sets new field and defaults sortOrder to desc when selecting a new field', () => {
    const { result } = renderHook(() => useOperatorFilters());

    // First cycle totalStaked to asc
    act(() => {
      result.current.cycleSort('totalStaked');
    });
    expect(result.current.filters.sortOrder).toBe('asc');

    // Cycle to a new field 'apy' -> should default to desc
    act(() => {
      result.current.cycleSort('apy');
    });
    expect(result.current.filters.sortBy).toBe('apy');
    expect(result.current.filters.sortOrder).toBe('desc');
  });

  it('toggleSortOrder toggles sort direction between asc and desc', () => {
    const { result } = renderHook(() => useOperatorFilters());
    expect(result.current.filters.sortOrder).toBe('desc');

    act(() => {
      result.current.toggleSortOrder();
    });
    expect(result.current.filters.sortOrder).toBe('asc');

    act(() => {
      result.current.toggleSortOrder();
    });
    expect(result.current.filters.sortOrder).toBe('desc');
  });

  it('hasActiveFilters detects non-default state across searchQuery, myStakesOnly, sortBy, and sortOrder', () => {
    const { result } = renderHook(() => useOperatorFilters());
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.updateSearch('alpha');
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.toggleMyStakesOnly();
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.cycleSort('tax');
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.toggleSortOrder();
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });
});
