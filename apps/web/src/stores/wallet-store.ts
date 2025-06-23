import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWallets, getWalletBySource } from '@talismn/connect-wallets';
import type { WalletState } from '@/types/wallet';
import { SUPPORTED_WALLET_EXTENSIONS, DAPP_NAME, WALLET_STORAGE_KEY } from '@/constants/wallets';
import type { Wallet } from '@talismn/connect-wallets';

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // State
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
        } catch {
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
          throw error;
        }
      },

      initializeConnection: async () => {
        const { selectedWallet, selectedAccount, isConnected } = get();

        // Skip if no persisted data or already connected
        if (!selectedWallet || !selectedAccount || isConnected) {
          return;
        }

        try {
          const wallet = getWalletBySource(selectedWallet);
          if (!wallet?.installed) {
            // Clear invalid persisted data
            set({ selectedWallet: null, selectedAccount: null, isConnected: false });
            return;
          }

          // Silent reconnection
          await wallet.enable(DAPP_NAME);

          if (wallet.extension) {
            const accounts = await wallet.getAccounts();
            const targetAccount = accounts.find(acc => acc.address === selectedAccount.address);

            if (targetAccount) {
              set({
                isConnected: true,
                accounts: accounts,
                injector: wallet.extension,
                connectionError: null,
              });
            } else {
              // Account no longer exists, clear data
              set({ selectedWallet: null, selectedAccount: null, isConnected: false });
            }
          }
        } catch {
          // Silent fail - user may need to authorize again
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
      partialize: state => ({
        selectedWallet: state.selectedWallet,
        selectedAccount: state.selectedAccount,
        isConnected: state.isConnected,
      }),
      onRehydrateStorage: () => state => {
        if (state?.selectedWallet && state?.selectedAccount) {
          // Auto-initialize connection after rehydration
          setTimeout(() => state.initializeConnection(), 500);
        }
      },
    },
  ),
);
