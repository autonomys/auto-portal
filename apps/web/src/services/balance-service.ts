import { balance } from '@autonomys/auto-consensus';
import { getSharedApiConnection } from './api-service';
import { shannonsToAi3 } from '@autonomys/auto-utils';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  const api = await getSharedApiConnection();

  const balanceData = await balance(api, address);

  // Convert from shannons to AI3 using precise SDK helpers
  const freeAI3 = shannonsToAi3(balanceData.free.toString());
  const reservedAI3 = shannonsToAi3(balanceData.reserved.toString());
  // Sum in shannons to avoid string concatenation and precision issues
  const totalShannons = balanceData.free + balanceData.reserved;
  const totalAI3 = shannonsToAi3(totalShannons);

  return {
    free: freeAI3,
    reserved: reservedAI3,
    total: totalAI3,
  };
};
