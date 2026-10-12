import { balance } from '@autonomys/auto-consensus';
import { shannonsToAi3 } from '@autonomys/auto-utils';
import { getSharedApiConnection } from './api-service';

export interface WalletBalance {
  free: string;
  reserved: string;
  total: string;
}

export const fetchWalletBalance = async (address: string): Promise<WalletBalance> => {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    throw new Error('Valid wallet address is required to fetch balance');
  }

  try {
    const api = await getSharedApiConnection();
    const data = await balance(api, address.trim());

    const freeBigInt = BigInt(data?.free ?? 0);
    const reservedBigInt = BigInt(data?.reserved ?? 0);

    const freeAI3 = shannonsToAi3(freeBigInt);
    const reservedAI3 = shannonsToAi3(reservedBigInt);
    const totalAI3 = shannonsToAi3(freeBigInt + reservedBigInt);

    return { free: freeAI3, reserved: reservedAI3, total: totalAI3 };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : String(error);
    throw new Error(`Failed to fetch wallet balance for ${address}: ${errorMsg}`);
  }
};
