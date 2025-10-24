// Central configuration for the application
const resolveNetworkId = () => {
  const envNetwork =
    (import.meta.env.VITE_NETWORK_ID as string | undefined) ||
    (import.meta.env.VITE_NETWORK as string | undefined);
  // Default to dev in non-production builds; require explicit override via VITE_NETWORK_ID in CI/CD
  const fallback = import.meta.env.MODE === 'production' ? 'mainnet' : 'dev';
  const selected = (envNetwork && envNetwork.trim()) || fallback;
  if (selected === 'taurus') {
    // Soft warning for deprecated testnet
    console.warn(
      '[config] The "taurus" testnet is deprecated. Please migrate to "chronos" when available or use "dev" for local development.',
    );
  }
  return selected;
};

export const config = {
  // Indexer configuration
  indexer: {
    endpoint:
      import.meta.env.VITE_INDEXER_ENDPOINT ||
      'https://subql.staking.mainnet.autonomys.xyz/v1/graphql',
  },

  // Network configuration
  network: {
    // Derive from environment with safe fallback
    defaultNetworkId: resolveNetworkId(),
  },

  // Explorer configuration
  explorer: {
    extrinsicBaseUrl:
      import.meta.env.VITE_EXPLORER_EXTRINSIC_BASE_URL || 'https://autonomys.subscan.io/extrinsic/',
  },

  // Add other configuration as needed
} as const;
