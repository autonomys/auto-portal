// Types matching the Auto Portal indexer Hasura GraphQL schema

export interface OperatorRegistration {
  id: string;
  owner: string;
  domain_id: string;
  signing_key: string;
  minimum_nominator_stake: string;
  nomination_tax: number;
  block_height: string;
  extrinsic_id: string;
  event_id: string;
  processed: boolean;
}

export interface OperatorRegistrationsResponse {
  staking_operator_registrations: OperatorRegistration[];
  staking_operator_registrations_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface IndexerMetadata {
  targetHeight: number;
  lastProcessedHeight: number;
  lastProcessedTimestamp: string;
}

// Public endpoint where clause types
export interface staking_operator_registrations_bool_exp {
  owner?: { _eq?: string; _in?: string[]; _like?: string };
  domain_id?: { _eq?: string; _in?: string[] };
  signing_key?: { _eq?: string; _like?: string };
  processed?: { _eq?: boolean };
  id?: { _in?: string[] };
  nomination_tax?: { _gte?: number; _lte?: number };
  minimum_nominator_stake?: { _gte?: string; _lte?: string };
  _and?: staking_operator_registrations_bool_exp[];
  _or?: staking_operator_registrations_bool_exp[];
}

// Public endpoint order by types
export interface staking_operator_registrations_order_by {
  id?: 'asc' | 'desc';
  block_height?: 'asc' | 'desc';
  minimum_nominator_stake?: 'asc' | 'desc';
  nomination_tax?: 'asc' | 'desc';
  owner?: 'asc' | 'desc';
  domain_id?: 'asc' | 'desc';
}

// Legacy types for backward compatibility
export type operator_registrations_bool_exp = staking_operator_registrations_bool_exp;
export type operator_registrations_order_by = staking_operator_registrations_order_by;

// Additional types that may be useful from the schema
export interface DomainInstantiation {
  id: string;
  name: string;
  runtime_id: number;
  runtime: string;
  runtime_info: string;
  created_by: string;
  block_height: string;
  extrinsic_id: string;
  event_id: string;
}

export interface OperatorDeregistration {
  id: string;
  owner: string;
  domain_id: string;
  block_height: string;
  extrinsic_id: string;
  event_id: string;
  processed: boolean;
}

// Utility type for converting indexer data to UI operator format
export interface IndexerToOperatorMapping {
  id: string; // operator registration id
  name: string; // display name (derived)
  domainId: string; // domain_id from indexer
  domainName: string; // derived/mapped
  ownerAccount: string; // owner from indexer
  nominationTax: number; // nomination_tax from indexer
  minimumNominatorStake: string; // minimum_nominator_stake (converted from wei)
  status: 'active' | 'inactive' | 'slashed' | 'degraded'; // derived
  totalStaked: string; // needs RPC fallback or separate query
}

// Epoch share price rows (snake_case as typically exposed by indexer for SubQuery entities)
export interface OperatorEpochSharePriceRow {
  operator_id: string;
  domain_id: string;
  epoch_index: number;
  share_price: string;
  total_stake: string;
  total_shares: string;
  timestamp: string;
  block_height: string;
}

export interface OperatorEpochSharePricesResponse {
  operator_epoch_share_prices: OperatorEpochSharePriceRow[];
}
