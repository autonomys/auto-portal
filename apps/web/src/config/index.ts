// Central configuration for the application
export const config = {
  // Feature flags
  features: {
    enableIndexer: import.meta.env.VITE_ENABLE_INDEXER === 'true',
  },

  // Indexer configuration (only used when enableIndexer is true)
  indexer: {
    endpoint:
      import.meta.env.VITE_INDEXER_ENDPOINT ||
      'https://subql.blue.mainnet.subspace.network/v1/graphql',
  },

  // Network configuration
  network: {
    defaultNetworkId: 'mainnet', // Changed from taurus to mainnet
  },

  // Add other configuration as needed
} as const;
