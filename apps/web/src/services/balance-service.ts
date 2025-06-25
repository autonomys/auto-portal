import { activate } from '@autonomys/auto-utils';
import { balance } from '@autonomys/auto-consensus';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const balanceData = await balance(api, address);

    return {
      free: balanceData.free.toString(),
      reserved: balanceData.reserved.toString(),
      total: (balanceData.free + balanceData.reserved).toString(),
    };
  } finally {
    await api.disconnect();
  }
};