import React from 'react';
import { useWalletStore } from '@/stores/wallet-store';

export const useWallet = () => {
  const store = useWalletStore();

  // Auto-detect wallets on hook mount
  // Connection initialization is handled by store rehydration
  React.useEffect(() => {
    const { detectWallets } = useWalletStore.getState();
    detectWallets();
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
  };
};
