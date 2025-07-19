// Common types shared across all components

export interface Domain {
  id: string;
  name: string;
  runtimeId: number;
  runtime: string;
  totalStake: bigint;
  operatorCount: number;
  currentEpoch: number;
}

export interface BlockchainEvent {
  id: string;
  blockHeight: bigint;
  blockHash: string;
  extrinsicId: string;
  eventId: string;
  timestamp: Date;
  section: string;
  method: string;
  data: any;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string[];
}

// Utility types
export type Address = string;
export type Hash = string;
export type Timestamp = Date;
export type BigIntString = string; // For JSON serialization of BigInt

// Constants
export const SHARES_CALCULATION_MULTIPLIER = BigInt('1000000000000000000'); // 10^18
