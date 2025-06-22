import type { Wallet, WalletAccount } from '@talismn/connect-wallets';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
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

export interface StoredPreferences {
  preferredWallet: string | null;
  preferredAccount: string | null;
}

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Legacy interfaces for backward compatibility
export interface LegacyWalletState {
  isConnected: boolean;
  account: WalletAccount | null;
  connect: (source: string) => Promise<void>;
  disconnect: () => void;
  error?: string;
}