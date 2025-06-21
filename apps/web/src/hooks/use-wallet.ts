import { useWalletStore } from '@/stores/wallet-store';

export const useWallet = () => {
  return useWalletStore(state => ({
    isConnected: state.isConnected,
    account: state.account,
    connect: state.connect,
    disconnect: state.disconnect,
    error: state.error,
  }));
};
