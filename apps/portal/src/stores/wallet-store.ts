import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWallets, getWalletBySource } from '@talismn/connect-wallets';
import { address } from '@autonomys/auto-utils';
import type { WalletState } from '@/types/wallet';
import {
  SUPPORTED_WALLET_EXTENSIONS,
  DAPP_NAME,
  WALLET_STORAGE_KEY,
  CONNECTION_TIMEOUT,
} from '@/constants/wallets';
import type { Wallet } from '@talismn/connect-wallets';

// Shared wallet connection logic
const connectToWallet = async (extensionName: string) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT);
  });

  const wallet = getWalletBySource(extensionName);
  if (!wallet) {
    throw new Error(`Wallet not found: ${extensionName}`);
  }

  if (!wallet.installed) {
    throw new Error(`${wallet.title} is not installed. Please install the extension first.`);
  }

  // Enable wallet with timeout
  await Promise.race([wallet.enable(DAPP_NAME), timeoutPromise]);

  if (!wallet.extension) {
    throw new Error(`Extension not available for ${extensionName}`);
  }

  const rawAccounts = await wallet.getAccounts();
  if (!rawAccounts || rawAccounts.length === 0) {
    throw new Error(`No accounts found in ${wallet.title}. Please create an account first.`);
  }

  // Convert all account addresses to correct SS58 format
  const accounts = rawAccounts.map(account => ({
    ...account,
    address: address(account.address), // Convert to format 6094 (Autonomys mainnet)
  }));

  return {
    accounts,
    injector: wallet.extension,
    wallet,
  };
};

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

        try {
          const { accounts, injector } = await connectToWallet(extensionName);

          set({
            isConnected: true,
            isLoading: false,
            loadingType: null,
            selectedWallet: extensionName,
            selectedAccount: accounts[0],
            accounts: accounts,
            injector: injector,
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
          // Check if wallet is still installed before attempting connection
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

          const { accounts, injector } = await connectToWallet(selectedWallet);

          // Find target account by comparing with stored address (already in correct format)
          const targetAccount = accounts.find(acc => acc.address === selectedAccount.address);

          if (targetAccount) {
            set({
              isConnected: true,
              isLoading: false,
              loadingType: null,
              accounts: accounts,
              injector: injector,
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

      selectAccount: (targetAddress: string) => {
        const { accounts, isConnected } = get();
        if (!isConnected) {
          console.warn('Cannot select account when wallet is not connected');
          return;
        }

        // Find account by address (addresses are already in correct format)
        const account = accounts.find(acc => acc.address === targetAddress);
        if (account) {
          set({ selectedAccount: account });
        } else {
          console.warn('Account not found:', targetAddress);
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
