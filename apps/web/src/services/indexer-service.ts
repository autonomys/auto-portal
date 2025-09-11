import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import type {
  staking_operator_registrations_bool_exp,
  staking_operator_registrations_order_by,
  OperatorEpochSharePricesResponse,
  OperatorEpochSharePriceRow,
  DepositsResponse,
  WithdrawalsResponse,
  NominatorSummaryResponse,
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

// GraphQL: share prices for a set of epoch indexes (exact matches)
const GET_SHARE_PRICES_BY_EPOCHS = gql`
  query GetSharePricesByEpochs($operatorId: String!, $domainId: String!, $epochIndexes: [Int!]!) {
    operator_epoch_share_prices: staking_operator_epoch_share_prices(
      where: {
        operator_id: { _eq: $operatorId }
        domain_id: { _eq: $domainId }
        epoch_index: { _in: $epochIndexes }
      }
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

  // Fetch deposits for address+operator (paginated)
  async getDepositsByOperator(params: {
    address: string;
    operatorId: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: DepositsResponse['staking_nominator_deposits']; totalCount: number }> {
    const { address, operatorId, limit = 25, offset = 0 } = params;

    const QUERY = gql`
      query GetDepositsByOperatorForAddress(
        $address: String!
        $operatorId: String!
        $limit: Int!
        $offset: Int!
      ) {
        staking_nominator_deposits(
          where: { address: { _eq: $address }, operator_id: { _eq: $operatorId } }
          order_by: { timestamp: desc }
          limit: $limit
          offset: $offset
        ) {
          id
          address
          operator_id
          domain_id
          known_shares
          known_storage_fee_deposit
          pending_amount
          pending_storage_fee_deposit
          pending_effective_domain_epoch
          timestamp
          block_height
          block_heights
          extrinsic_ids
          event_ids
          processed
        }
        staking_nominator_deposits_aggregate(
          where: { address: { _eq: $address }, operator_id: { _eq: $operatorId } }
        ) {
          aggregate {
            count
          }
        }
      }
    `;

    const result = await getClient().query<DepositsResponse>({
      query: QUERY,
      variables: { address, operatorId, limit, offset },
      fetchPolicy: 'network-only',
    });

    return {
      rows: result.data.staking_nominator_deposits,
      totalCount: result.data.staking_nominator_deposits_aggregate.aggregate.count,
    };
  },

  // Fetch withdrawals for address+operator (paginated)
  async getWithdrawalsByOperator(params: {
    address: string;
    operatorId: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: WithdrawalsResponse['staking_nominator_withdrawals']; totalCount: number }> {
    const { address, operatorId, limit = 25, offset = 0 } = params;

    const QUERY = gql`
      query GetWithdrawalsByOperatorForAddress(
        $address: String!
        $operatorId: String!
        $limit: Int!
        $offset: Int!
      ) {
        staking_nominator_withdrawals(
          where: { address: { _eq: $address }, operator_id: { _eq: $operatorId } }
          order_by: { timestamp: desc }
          limit: $limit
          offset: $offset
        ) {
          id
          address
          operator_id
          domain_id
          total_withdrawal_amount
          total_storage_fee_withdrawal
          total_pending_withdrawals
          withdrawal_in_shares_amount
          withdrawal_in_shares_storage_fee_refund
          withdrawal_in_shares_domain_epoch
          withdrawal_in_shares_unlock_block
          withdrawals_json
          timestamp
          block_height
          block_heights
          extrinsic_ids
          event_ids
          processed
        }
        staking_nominator_withdrawals_aggregate(
          where: { address: { _eq: $address }, operator_id: { _eq: $operatorId } }
        ) {
          aggregate {
            count
          }
        }
      }
    `;

    const result = await getClient().query<WithdrawalsResponse>({
      query: QUERY,
      variables: { address, operatorId, limit, offset },
      fetchPolicy: 'network-only',
    });

    return {
      rows: result.data.staking_nominator_withdrawals,
      totalCount: result.data.staking_nominator_withdrawals_aggregate.aggregate.count,
    };
  },

  // Fetch nominator summary row (optional)
  async getNominatorSummary(params: {
    address: string;
    operatorId: string;
  }): Promise<NominatorSummaryResponse['staking_nominators'][number] | null> {
    const { address, operatorId } = params;

    const QUERY = gql`
      query GetNominatorSummary($address: String!, $operatorId: String!) {
        staking_nominators(
          where: { address: { _eq: $address }, operator_id: { _eq: $operatorId } }
          limit: 1
        ) {
          id
          domain_id
          operator_id
          total_deposits
          total_withdrawals
          known_shares
          withdrawn_shares
          known_storage_fee_deposit
          total_storage_fee_refund
          total_deposits_count
          total_withdrawals_count
          status
        }
      }
    `;

    const result = await getClient().query<NominatorSummaryResponse>({
      query: QUERY,
      variables: { address, operatorId },
      fetchPolicy: 'network-only',
    });

    return result.data.staking_nominators[0] || null;
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

  // Fetch share prices by a list of epoch indexes for an operator/domain
  async getOperatorSharePricesByEpochs(
    operatorId: string,
    domainId: string,
    epochIndexes: number[],
  ): Promise<OperatorEpochSharePriceRow[]> {
    try {
      const uniq = Array.from(new Set(epochIndexes)).filter(e => Number.isFinite(e));
      if (uniq.length === 0) return [];
      const result = await getClient().query<OperatorEpochSharePricesResponse>({
        query: GET_SHARE_PRICES_BY_EPOCHS,
        variables: { operatorId, domainId, epochIndexes: uniq },
        fetchPolicy: 'network-only',
      });
      return result.data.operator_epoch_share_prices;
    } catch (error) {
      console.error('❌ Failed to fetch share prices by epochs:', error);
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
