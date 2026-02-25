import { config } from '@/config';

export interface ChainPulseOperator {
  id: string;
  domain_id: string;
  owner_account: string; // SS58 address of the operator owner
  signing_key: string;
  minimum_nominator_stake: string; // shannons
  nomination_tax: number;
  total_stake: string; // shannons
  total_shares: string;
  total_storage_fee_deposit: string; // shannons
  status: string; // 'registered' | 'deregistered' | 'slashed' | 'pending_slash' | 'invalid_bundle' | 'deactivated'
  nominator_count: number;
}

export interface ChainPulseSharePrice {
  operator_id: string;
  domain_id: string;
  epoch_index: number;
  share_price: string;
  total_stake: string;
  total_shares: string;
  block_height: string;
  timestamp: string; // ISO datetime
}

export interface ChainPulseDeposit {
  operator_id: string;
  address: string;
  amount: string; // shannons (staking portion)
  storage_fee: string; // shannons (storage fee portion)
  block_height: number;
  timestamp: string; // ISO datetime
}

export interface ChainPulseWithdrawal {
  operator_id: string;
  address: string;
  shares: string; // shares being withdrawn (0 if epoch-converted)
  amount: string; // shannons, converted balance (0 if shares still pending)
  storage_fee_refund: string; // shannons
  block_height: number;
  timestamp: string; // ISO datetime
}

const fetchJson = async <T>(path: string): Promise<T> => {
  const url = `${config.chainPulse.baseUrl}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`chain-pulse ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
};

export const chainPulseClient = {
  async getOperators(): Promise<ChainPulseOperator[]> {
    return fetchJson<ChainPulseOperator[]>('/v1/staking/operators');
  },

  async getOperator(id: string): Promise<ChainPulseOperator | null> {
    try {
      return await fetchJson<ChainPulseOperator>(`/v1/staking/operators/${id}`);
    } catch {
      return null;
    }
  },

  async getSharePrices(
    operatorId: string,
    params?: { since?: string; until?: string; limit?: number },
  ): Promise<ChainPulseSharePrice[]> {
    const qs = new URLSearchParams();
    if (params?.since) qs.set('since', params.since);
    if (params?.until) qs.set('until', params.until);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return fetchJson<ChainPulseSharePrice[]>(
      `/v1/staking/operators/${operatorId}/share-prices${query}`,
    );
  },

  async getDeposits(
    operatorId: string,
    address: string,
    params?: { limit?: number; offset?: number },
  ): Promise<ChainPulseDeposit[]> {
    const qs = new URLSearchParams({ address });
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return fetchJson<ChainPulseDeposit[]>(`/v1/staking/operators/${operatorId}/deposits?${qs}`);
  },

  async getWithdrawals(
    operatorId: string,
    address: string,
    params?: { limit?: number; offset?: number },
  ): Promise<ChainPulseWithdrawal[]> {
    const qs = new URLSearchParams({ address });
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return fetchJson<ChainPulseWithdrawal[]>(
      `/v1/staking/operators/${operatorId}/withdrawals?${qs}`,
    );
  },

  async getNominatorOperatorIds(address: string): Promise<string[]> {
    return fetchJson<string[]>(
      `/v1/staking/nominators/operators?address=${encodeURIComponent(address)}`,
    );
  },
};
