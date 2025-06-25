import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { fetchWalletBalance, type WalletBalance } from '@/services/balance-service';

export const useBalance = (refreshInterval = 30000) => {
  const { isConnected, selectedAccount } = useWallet();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!isConnected || !selectedAccount) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balanceData = await fetchWalletBalance(selectedAccount.address);
      setBalance(balanceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedAccount]);

  // Fetch on mount and account change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [isConnected, refreshInterval, fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
};
