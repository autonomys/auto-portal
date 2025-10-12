import type { Wallet, WalletAccount } from '@talismn/connect-wallets';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

export type LoadingType = 'connecting' | 'initializing' | null;

export interface WalletState {
  isConnected: boolean;
  isLoading: boolean;
  loadingType: LoadingType;
  connectionError: string | null;

  selectedWallet: string | null;
  selectedAccount: WalletAccount | null;
  accounts: WalletAccount[];
  injector: InjectedExtension | null;

  availableWallets: Wallet[];

  connectWallet: (extensionName: string) => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (address: string) => void;
  clearError: () => void;
  detectWallets: () => void;
  initializeConnection: () => Promise<void>;
}

export type ThemePreference = 'light' | 'dark' | 'system';
