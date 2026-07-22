import type {
  ChainPulseClient,
  ChainPulseDeposit,
  ChainPulseOperator,
  ChainPulseSharePrice,
  ChainPulseWithdrawal,
} from './chain-pulse-client';

export const MOCK_OPERATORS: ChainPulseOperator[] = [
  {
    id: '1',
    domain_id: '1',
    owner_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    signing_key: '0x123',
    minimum_nominator_stake: '10000000000000000000', // 10 AI3
    nomination_tax: 5,
    total_stake: '1000000000000000000000', // 1000 AI3
    total_shares: '1000000000000000000000',
    total_storage_fee_deposit: '50000000000000000000', // 50 AI3
    status: 'registered',
    nominator_count: 12,
  },
  {
    id: '2',
    domain_id: '1',
    owner_account: '5FHneW46xGXgs5mUqt2JU15QkqfLwObMm7GSS11xWp1LwObm',
    signing_key: '0x456',
    minimum_nominator_stake: '20000000000000000000', // 20 AI3
    nomination_tax: 10,
    total_stake: '5000000000000000000000', // 5000 AI3
    total_shares: '5000000000000000000000',
    total_storage_fee_deposit: '100000000000000000000', // 100 AI3
    status: 'registered',
    nominator_count: 45,
  },
  {
    id: '3',
    domain_id: '1',
    owner_account: '5FLSigKs9SqLXJvJaKaxWM4s7RZdd81XFWs621t3DdfL3X9P',
    signing_key: '0x789',
    minimum_nominator_stake: '5000000000000000000', // 5 AI3
    nomination_tax: 2.5,
    total_stake: '250000000000000000000', // 250 AI3
    total_shares: '250000000000000000000',
    total_storage_fee_deposit: '10000000000000000000', // 10 AI3
    status: 'registered',
    nominator_count: 3,
  },
];

export const mockChainPulseClient: ChainPulseClient = {
  async getOperators(): Promise<ChainPulseOperator[]> {
    return MOCK_OPERATORS;
  },

  async getOperator(id: string): Promise<ChainPulseOperator | null> {
    return MOCK_OPERATORS.find(op => op.id === id) || null;
  },

  async getSharePrices(): Promise<ChainPulseSharePrice[]> {
    throw new Error('getSharePrices: not implemented in mock mode');
  },

  async getDeposits(): Promise<ChainPulseDeposit[]> {
    throw new Error('getDeposits: not implemented in mock mode');
  },

  async getWithdrawals(): Promise<ChainPulseWithdrawal[]> {
    throw new Error('getWithdrawals: not implemented in mock mode');
  },

  async getNominatorOperatorIds(): Promise<string[]> {
    throw new Error('getNominatorOperatorIds: not implemented in mock mode');
  },
};
