import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWallets, getWalletBySource } from '@talismn/connect-wallets';
import type { WalletState, StoredPreferences, LegacyWalletState } from '@/types/wallet';
import { SUPPORTED_WALLET_EXTENSIONS, DAPP_NAME, WALLET_STORAGE_KEY } from '@/constants/wallets';

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      selectedWallet: null,
      selectedAccount: null,
      accounts: [],
      injector: null,
      availableWallets: [],

      // Actions
      detectWallets: () => {
        try {
          const allWallets = getWallets();
          const supportedWallets = allWallets.filter(wallet =>
            SUPPORTED_WALLET_EXTENSIONS.includes(wallet.extensionName as any),
          );
          set({ availableWallets: supportedWallets });
        } catch (error) {
          console.warn('Wallet detection failed:', error);
          set({ availableWallets: [] });
        }
      },

      connectWallet: async (extensionName: string) => {
        set({ isConnecting: true, connectionError: null });

        try {
          const wallet = getWalletBySource(extensionName);
          if (!wallet) {
            throw new Error(`Wallet not found: ${extensionName}`);
          }

          if (!wallet.installed) {
            throw new Error(`${wallet.title} is not installed. Please install the extension first.`);
          }

          // This WILL trigger popup if wallet not previously authorized
          // This is the KEY REQUIREMENT from the specifications
          await wallet.enable(DAPP_NAME);

          if (!wallet.extension) {
            throw new Error(`Extension not available for ${extensionName}`);
          }

          const accounts = await wallet.getAccounts();
          if (!accounts || accounts.length === 0) {
            throw new Error(`No accounts found in ${wallet.title}. Please create an account first.`);
          }

          set({
            isConnected: true,
            isConnecting: false,
            selectedWallet: extensionName,
            selectedAccount: accounts[0],
            accounts: accounts,
            injector: wallet.extension,
            connectionError: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          set({
            isConnecting: false,
            connectionError: errorMessage,
          });
          throw error; // Re-throw for component error handling
        }
      },

      initializeConnection: async () => {
        const state = get();
        
        // Get stored preferences from persistence
        const storedData = localStorage.getItem(WALLET_STORAGE_KEY);
        if (!storedData) return;

        try {
          const preferences: StoredPreferences = JSON.parse(storedData);
          
          if (preferences.preferredWallet && preferences.preferredAccount) {
            const wallet = getWalletBySource(preferences.preferredWallet);
            if (!wallet || !wallet.installed) {
              // Clean up invalid preferences
              localStorage.removeItem(WALLET_STORAGE_KEY);
              return;
            }

            try {
              // Attempt silent reconnection - won't trigger popup if already authorized
              await wallet.enable(DAPP_NAME);

              if (wallet.extension) {
                const accounts = await wallet.getAccounts();
                
                // Verify saved account still exists
                const targetAccount = accounts.find(
                  acc => acc.address === preferences.preferredAccount,
                );

                if (targetAccount) {
                  set({
                    isConnected: true,
                    selectedWallet: preferences.preferredWallet,
                    selectedAccount: targetAccount,
                    accounts: accounts,
                    injector: wallet.extension,
                    connectionError: null,
                  });
                } else {
                  localStorage.removeItem(WALLET_STORAGE_KEY);
                }
              }
            } catch (error) {
              // Silent fail for auto-reconnection
              console.warn('Auto-reconnection failed:', error);
              localStorage.removeItem(WALLET_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.warn('Failed to parse stored preferences:', error);
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          isConnecting: false,
          selectedWallet: null,
          selectedAccount: null,
          accounts: [],
          injector: null,
          connectionError: null,
        });
      },

      selectAccount: (address: string) => {
        const { accounts } = get();
        const account = accounts.find(acc => acc.address === address);
        if (account) {
          set({ selectedAccount: account });
        }
      },

      clearError: () => {
        set({ connectionError: null });
      },
    }),
    {
      name: WALLET_STORAGE_KEY,
      partialize: state =>
        ({
          preferredWallet: state.selectedWallet,
          preferredAccount: state.selectedAccount?.address || null,
        }) as StoredPreferences,
    },
  ),
);

// Legacy compatibility layer for existing components
export const useLegacyWalletStore = create<LegacyWalletState>()(
  (set, get) => ({
    isConnected: false,
    account: null,
    error: undefined,

    connect: async (source: string) => {
      const mainStore = useWalletStore.getState();
      try {
        await mainStore.connectWallet(source);
        const state = useWalletStore.getState();
        set({
          isConnected: state.isConnected,
          account: state.selectedAccount,
          error: undefined,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        set({ error: errorMessage });
      }
    },

    disconnect: () => {
      const mainStore = useWalletStore.getState();
      mainStore.disconnectWallet();
      set({
        isConnected: false,
        account: null,
        error: undefined,
      });
    },
  }),
);

// Sync legacy store with main store
useWalletStore.subscribe((state) => {
  useLegacyWalletStore.setState({
    isConnected: state.isConnected,
    account: state.selectedAccount,
    error: state.connectionError || undefined,
  });
});
