import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { fetchUserPositions, calculatePortfolioSummary } from '@/services/position-service';
import type { UserPosition, PortfolioSummary } from '@/types/position';

export const usePositions = (refreshInterval = 30000) => {
  const { isConnected, selectedAccount } = useWallet();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!isConnected || !selectedAccount) {
      setPositions([]);
      setPortfolioSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userPositions = await fetchUserPositions(selectedAccount.address);
      const summary = calculatePortfolioSummary(userPositions);

      setPositions(userPositions);
      setPortfolioSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      console.error('Position fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedAccount]);

  // Fetch on mount and account change
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchPositions, refreshInterval);
    return () => clearInterval(interval);
  }, [isConnected, refreshInterval, fetchPositions]);

  return {
    positions,
    portfolioSummary,
    loading,
    error,
    refetch: fetchPositions,
    hasPositions: positions.length > 0,
  };
};
