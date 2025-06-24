import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWallets, getWalletBySource } from '@talismn/connect-wallets';
import type { WalletState } from '@/types/wallet';
import {
  SUPPORTED_WALLET_EXTENSIONS,
  DAPP_NAME,
  WALLET_STORAGE_KEY,
  CONNECTION_TIMEOUT,
} from '@/constants/wallets';
import type { Wallet } from '@talismn/connect-wallets';

interface ExtendedWalletState extends WalletState {
  isInitializing: boolean;
  lastConnectionAttempt: number | null;
}

export const useWalletStore = create<ExtendedWalletState>()(
  persist(
    (set, get) => ({
      // State
      isConnected: false,
      isConnecting: false,
      isInitializing: false,
      connectionError: null,
      selectedWallet: null,
      selectedAccount: null,
      accounts: [],
      injector: null,
      availableWallets: [],
      lastConnectionAttempt: null,

      // Actions
      detectWallets: () => {
        try {
          const allWallets = getWallets();
          const supportedWallets = allWallets
            .filter((wallet: Wallet) => {
              // Exclude Nova wallet (same as Polkadot.js)
              if (wallet.title?.toLowerCase().includes('nova')) return false;
              return SUPPORTED_WALLET_EXTENSIONS.includes(
                wallet.extensionName as (typeof SUPPORTED_WALLET_EXTENSIONS)[number],
              );
            })
            // Remove duplicates by extension name
            .filter(
              (wallet, index, arr) =>
                arr.findIndex(w => w.extensionName === wallet.extensionName) === index,
            );
          set({ availableWallets: supportedWallets });
        } catch (error) {
          console.warn('Failed to detect wallets:', error);
          set({ availableWallets: [] });
        }
      },

      connectWallet: async (extensionName: string) => {
        const { isConnecting, isInitializing } = get();

        // Prevent multiple simultaneous connection attempts
        if (isConnecting || isInitializing) {
          console.warn('Connection already in progress, ignoring new attempt');
          return;
        }

        set({
          isConnecting: true,
          connectionError: null,
          lastConnectionAttempt: Date.now(),
        });

        // Set up connection timeout
        const timeoutId = setTimeout(() => {
          const currentState = get();
          if (currentState.isConnecting && !currentState.isConnected) {
            set({
              isConnecting: false,
              connectionError: 'Connection timeout. Please try again.',
            });
          }
        }, CONNECTION_TIMEOUT);

        try {
          const wallet = getWalletBySource(extensionName);
          if (!wallet) {
            throw new Error(`Wallet not found: ${extensionName}`);
          }

          if (!wallet.installed) {
            throw new Error(
              `${wallet.title} is not installed. Please install the extension first.`,
            );
          }

          // Enable wallet (triggers popup if not authorized)
          await wallet.enable(DAPP_NAME);

          if (!wallet.extension) {
            throw new Error(`Extension not available for ${extensionName}`);
          }

          const accounts = await wallet.getAccounts();
          if (!accounts || accounts.length === 0) {
            throw new Error(
              `No accounts found in ${wallet.title}. Please create an account first.`,
            );
          }

          // Clear timeout since connection was successful
          clearTimeout(timeoutId);

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
          clearTimeout(timeoutId);
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          console.error('Wallet connection failed:', error);

          set({
            isConnecting: false,
            connectionError: errorMessage,
            // Don't clear existing connection data in case of retry
          });
          throw error;
        }
      },

      initializeConnection: async () => {
        const { selectedWallet, selectedAccount, isConnected, isInitializing, isConnecting } =
          get();

        // Prevent multiple simultaneous initialization attempts
        if (isInitializing || isConnecting) {
          return;
        }

        // Skip if no persisted data or already connected
        if (!selectedWallet || !selectedAccount || isConnected) {
          return;
        }

        set({ isInitializing: true, connectionError: null });

        try {
          const wallet = getWalletBySource(selectedWallet);
          if (!wallet?.installed) {
            // Clear invalid persisted data
            console.log('Wallet no longer installed, clearing persisted data');
            set({
              selectedWallet: null,
              selectedAccount: null,
              isConnected: false,
              isInitializing: false,
            });
            return;
          }

          // Silent reconnection with timeout
          const enablePromise = wallet.enable(DAPP_NAME);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), 10000);
          });

          await Promise.race([enablePromise, timeoutPromise]);

          if (wallet.extension) {
            const accounts = await wallet.getAccounts();
            const targetAccount = accounts.find(acc => acc.address === selectedAccount.address);

            if (targetAccount) {
              set({
                isConnected: true,
                isInitializing: false,
                accounts: accounts,
                injector: wallet.extension,
                connectionError: null,
              });
              console.log('Successfully reconnected to wallet');
            } else {
              // Account no longer exists, clear data
              console.log('Account no longer exists, clearing persisted data');
              set({
                selectedWallet: null,
                selectedAccount: null,
                isConnected: false,
                isInitializing: false,
                accounts: [],
                injector: null,
              });
            }
          } else {
            throw new Error('Extension not available');
          }
        } catch (error) {
          console.warn('Silent reconnection failed:', error);
          // Reset connection state but preserve wallet selection for manual retry
          set({
            isConnected: false,
            isInitializing: false,
            accounts: [],
            injector: null,
            // Keep selectedWallet and selectedAccount for potential manual reconnection
          });
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          isConnecting: false,
          isInitializing: false,
          selectedWallet: null,
          selectedAccount: null,
          accounts: [],
          injector: null,
          connectionError: null,
          lastConnectionAttempt: null,
        });
      },

      selectAccount: (address: string) => {
        const { accounts, isConnected } = get();
        if (!isConnected) {
          console.warn('Cannot select account when wallet is not connected');
          return;
        }

        const account = accounts.find(acc => acc.address === address);
        if (account) {
          set({ selectedAccount: account });
        } else {
          console.warn('Account not found:', address);
        }
      },

      clearError: () => {
        set({ connectionError: null });
      },
    }),
    {
      name: WALLET_STORAGE_KEY,
      partialize: state => ({
        selectedWallet: state.selectedWallet,
        selectedAccount: state.selectedAccount,
        // Don't persist isConnected to avoid inconsistent states
      }),
      onRehydrateStorage: () => state => {
        if (state?.selectedWallet && state?.selectedAccount) {
          // Auto-initialize connection after rehydration with better error handling
          setTimeout(() => {
            try {
              state.initializeConnection();
            } catch (error) {
              console.error('Failed to initialize connection:', error);
            }
          }, 500);
        }
      },
    },
  ),
);
