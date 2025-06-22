import React from 'react';
import { useWalletStore, useLegacyWalletStore } from '@/stores/wallet-store';
import type { LegacyWalletState } from '@/types/wallet';

export const useWallet = () => {
  const store = useWalletStore();

  // Auto-detect wallets and initialize connection on hook mount
  React.useEffect(() => {
    const { detectWallets, initializeConnection } = useWalletStore.getState();
    detectWallets();
    initializeConnection();
  }, []);

  return {
    // State
    isConnected: store.isConnected,
    isConnecting: store.isConnecting,
    connectionError: store.connectionError,
    selectedWallet: store.selectedWallet,
    selectedAccount: store.selectedAccount,
    accounts: store.accounts,
    availableWallets: store.availableWallets,
    injector: store.injector,

    // Actions
    connectWallet: store.connectWallet,
    disconnectWallet: store.disconnectWallet,
    selectAccount: store.selectAccount,
    clearError: store.clearError,

    // Computed
    hasWallets: store.availableWallets.length > 0,
    selectedAddress: store.selectedAccount?.address || null,

    // Legacy compatibility
    account: store.selectedAccount,
    connect: store.connectWallet,
    disconnect: store.disconnectWallet,
    error: store.connectionError,
  };
};

// Legacy hook for backward compatibility
export const useLegacyWallet = () => {
  return useLegacyWalletStore((state: LegacyWalletState) => ({
    isConnected: state.isConnected,
    account: state.account,
    connect: state.connect,
    disconnect: state.disconnect,
    error: state.error,
  }));
};
