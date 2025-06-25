import { activate } from '@autonomys/auto-utils';
import { balance } from '@autonomys/auto-consensus';
import { shannonsToAI3 } from '@/lib/unit-conversion';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const balanceData = await balance(api, address);

    // Convert from shannons to AI3
    const freeAI3 = shannonsToAI3(balanceData.free.toString());
    const reservedAI3 = shannonsToAI3(balanceData.reserved.toString());
    const totalAI3 = freeAI3 + reservedAI3;

    return {
      free: freeAI3.toString(),
      reserved: reservedAI3.toString(),
      total: totalAI3.toString(),
    };
  } finally {
    await api.disconnect();
  }
};