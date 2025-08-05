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
  // Return existing connection if same network
  if (sharedApi && currentNetworkId === networkId) {
    return sharedApi;
  }

  // If connection is being established, wait for it
  if (connectionPromise) {
    await connectionPromise;
    if (sharedApi && currentNetworkId === networkId) {
      return sharedApi;
    }
  }

  // Disconnect existing connection if switching networks
  if (sharedApi && currentNetworkId !== networkId) {
    await disconnect(sharedApi);
    sharedApi = null;
    currentNetworkId = null;
  }

  // Create new connection with promise to avoid race conditions
  connectionPromise = activate({ networkId });

  try {
    sharedApi = await connectionPromise;
    currentNetworkId = networkId;
    console.log(`🔗 Established shared RPC connection to ${networkId}`);
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
  if (sharedApi) {
    await disconnect(sharedApi);
    sharedApi = null;
    currentNetworkId = null;
    console.log('🔌 Disconnected shared RPC connection');
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
