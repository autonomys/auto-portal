import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type {
  staking_operator_registrations_bool_exp,
  staking_operator_registrations_order_by,
  OperatorEpochSharePricesResponse,
  OperatorEpochSharePriceRow,
} from '@/types/indexer';
import { config } from '@/config';

// Create Apollo Client for indexer
const createApolloClient = () =>
  new ApolloClient({
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

// Lazy-initialized client
let client: ApolloClient<object> | null = null;

const getClient = () => {
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
    operator_epoch_share_prices: staking_operator_epoch_share_prices(
      where: { operator_id: { _eq: $operatorId } }
      order_by: [{ timestamp: desc }, { epoch_index: desc }]
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

// GraphQL: first N share price rows since a given timestamp (inclusive)
const GET_SHARE_PRICES_SINCE = gql`
  query GetSharePricesSince($operatorId: String!, $since: timestamptz!, $limit: Int!) {
    operator_epoch_share_prices: staking_operator_epoch_share_prices(
      where: { operator_id: { _eq: $operatorId }, timestamp: { _gte: $since } }
      order_by: [{ timestamp: asc }, { epoch_index: asc }]
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

// GraphQL: last N share price rows until a given timestamp (inclusive)
const GET_SHARE_PRICES_UNTIL = gql`
  query GetSharePricesUntil($operatorId: String!, $until: timestamptz!, $limit: Int!) {
    operator_epoch_share_prices: staking_operator_epoch_share_prices(
      where: { operator_id: { _eq: $operatorId }, timestamp: { _lte: $until } }
      order_by: [{ timestamp: desc }, { epoch_index: desc }]
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

// GraphQL: aggregate nominator count for an operator (active only)
const GET_NOMINATOR_COUNT = gql`
  query GetNominatorCount($operatorId: String!) {
    staking_nominators_aggregate(
      where: { operator_id: { _eq: $operatorId }, status: { _eq: "active" } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

// Service functions
export const indexerService = {
  // Test connection to indexer
  async testConnection(): Promise<boolean> {
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

  // Fetch share price rows since a given timestamp (accepts Date or ISO string)
  async getOperatorSharePricesSince(
    operatorId: string,
    since: string | Date,
    limit = 1,
  ): Promise<OperatorEpochSharePriceRow[]> {
    try {
      const sinceISO = typeof since === 'string' ? since : since.toISOString();
      const cappedLimit = Math.max(1, Math.min(50, limit));
      const result = await getClient().query<OperatorEpochSharePricesResponse>({
        query: GET_SHARE_PRICES_SINCE,
        variables: { operatorId, since: sinceISO, limit: cappedLimit },
        fetchPolicy: 'network-only',
      });

      return result.data.operator_epoch_share_prices;
    } catch (error) {
      console.error('❌ Failed to fetch share prices since timestamp:', error);
      throw error;
    }
  },

  // Fetch last share price rows until a given timestamp (accepts Date or ISO string)
  async getOperatorSharePricesUntil(
    operatorId: string,
    until: string | Date,
    limit = 1,
  ): Promise<OperatorEpochSharePriceRow[]> {
    try {
      const untilISO = typeof until === 'string' ? until : until.toISOString();
      const cappedLimit = Math.max(1, Math.min(50, limit));
      const result = await getClient().query<OperatorEpochSharePricesResponse>({
        query: GET_SHARE_PRICES_UNTIL,
        variables: { operatorId, until: untilISO, limit: cappedLimit },
        fetchPolicy: 'network-only',
      });

      return result.data.operator_epoch_share_prices;
    } catch (error) {
      console.error('❌ Failed to fetch share prices until timestamp:', error);
      throw error;
    }
  },

  // Fetch nominator count for an operator
  async getNominatorCount(operatorId: string): Promise<number> {
    try {
      const result = await getClient().query<{
        staking_nominators_aggregate: { aggregate: { count: number } };
      }>({
        query: GET_NOMINATOR_COUNT,
        variables: { operatorId },
        fetchPolicy: 'network-only',
      });

      return result.data.staking_nominators_aggregate.aggregate.count;
    } catch (error) {
      console.error('❌ Failed to fetch nominator count:', error);
      throw error;
    }
  },

  // Get Apollo Client instance (for direct usage if needed)
  getClient() {
    return getClient();
  },
};

export {
  GET_OPERATORS,
  GET_LATEST_SHARE_PRICES,
  GET_SHARE_PRICES_SINCE,
  GET_SHARE_PRICES_UNTIL,
  GET_NOMINATOR_COUNT,
};
export default indexerService;
