import { balance } from '@autonomys/auto-consensus';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import { getSharedApiConnection } from './api-service';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  const api = await getSharedApiConnection();
  const data = await balance(api, address);
  const freeAI3 = shannonsToAi3(data.free);
  const reservedAI3 = shannonsToAi3(data.reserved);
  const totalAI3 = shannonsToAi3(BigInt(data.free) + BigInt(data.reserved));
  return { free: freeAI3, reserved: reservedAI3, total: totalAI3 };
};
