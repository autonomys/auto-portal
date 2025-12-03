import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { positionService } from '@/services/position-service';
import type { UserPosition, PortfolioSummary } from '@/types/position';
import { TARGET_OPERATORS } from '@/constants/target-operators';
import { config } from '@/config';

interface UsePositionsOptions {
  refreshInterval?: number; // Auto-refresh interval in ms. 0 = disabled, default 30000 (30s)
  networkId?: string; // Default from config (mainnet)
}

interface UsePositionsReturn {
  // State
  positions: UserPosition[];
  portfolioSummary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Computed
  hasPositions: boolean;
  totalValue: number;
  activePositionsCount: number;

  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const usePositions = (options: UsePositionsOptions = {}): UsePositionsReturn => {
  const {
    refreshInterval = 30000, // 30 seconds - set to 0 to disable auto-refresh
    networkId = config.network.defaultNetworkId,
  } = options;

  const { isConnected, selectedAccount } = useWallet();

  // State
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Clear data when wallet disconnects
  useEffect(() => {
    if (!isConnected || !selectedAccount) {
      setPositions([]);
      setPortfolioSummary(null);
      setLastUpdated(null);
      setError(null);
    }
  }, [isConnected, selectedAccount]);

  // Fetch positions function
  const fetchPositions = useCallback(async () => {
    if (!isConnected || !selectedAccount) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = await positionService(networkId);

      // TODO: This is a temporary solution to fetch positions for target operators until we have indexer in place
      const positions = (
        await Promise.all(
          TARGET_OPERATORS.map(async operatorId =>
            service.getPositionByOperator(selectedAccount.address, operatorId),
          ),
        )
      ).filter(position => position !== null);

      const summary = service.calculatePortfolioSummary(positions);

      setPositions(positions);
      setPortfolioSummary(summary);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch positions';
      setError(errorMessage);
      console.error('Position fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedAccount, networkId]);

  // Fetch on mount and account change
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !isConnected || !selectedAccount) {
      return;
    }

    const interval = setInterval(() => {
      fetchPositions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isConnected, selectedAccount, fetchPositions]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const hasPositions = positions.length > 0;
  const totalValue = portfolioSummary?.totalValue || 0;
  const activePositionsCount = portfolioSummary?.activePositions || 0;

  return {
    // State
    positions,
    portfolioSummary,
    loading,
    error,
    lastUpdated,

    // Computed
    hasPositions,
    totalValue,
    activePositionsCount,

    // Actions
    refetch: fetchPositions,
    clearError,
  };
};

/**
 * Hook for accessing a specific operator position
 */
export const useOperatorPosition = (operatorId: string, options: UsePositionsOptions = {}) => {
  const { networkId = config.network.defaultNetworkId } = options;
  const { isConnected, selectedAccount } = useWallet();

  const [position, setPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    if (!isConnected || !selectedAccount) {
      setPosition(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = await positionService(networkId);
      const result = await service.getPositionByOperator(selectedAccount.address, operatorId);

      setPosition(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch position';
      setError(errorMessage);
      console.error('Single position fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedAccount, operatorId, networkId]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return {
    position,
    loading,
    error,
    refetch: fetchPosition,
    hasPosition: !!position,
  };
};
