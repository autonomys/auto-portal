/**
 * Semantic Design Tokens
 *
 * This file provides semantic color tokens that give meaning-based color usage
 * instead of hard-coded values. Use these tokens to ensure consistent color
 * application across the design system.
 */

// Semantic color combinations for different UI states
export const semanticColors = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-800',
    icon: 'text-success-600',
    button: 'bg-success-500 text-white hover:bg-success-600',
    subtle: 'bg-success-50 text-success-700',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    text: 'text-error-800',
    icon: 'text-error-600',
    button: 'bg-error-500 text-white hover:bg-error-600',
    subtle: 'bg-error-50 text-error-700',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-800',
    icon: 'text-warning-600',
    button: 'bg-warning-500 text-white hover:bg-warning-600',
    subtle: 'bg-warning-50 text-warning-700',
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    text: 'text-info-800',
    icon: 'text-info-600',
    button: 'bg-info-500 text-white hover:bg-info-600',
    subtle: 'bg-info-50 text-info-700',
  },
} as const;

// Status color mappings for operator and transaction states
export const statusColors = {
  active: 'text-status-active',
  inactive: 'text-status-inactive',
  degraded: 'text-status-degraded',
  slashed: 'text-status-slashed',
  pending: 'text-status-pending',
} as const;

// Operator status color mappings
export const operatorStatusColors = {
  active: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    badge: 'bg-success-100 text-success-800 border-success-200',
  },
  inactive: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    dot: 'bg-neutral-400',
    badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  },
  degraded: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
    badge: 'bg-warning-100 text-warning-800 border-warning-200',
  },
  slashed: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    dot: 'bg-error-500',
    badge: 'bg-error-100 text-error-800 border-error-200',
  },
} as const;

// Transaction status color mappings
export const transactionStatusColors = {
  pending: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    icon: 'text-warning-600',
    badge: 'bg-warning-100 text-warning-800 border-warning-200',
  },
  confirmed: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    icon: 'text-success-600',
    badge: 'bg-success-100 text-success-800 border-success-200',
  },
  failed: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    icon: 'text-error-600',
    badge: 'bg-error-100 text-error-800 border-error-200',
  },
  cancelled: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    icon: 'text-neutral-500',
    badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  },
} as const;

// Form validation colors
export const validationColors = {
  valid: {
    border: 'border-success-300',
    text: 'text-success-600',
    bg: 'bg-success-50',
  },
  invalid: {
    border: 'border-error-300',
    text: 'text-error-600',
    bg: 'bg-error-50',
  },
  neutral: {
    border: 'border-neutral-300',
    text: 'text-neutral-600',
    bg: 'bg-neutral-50',
  },
} as const;

// Wallet connection status colors
export const walletStatusColors = {
  connected: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    icon: 'text-success-600',
    button: 'bg-success-500 hover:bg-success-600 text-white',
  },
  disconnected: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    icon: 'text-neutral-500',
    button: 'bg-neutral-500 hover:bg-neutral-600 text-white',
  },
  connecting: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    icon: 'text-warning-600',
    button: 'bg-warning-500 hover:bg-warning-600 text-white',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    icon: 'text-error-600',
    button: 'bg-error-500 hover:bg-error-600 text-white',
  },
} as const;

// TypeScript types for type safety
export type SemanticColor = keyof typeof semanticColors;
export type StatusColor = keyof typeof statusColors;
export type OperatorStatus = keyof typeof operatorStatusColors;
export type TransactionStatus = keyof typeof transactionStatusColors;
export type ValidationState = keyof typeof validationColors;
export type WalletStatus = keyof typeof walletStatusColors;

// Utility function to get semantic color classes
export const getSemanticColors = (semantic: SemanticColor) => {
  return semanticColors[semantic];
};

// Utility function to get status color classes
export const getStatusColor = (status: StatusColor) => {
  return statusColors[status];
};

// Utility function to get operator status colors
export const getOperatorStatusColors = (status: OperatorStatus) => {
  return operatorStatusColors[status];
};

// Utility function to get transaction status colors
export const getTransactionStatusColors = (status: TransactionStatus) => {
  return transactionStatusColors[status];
};

// Utility function to get validation colors
export const getValidationColors = (state: ValidationState) => {
  return validationColors[state];
};

// Utility function to get wallet status colors
export const getWalletStatusColors = (status: WalletStatus) => {
  return walletStatusColors[status];
};
