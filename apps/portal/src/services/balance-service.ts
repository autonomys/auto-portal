import { balance } from '@autonomys/auto-consensus';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import { getSharedApiConnection } from './api-service';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  if (!address || !address.trim()) {
    return { free: '0', reserved: '0', total: '0' };
  }
  const api = await getSharedApiConnection();
  const data = await balance(api, address);
  const freeShannons = BigInt(data?.free ?? 0);
  const reservedShannons = BigInt(data?.reserved ?? 0);
  const freeAI3 = shannonsToAi3(freeShannons);
  const reservedAI3 = shannonsToAi3(reservedShannons);
  const totalAI3 = shannonsToAi3(freeShannons + reservedShannons);
  return { free: freeAI3, reserved: reservedAI3, total: totalAI3 };
};
