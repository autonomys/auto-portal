/**
 * RPC Connection Service for Auto SDK
 * Manages connection to Taurus testnet
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ConnectionError } from '@/utils/error-handling';
import type { ApiConnection, BlockchainConfig } from '@/types/blockchain';

const DEFAULT_CONFIG: BlockchainConfig = {
  rpcEndpoint: 'wss://rpc.taurus.autonomys.xyz/ws',
  reconnectAttempts: 3,
  reconnectDelay: 1000,
};

let apiInstance: ApiConnection | null = null;

export const getApiConnection = async (
  config: Partial<BlockchainConfig> = {},
): Promise<ApiPromise> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Return existing connection if still valid
  if (apiInstance?.isConnected && apiInstance.api.isConnected) {
    return apiInstance.api;
  }

  try {
    console.log(`Connecting to Autonomys RPC at ${finalConfig.rpcEndpoint}`);

    const provider = new WsProvider(finalConfig.rpcEndpoint);
    const api = await ApiPromise.create({ provider });

    // Wait for the API to be ready
    await api.isReady;

    apiInstance = {
      api,
      isConnected: true,
      endpoint: finalConfig.rpcEndpoint,
      connectedAt: new Date(),
    };

    console.log('Successfully connected to Autonomys RPC');
    return api;
  } catch (error) {
    const connectionError = new ConnectionError(
      finalConfig.rpcEndpoint,
      error instanceof Error ? error : undefined,
    );
    console.error('Failed to connect to Autonomys RPC:', connectionError);
    throw connectionError;
  }
};

export const disconnectApi = async (): Promise<void> => {
  if (apiInstance?.api) {
    try {
      await apiInstance.api.disconnect();
      console.log('Disconnected from Autonomys RPC');
    } catch (error) {
      console.warn('Error during disconnect:', error);
    }
  }
  apiInstance = null;
};

export const getConnectionStatus = (): {
  connected: boolean;
  endpoint?: string;
  connectedAt?: Date;
} => {
  if (!apiInstance) {
    return { connected: false };
  }

  return {
    connected: apiInstance.isConnected && apiInstance.api.isConnected,
    endpoint: apiInstance.endpoint,
    connectedAt: apiInstance.connectedAt,
  };
};

export const reconnectApi = async (config: Partial<BlockchainConfig> = {}): Promise<ApiPromise> => {
  await disconnectApi();
  return await getApiConnection(config);
};
