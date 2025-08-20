import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type {
  staking_operator_registrations_bool_exp,
  staking_operator_registrations_order_by,
  OperatorEpochSharePricesResponse,
  OperatorEpochSharePriceRow,
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

// GraphQL: latest N epoch share prices for an operator
const GET_LATEST_SHARE_PRICES = gql`
  query GetLatestSharePrices($operatorId: String!, $limit: Int!) {
    operator_epoch_share_prices(
      where: { operator_id: { _eq: $operatorId } }
      order_by: { epoch_index: desc }
      limit: $limit
    ) {
      operator_id
      domain_id
      epoch_index
      share_price
      total_stake
      total_shares
      timestamp
      block_height
    }
  }
`;

// GraphQL: share prices since a given ISO timestamp (inclusive)
const GET_SHARE_PRICES_SINCE = gql`
  query GetSharePricesSince($operatorId: String!, $since: timestamptz!) {
    operator_epoch_share_prices(
      where: { operator_id: { _eq: $operatorId }, timestamp: { _gte: $since } }
      order_by: { epoch_index: asc }
    ) {
      operator_id
      domain_id
      epoch_index
      share_price
      total_stake
      total_shares
      timestamp
      block_height
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

  // Fetch latest N share price rows for an operator
  async getOperatorLatestSharePrices(
    operatorId: string,
    limit = 50,
  ): Promise<OperatorEpochSharePriceRow[]> {
    if (!this.isEnabled()) {
      throw new Error('Indexer is disabled. Cannot fetch share prices.');
    }

    try {
      const cappedLimit = Math.max(1, Math.min(50, limit));
      const result = await getClient().query<OperatorEpochSharePricesResponse>({
        query: GET_LATEST_SHARE_PRICES,
        variables: { operatorId, limit: cappedLimit },
        fetchPolicy: 'network-only',
      });
      return result.data.operator_epoch_share_prices;
    } catch (error) {
      console.error('❌ Failed to fetch latest share prices:', error);
      throw error;
    }
  },

  // Fetch share price rows since a given ISO timestamp
  async getOperatorSharePricesSince(
    operatorId: string,
    sinceISO: string,
  ): Promise<OperatorEpochSharePriceRow[]> {
    if (!this.isEnabled()) {
      throw new Error('Indexer is disabled. Cannot fetch share prices.');
    }

    try {
      const result = await getClient().query<OperatorEpochSharePricesResponse>({
        query: GET_SHARE_PRICES_SINCE,
        variables: { operatorId, since: sinceISO },
        fetchPolicy: 'network-only',
      });
      return result.data.operator_epoch_share_prices;
    } catch (error) {
      console.error('❌ Failed to fetch share prices since timestamp:', error);
      throw error;
    }
  },

  // Get Apollo Client instance (for direct usage if needed)
  getClient() {
    return getClient();
  },
};

export { GET_OPERATORS, GET_LATEST_SHARE_PRICES, GET_SHARE_PRICES_SINCE };
export default indexerService;
