import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/api/types';
import { web3Enable, web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

declare global {
  interface Window {
    _autonomysApi?: ApiPromise;
  }
}

interface WalletState {
  isConnected: boolean;
  account: InjectedAccountWithMeta | null;
  extension: InjectedExtension | null;
  signer: Signer | null;
  error?: string;

  connect: (source: string) => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    set => ({
      isConnected: false,
      account: null,
      extension: null,
      signer: null,
      error: undefined,

      connect: async (source: string) => {
        try {
          const extensions = await web3Enable('Autonomys Staking');
          const ext = extensions.find(e => e.name === source);
          if (!ext) {
            set({ error: `Extension ${source} not found` });
            return;
          }
          const accounts = await web3Accounts();
          if (!accounts.length) {
            set({ error: 'No accounts found' });
            return;
          }
          const account = accounts[0];
          const injector = await web3FromSource(account.meta.source);

          if (!window._autonomysApi) {
            const provider = new WsProvider('wss://rpc.autonomys.network');
            window._autonomysApi = await ApiPromise.create({ provider });
          }

          const signer = injector.signer as Signer;

          set({
            isConnected: true,
            account,
            extension: ext,
            signer,
            error: undefined,
          });
        } catch (err: unknown) {
          console.error(err);
          set({ error: (err as Error).message });
        }
      },

      disconnect: () =>
        set({
          isConnected: false,
          account: null,
          extension: null,
          signer: null,
          error: undefined,
        }),
    }),
    {
      name: 'wallet-storage',
      partialize: state => ({
        isConnected: state.isConnected,
        account: state.account,
      }),
    },
  ),
);
