import { z } from 'zod';

// ============================================================================
// Core Domain Types
// ============================================================================

export const OperatorStatusSchema = z.enum(['active', 'inactive', 'slashed', 'deregistered']);
export type OperatorStatus = z.infer<typeof OperatorStatusSchema>;

export const DomainTypeSchema = z.enum(['auto-evm', 'auto-id']);
export type DomainType = z.infer<typeof DomainTypeSchema>;

export const WithdrawalStatusSchema = z.enum(['pending', 'ready', 'completed']);
export type WithdrawalStatus = z.infer<typeof WithdrawalStatusSchema>;

export const TransactionTypeSchema = z.enum(['stake', 'withdraw', 'unlock', 'compound']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

// ============================================================================
// Operator Types
// ============================================================================

export const OperatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  domainId: z.string(),
  domainType: DomainTypeSchema,
  status: OperatorStatusSchema,

  // Pool Information
  totalStaked: z.string(), // BigInt as string
  sharePrice: z.string(), // BigInt as string
  totalShares: z.string(), // BigInt as string
  nominatorCount: z.number(),

  // Performance Metrics
  apy: z.number(), // Percentage (e.g., 18.5 for 18.5%)
  taxRate: z.number(), // Percentage (e.g., 5 for 5%)
  uptime: z.number(), // Percentage (e.g., 99.2 for 99.2%)

  // Configuration
  minimumStake: z.string(), // BigInt as string
  signingKey: z.string(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Operator = z.infer<typeof OperatorSchema>;

// ============================================================================
// Position Types
// ============================================================================

export const PositionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  operatorId: z.string(),

  // Share Information
  shares: z.string(), // BigInt as string
  sharePrice: z.string(), // Current share price

  // Cost Basis Tracking
  totalInvested: z.string(), // Total AI3 invested (cost basis)
  totalEarned: z.string(), // Total gains (position value - cost basis)

  // Calculated Values
  positionValue: z.string(), // Current worth (shares * sharePrice)
  gainsPercentage: z.number(), // (totalEarned / totalInvested) * 100

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Position = z.infer<typeof PositionSchema>;

// ============================================================================
// Withdrawal Types
// ============================================================================

export const WithdrawalSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  operatorId: z.string(),
  positionId: z.string(),

  // Withdrawal Details
  shares: z.string(), // Shares being withdrawn
  amount: z.string(), // AI3 amount to receive
  costBasis: z.string(), // Cost basis of withdrawn amount
  realizedGains: z.string(), // Gains realized from withdrawal

  // Status and Timing
  status: WithdrawalStatusSchema,
  requestedAt: z.date(),
  epochProcessedAt: z.date().optional(),
  unlockAt: z.date().optional(),
  completedAt: z.date().optional(),

  // Transaction Hashes
  requestTxHash: z.string().optional(),
  unlockTxHash: z.string().optional(),
});

export type Withdrawal = z.infer<typeof WithdrawalSchema>;

// ============================================================================
// Transaction Types
// ============================================================================

export const TransactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  operatorId: z.string().optional(),

  // Transaction Details
  type: TransactionTypeSchema,
  amount: z.string(), // AI3 amount
  txHash: z.string(),
  blockNumber: z.number(),

  // Status
  status: z.enum(['pending', 'confirmed', 'failed']),

  // Metadata
  createdAt: z.date(),
  confirmedAt: z.date().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// ============================================================================
// Portfolio Summary Types
// ============================================================================

export const PortfolioSummarySchema = z.object({
  accountId: z.string(),

  // Total Values
  totalPositionValue: z.string(), // Sum of all position values
  totalInvested: z.string(), // Sum of all cost bases
  totalEarned: z.string(), // Total gains across all positions
  availableBalance: z.string(), // Unstaked AI3 balance

  // Performance
  overallGainsPercentage: z.number(),

  // Position Count
  activePositions: z.number(),

  // Last Updated
  lastUpdated: z.date(),
});

export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;

// ============================================================================
// API Response Types
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.date(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
};

// ============================================================================
// Pagination Types
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

// ============================================================================
// Filter and Sort Types
// ============================================================================

export const OperatorFilterSchema = z.object({
  domainType: DomainTypeSchema.optional(),
  status: OperatorStatusSchema.optional(),
  minApy: z.number().optional(),
  maxApy: z.number().optional(),
  minStake: z.string().optional(), // BigInt as string
  search: z.string().optional(),
});

export type OperatorFilter = z.infer<typeof OperatorFilterSchema>;

export const OperatorSortSchema = z.enum(['apy', 'totalStaked', 'uptime', 'taxRate', 'name']);
export type OperatorSort = z.infer<typeof OperatorSortSchema>;

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

// ============================================================================
// Utility Types
// ============================================================================

export type BigIntString = string; // For representing BigInt values as strings
export type Address = string; // For blockchain addresses
export type Hash = string; // For transaction/block hashes
