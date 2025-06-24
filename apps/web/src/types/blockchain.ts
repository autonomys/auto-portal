/**
 * Type definitions for Auto SDK blockchain integration
 */

import type { ApiPromise } from '@polkadot/api';

export interface BlockchainConfig {
  rpcEndpoint: string;
  reconnectAttempts: number;
  reconnectDelay: number;
}

export interface OperatorRpcData {
  signingKey: string;
  currentTotalStake: bigint;
  minimumNominatorStake: bigint;
  nominationTax: bigint;
  status: string;
  currentEpochRewards: bigint;
  currentTotalShares: bigint;
}

export interface DomainRpcData {
  id: string;
  name: string;
  runtimeId: string;
  completedEpoch: number;
}

export interface BalanceRpcData {
  free: bigint;
  reserved: bigint;
  frozen: bigint;
}

export interface ApiConnection {
  api: ApiPromise;
  isConnected: boolean;
  endpoint: string;
  connectedAt: Date;
}

export interface BlockchainCache {
  operators: Map<string, { data: OperatorRpcData; timestamp: number }>;
  balances: Map<string, { data: BalanceRpcData; timestamp: number }>;
  domains: { data: DomainRpcData[]; timestamp: number } | null;
}

export const CACHE_DURATION = {
  OPERATORS: 30 * 1000, // 30 seconds
  BALANCES: 10 * 1000,  // 10 seconds
  DOMAINS: 5 * 60 * 1000, // 5 minutes
} as const;