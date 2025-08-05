import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type {
  staking_operator_registrations_bool_exp,
  staking_operator_registrations_order_by,
} from '@/types/indexer';
import { config } from '@/config';

// Only create Apollo Client if indexer is enabled
const createApolloClient = () => {
  if (!config.features.enableIndexer) {
    throw new Error('Indexer is disabled. Enable with VITE_ENABLE_INDEXER=true');
  }

  return new ApolloClient({
    uri: config.indexer.endpoint,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            staking_operator_registrations: {
              // Merge paginated results
              keyArgs: ['where'],
              merge(existing = [], incoming) {
                return [...(existing || []), ...(incoming || [])];
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

// Lazy-initialized client
let client: ApolloClient<object> | null = null;

const getClient = () => {
  if (!config.features.enableIndexer) {
    throw new Error('Indexer is disabled. Enable with VITE_ENABLE_INDEXER=true');
  }

  if (!client) {
    client = createApolloClient();
  }

  return client;
};

// Test query to verify connection - using public endpoint
export const TEST_CONNECTION = gql`
  query TestConnection {
    staking_operator_registrations_aggregate {
      aggregate {
        count
      }
    }
  }
`;

// GraphQL query for fetching operators from public endpoint
const GET_OPERATORS = gql`
  query GetOperators(
    $limit: Int!
    $offset: Int!
    $where: staking_operator_registrations_bool_exp
    $order_by: [staking_operator_registrations_order_by!]
  ) {
    staking_operator_registrations(
      limit: $limit
      offset: $offset
      where: $where
      order_by: $order_by
    ) {
      id
      owner
      domain_id
      signing_key
      minimum_nominator_stake
      nomination_tax
      block_height
      extrinsic_id
      event_id
      processed
    }
    staking_operator_registrations_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

// Service functions
export const indexerService = {
  // Check if indexer is enabled
  isEnabled(): boolean {
    return config.features.enableIndexer;
  },

  // Test connection to indexer
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log('⚠️ Indexer is disabled');
      return false;
    }

    try {
      const result = await getClient().query({
        query: TEST_CONNECTION,
        fetchPolicy: 'network-only',
      });
      console.log(
        '✅ Indexer connection successful. Total operators:',
        result.data.staking_operator_registrations_aggregate.aggregate.count,
      );
      return true;
    } catch (error) {
      console.error('❌ Indexer connection failed:', error);
      return false;
    }
  },

  // Fetch operators from indexer
  async getOperators(
    params: {
      limit?: number;
      offset?: number;
      where?: staking_operator_registrations_bool_exp;
      order_by?: staking_operator_registrations_order_by;
    } = {},
  ) {
    if (!this.isEnabled()) {
      throw new Error('Indexer is disabled. Cannot fetch operators from indexer.');
    }

    const {
      limit = 50,
      offset = 0,
      where = { processed: { _eq: true } },
      order_by = { block_height: 'asc' }, // Sort by block_height for proper numeric order
    } = params;

    try {
      const result = await getClient().query({
        query: GET_OPERATORS,
        variables: { limit, offset, where, order_by: [order_by] },
      });

      return {
        operators: result.data.staking_operator_registrations,
        totalCount: result.data.staking_operator_registrations_aggregate.aggregate.count,
      };
    } catch (error) {
      console.error('❌ Failed to fetch operators from indexer:', error);
      throw error;
    }
  },

  // Get Apollo Client instance (for direct usage if needed)
  getClient() {
    return getClient();
  },
};

export { GET_OPERATORS };
export default indexerService;
