import { activate, disconnect } from '@autonomys/auto-utils';
import { config } from '@/config';

// Centralized API connection management
let sharedApi: Awaited<ReturnType<typeof activate>> | null = null;
let currentNetworkId: string | null = null;
let connectionPromise: Promise<Awaited<ReturnType<typeof activate>>> | null = null;

/**
 * Get or create shared RPC API connection
 * Ensures only one connection per network across the entire app
 */
export const getSharedApiConnection = async (
  networkId: string = config.network.defaultNetworkId,
) => {
  if (!networkId || typeof networkId !== 'string' || networkId.trim().length === 0) {
    throw new Error('Valid networkId is required');
  }
  const targetNetworkId = networkId.trim();

  // Return existing connection if same network
  if (sharedApi && currentNetworkId === targetNetworkId) {
    return sharedApi;
  }

  // If connection is being established, wait for it
  if (connectionPromise) {
    await connectionPromise.catch(() => {});
    if (sharedApi && currentNetworkId === targetNetworkId) {
      return sharedApi;
    }
  }

  // Disconnect existing connection if switching networks
  if (sharedApi && currentNetworkId !== targetNetworkId) {
    try {
      await disconnect(sharedApi);
    } catch (err) {
      console.warn('Error disconnecting previous RPC connection:', err);
    } finally {
      sharedApi = null;
      currentNetworkId = null;
    }
  }

  // Create new connection with promise to avoid race conditions
  connectionPromise = activate({ networkId: targetNetworkId });

  try {
    sharedApi = await connectionPromise;
    currentNetworkId = targetNetworkId;
    console.log(`🔗 Established shared RPC connection to ${targetNetworkId}`);
    return sharedApi;
  } catch (error) {
    console.error('❌ Failed to establish RPC connection:', error);
    throw error;
  } finally {
    connectionPromise = null;
  }
};

/**
 * Disconnect shared API connection
 */
export const disconnectSharedApi = async () => {
  if (connectionPromise) {
    try {
      const api = await connectionPromise;
      if (api) {
        await disconnect(api);
      }
    } catch {
      // In-flight connection failed, no active connection to disconnect
    } finally {
      sharedApi = null;
      currentNetworkId = null;
      console.log('🔌 Disconnected shared RPC connection');
    }
  } else if (sharedApi) {
    try {
      await disconnect(sharedApi);
    } catch (err) {
      console.warn('Error disconnecting shared RPC connection:', err);
    } finally {
      sharedApi = null;
      currentNetworkId = null;
      console.log('🔌 Disconnected shared RPC connection');
    }
  }
};

/**
 * Get current connection status
 */
export const getConnectionStatus = () => ({
  isConnected: !!sharedApi,
  networkId: currentNetworkId,
});

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    await disconnectSharedApi();
  });
}
