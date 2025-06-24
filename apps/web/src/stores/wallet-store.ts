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

// Simplified wallet store with consolidated state management
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // State
      isConnected: false,
      isLoading: false,
      loadingType: null,
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
        const { isLoading } = get();

        // Prevent multiple simultaneous connection attempts
        if (isLoading) {
          console.warn('Connection already in progress, ignoring new attempt');
          return;
        }

        set({
          isLoading: true,
          loadingType: 'connecting',
          connectionError: null,
        });

        let timeoutId: NodeJS.Timeout;

        try {
          // Set up connection timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error('Connection timeout. Please try again.'));
            }, CONNECTION_TIMEOUT);
          });

          const wallet = getWalletBySource(extensionName);
          if (!wallet) {
            throw new Error(`Wallet not found: ${extensionName}`);
          }

          if (!wallet.installed) {
            throw new Error(
              `${wallet.title} is not installed. Please install the extension first.`,
            );
          }

          // Race between wallet connection and timeout
          await Promise.race([wallet.enable(DAPP_NAME), timeoutPromise]);

          if (!wallet.extension) {
            throw new Error(`Extension not available for ${extensionName}`);
          }

          const accounts = await wallet.getAccounts();
          if (!accounts || accounts.length === 0) {
            throw new Error(
              `No accounts found in ${wallet.title}. Please create an account first.`,
            );
          }

          set({
            isConnected: true,
            isLoading: false,
            loadingType: null,
            selectedWallet: extensionName,
            selectedAccount: accounts[0],
            accounts: accounts,
            injector: wallet.extension,
            connectionError: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          console.error('Wallet connection failed:', error);

          set({
            isLoading: false,
            loadingType: null,
            connectionError: errorMessage,
          });
          throw error;
        } finally {
          if (timeoutId!) {
            clearTimeout(timeoutId);
          }
        }
      },

      initializeConnection: async () => {
        const { selectedWallet, selectedAccount, isConnected, isLoading } = get();

        // Prevent multiple simultaneous initialization attempts
        if (isLoading) {
          return;
        }

        // Skip if no persisted data or already connected
        if (!selectedWallet || !selectedAccount || isConnected) {
          return;
        }

        set({
          isLoading: true,
          loadingType: 'initializing',
          connectionError: null,
        });

        try {
          const wallet = getWalletBySource(selectedWallet);
          if (!wallet?.installed) {
            // Clear invalid persisted data
            console.log('Wallet no longer installed, clearing persisted data');
            set({
              selectedWallet: null,
              selectedAccount: null,
              isConnected: false,
              isLoading: false,
              loadingType: null,
            });
            return;
          }

          // Silent reconnection with timeout
          const enablePromise = wallet.enable(DAPP_NAME);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), CONNECTION_TIMEOUT);
          });

          await Promise.race([enablePromise, timeoutPromise]);

          if (wallet.extension) {
            const accounts = await wallet.getAccounts();
            const targetAccount = accounts.find(acc => acc.address === selectedAccount.address);

            if (targetAccount) {
              set({
                isConnected: true,
                isLoading: false,
                loadingType: null,
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
                isLoading: false,
                loadingType: null,
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
            isLoading: false,
            loadingType: null,
            accounts: [],
            injector: null,
            // Keep selectedWallet and selectedAccount for potential manual reconnection
          });
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          isLoading: false,
          loadingType: null,
          selectedWallet: null,
          selectedAccount: null,
          accounts: [],
          injector: null,
          connectionError: null,
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
        // Don't persist connection state to avoid inconsistencies
      }),
      onRehydrateStorage: () => state => {
        if (state?.selectedWallet && state?.selectedAccount) {
          // Auto-initialize connection after rehydration
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
