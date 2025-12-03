import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWallets, getWalletBySource } from '@talismn/connect-wallets';
import { address } from '@autonomys/auto-utils';
import type { Wallet } from '@talismn/connect-wallets';
import type { WalletState } from './types';
import {
  SUPPORTED_WALLET_EXTENSIONS,
  DAPP_NAME,
  WALLET_STORAGE_KEY,
  CONNECTION_TIMEOUT,
} from './wallet-constants';

const connectToWallet = async (extensionName: string) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT);
  });

  const wallet = getWalletBySource(extensionName);
  if (!wallet) throw new Error(`Wallet not found: ${extensionName}`);
  if (!wallet.installed) throw new Error(`${wallet.title} is not installed. Please install it.`);

  await Promise.race([wallet.enable(DAPP_NAME), timeoutPromise]);
  if (!wallet.extension) throw new Error(`Extension not available for ${extensionName}`);

  const rawAccounts = await wallet.getAccounts();
  if (!rawAccounts || rawAccounts.length === 0) {
    throw new Error(`No accounts found in ${wallet.title}. Please create an account first.`);
  }

  const accounts = rawAccounts.map(account => ({
    ...account,
    address: address(account.address),
  }));

  return { accounts, injector: wallet.extension, wallet };
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      isLoading: false,
      loadingType: null,
      connectionError: null,
      selectedWallet: null,
      selectedAccount: null,
      accounts: [],
      injector: null,
      availableWallets: [],

      detectWallets: () => {
        try {
          const allWallets = getWallets();
          const supportedWallets = allWallets
            .filter((wallet: Wallet) => {
              if (wallet.title?.toLowerCase().includes('nova')) return false;
              return SUPPORTED_WALLET_EXTENSIONS.includes(
                wallet.extensionName as (typeof SUPPORTED_WALLET_EXTENSIONS)[number],
              );
            })
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
        if (isLoading) return;

        set({ isLoading: true, loadingType: 'connecting', connectionError: null });
        try {
          const { accounts, injector } = await connectToWallet(extensionName);
          set({
            isConnected: true,
            isLoading: false,
            loadingType: null,
            selectedWallet: extensionName,
            selectedAccount: accounts[0],
            accounts,
            injector,
            connectionError: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          console.error('Wallet connection failed:', error);
          set({ isLoading: false, loadingType: null, connectionError: errorMessage });
          throw error;
        }
      },

      initializeConnection: async () => {
        const { selectedWallet, selectedAccount, isConnected, isLoading } = get();
        if (isLoading || !selectedWallet || !selectedAccount || isConnected) return;

        set({ isLoading: true, loadingType: 'initializing', connectionError: null });
        try {
          const wallet = getWalletBySource(selectedWallet);
          if (!wallet?.installed) {
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
          const targetAccount = accounts.find(acc => acc.address === selectedAccount.address);
          if (targetAccount) {
            set({
              isConnected: true,
              isLoading: false,
              loadingType: null,
              accounts,
              injector,
              connectionError: null,
            });
          } else {
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
          set({
            isConnected: false,
            isLoading: false,
            loadingType: null,
            accounts: [],
            injector: null,
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
        if (!isConnected) return;
        const account = accounts.find(acc => acc.address === targetAddress);
        if (account) set({ selectedAccount: account });
      },

      clearError: () => set({ connectionError: null }),
    }),
    {
      name: WALLET_STORAGE_KEY,
      partialize: state => ({
        selectedWallet: state.selectedWallet,
        selectedAccount: state.selectedAccount,
      }),
      onRehydrateStorage: () => state => {
        if (state?.selectedWallet && state?.selectedAccount) {
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
