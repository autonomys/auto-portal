import type { Wallet, WalletAccount } from '@talismn/connect-wallets';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

export type LoadingType = 'connecting' | 'initializing' | null;

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  loadingType: LoadingType;
  connectionError: string | null;

  // Wallet data
  selectedWallet: string | null;
  selectedAccount: WalletAccount | null;
  accounts: WalletAccount[];
  injector: InjectedExtension | null;

  // Available wallets
  availableWallets: Wallet[];

  // Actions
  connectWallet: (extensionName: string) => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (address: string) => void;
  clearError: () => void;
  detectWallets: () => void;
  initializeConnection: () => Promise<void>;
}
