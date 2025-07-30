// Central configuration for the application
export const config = {
  indexer: {
    endpoint:
      import.meta.env.VITE_INDEXER_ENDPOINT ||
      'https://subql.blue.taurus.subspace.network/v1/graphql',
  },
  // Add other configuration as needed
} as const;
