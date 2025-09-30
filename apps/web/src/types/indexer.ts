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

// Aggregate response for staking_nominators count
export interface NominatorAggregateResponse {
  staking_nominators_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

// Rows: staking.nominator_deposits (anonymous-select table)
export interface DepositRow {
  id: string;
  address: string;
  operator_id: string;
  domain_id: string;
  known_shares: string; // numeric
  known_storage_fee_deposit: string; // numeric
  pending_amount: string; // numeric
  pending_storage_fee_deposit: string; // numeric
  pending_effective_domain_epoch: string; // numeric
  extrinsic_ids: string; // text
  event_ids: string; // text
  timestamp: string; // timestamptz
  block_heights: string; // text
  block_height: string; // numeric
  processed: boolean;
}

export interface DepositsResponse {
  staking_nominator_deposits: DepositRow[];
  staking_nominator_deposits_aggregate: {
    aggregate: { count: number };
  };
}

// Rows: staking.nominator_withdrawals (anonymous-select table)
export interface WithdrawalRow {
  id: string;
  address: string;
  operator_id: string;
  domain_id: string;
  withdrawal_in_shares_amount: string; // numeric
  withdrawal_in_shares_storage_fee_refund: string; // numeric
  withdrawal_in_shares_domain_epoch: string; // text
  withdrawal_in_shares_unlock_block: string; // numeric
  total_withdrawal_amount: string; // numeric
  total_storage_fee_withdrawal: string; // numeric
  withdrawals_json: string; // text
  total_pending_withdrawals: string; // numeric
  extrinsic_ids: string; // text
  event_ids: string; // text
  timestamp: string; // timestamptz
  block_height: string; // numeric
  block_heights: string; // text
  processed: boolean;
}

export interface WithdrawalsResponse {
  staking_nominator_withdrawals: WithdrawalRow[];
  staking_nominator_withdrawals_aggregate: {
    aggregate: { count: number };
  };
}

// Rows: staking.unlocked_events (anonymous-select table)
export interface UnlockedEventRow {
  id: string;
  domain_id: string;
  operator_id: string;
  address: string;
  nominator_id: string;
  amount: string; // numeric
  storage_fee: string; // numeric
  timestamp: string; // timestamptz
  block_height: string; // numeric
  extrinsic_id: string;
  event_id: string;
  processed: boolean;
}

export interface UnlockedEventsResponse {
  staking_unlocked_events: UnlockedEventRow[];
  staking_unlocked_events_aggregate: {
    aggregate: { count: number };
  };
}

// Row: staking.nominators (optional header context)
export interface NominatorSummaryRow {
  id: string;
  domain_id: string;
  operator_id: string;
  total_deposits: string; // numeric
  total_withdrawals: string; // numeric
  known_shares: string; // numeric
  withdrawn_shares: string; // numeric
  known_storage_fee_deposit: string; // numeric
  total_storage_fee_refund: string; // numeric
  total_deposits_count: string; // numeric
  total_withdrawals_count: string; // numeric
  status: string;
}

export interface NominatorSummaryResponse {
  staking_nominators: NominatorSummaryRow[];
}
