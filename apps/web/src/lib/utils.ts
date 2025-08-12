export { cn } from './cn';

export const shortenAddress = (addr?: string, length = 4) => {
  if (!addr) return '';
  return `${addr.slice(0, length + 2)}…${addr.slice(-length)}`;
};

// Typography utilities
export { typography, getTypographyClasses, type TypographyVariant } from './typography';

// Spacing utilities
export { spacing, getSpacingClasses, type SpacingSize } from './spacing';

// Layout utilities
export { layout, getLayoutClasses } from './layout';

// Re-export semantic color utilities for convenience
export {
  // Types
  type SemanticColor,
  type StatusColor,
  type OperatorStatus,
  type TransactionStatus,
  type ValidationState,
  type WalletStatus,

  // Constants
  semanticColors,
  statusColors,
  operatorStatusColors,
  transactionStatusColors,
  validationColors,
  walletStatusColors,

  // Utility functions
  getSemanticColors,
  getStatusColor,
  getOperatorStatusColors,
  getTransactionStatusColors,
  getValidationColors,
  getWalletStatusColors,
} from './design-tokens';

export {
  // Color application utilities
  applySemanticColors,
  applyStatusColor,
  applyOperatorStatusColors,
  applyTransactionStatusColors,
  applyValidationColors,
  applyWalletStatusColors,

  // Component creation utilities
  createAlertClasses,
  createStatusBadge,
  createSemanticButton,
  createValidatedInput,
  createStatusDot,

  // Helper utilities
  isPositiveSemanticColor,
  isNegativeSemanticColor,
  statusToSemanticColor,
} from './color-utils';

// Network helpers
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'brand';

export const getNetworkBadge = (networkId: string): { label: string; variant: BadgeVariant } => {
  const label = networkId.toUpperCase();
  const variant =
    networkId === 'mainnet'
      ? 'brand'
      : networkId === 'chronos'
        ? 'warning'
        : networkId === 'taurus'
          ? 'warning'
          : 'secondary';
  return { label, variant };
};

export const isMainnet = (networkId: string) => networkId === 'mainnet';
