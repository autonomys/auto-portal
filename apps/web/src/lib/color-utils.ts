/**
 * Color Utility Functions
 *
 * This file provides utility functions for working with semantic colors,
 * generating consistent color combinations, and applying colors safely
 * throughout the application.
 */

import { cn } from './cn';
import {
  type SemanticColor,
  type StatusColor,
  type OperatorStatus,
  type TransactionStatus,
  type ValidationState,
  type WalletStatus,
  getSemanticColors,
  getStatusColor,
  getOperatorStatusColors,
  getTransactionStatusColors,
  getValidationColors,
  getWalletStatusColors,
} from './design-tokens';

/**
 * Applies semantic color classes with optional additional classes
 */
export const applySemanticColors = (
  semantic: SemanticColor,
  variant: 'bg' | 'border' | 'text' | 'icon' | 'button' | 'subtle' = 'bg',
  additionalClasses?: string,
) => {
  const colors = getSemanticColors(semantic);
  return cn(colors[variant], additionalClasses);
};

/**
 * Applies status color with optional additional classes
 */
export const applyStatusColor = (status: StatusColor, additionalClasses?: string) => {
  const color = getStatusColor(status);
  return cn(color, additionalClasses);
};

/**
 * Applies operator status colors for different UI elements
 */
export const applyOperatorStatusColors = (
  status: OperatorStatus,
  variant: 'bg' | 'text' | 'dot' | 'badge' = 'text',
  additionalClasses?: string,
) => {
  const colors = getOperatorStatusColors(status);
  return cn(colors[variant], additionalClasses);
};

/**
 * Applies transaction status colors for different UI elements
 */
export const applyTransactionStatusColors = (
  status: TransactionStatus,
  variant: 'bg' | 'text' | 'icon' | 'badge' = 'text',
  additionalClasses?: string,
) => {
  const colors = getTransactionStatusColors(status);
  return cn(colors[variant], additionalClasses);
};

/**
 * Applies validation colors for form elements
 */
export const applyValidationColors = (
  state: ValidationState,
  variant: 'border' | 'text' | 'bg' = 'border',
  additionalClasses?: string,
) => {
  const colors = getValidationColors(state);
  return cn(colors[variant], additionalClasses);
};

/**
 * Applies wallet status colors for wallet-related UI elements
 */
export const applyWalletStatusColors = (
  status: WalletStatus,
  variant: 'bg' | 'text' | 'icon' | 'button' = 'text',
  additionalClasses?: string,
) => {
  const colors = getWalletStatusColors(status);
  return cn(colors[variant], additionalClasses);
};

/**
 * Creates alert/notification classes based on semantic type
 */
export const createAlertClasses = (semantic: SemanticColor, additionalClasses?: string) => {
  const colors = getSemanticColors(semantic);
  return cn(
    'px-4 py-3 rounded-md border',
    colors.bg,
    colors.border,
    colors.text,
    additionalClasses,
  );
};

/**
 * Creates badge classes based on status
 */
export const createStatusBadge = (
  status: OperatorStatus | TransactionStatus,
  size: 'sm' | 'md' | 'lg' = 'md',
  additionalClasses?: string,
) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const isOperatorStatus = ['active', 'inactive', 'degraded', 'slashed'].includes(status);
  const colors = isOperatorStatus
    ? getOperatorStatusColors(status as OperatorStatus)
    : getTransactionStatusColors(status as TransactionStatus);

  return cn(
    'inline-flex items-center rounded-full border font-medium',
    sizeClasses[size],
    colors.badge,
    additionalClasses,
  );
};

/**
 * Utility function to properly add hover prefix to background classes
 * Handles cases where bg classes might contain variants like 'dark:'
 */
const addHoverToClasses = (classes: string | null | undefined): string => {
  if (!classes) return '';
  
  return classes
    .split(' ')
    .filter(Boolean)
    .map(cls => {
      // Check if the class has existing modifiers (contains colon)
      const colonIndex = cls.lastIndexOf(':');
      if (colonIndex > 0) {
        // Insert hover: after the last modifier
        const modifiers = cls.substring(0, colonIndex + 1);
        const baseClass = cls.substring(colonIndex + 1);
        return `${modifiers}hover:${baseClass}`;
      }
      // No modifiers, just add hover: prefix
      return `hover:${cls}`;
    })
    .join(' ');
};

/**
 * Creates button classes with semantic colors
 */
export const createSemanticButton = (
  semantic: SemanticColor,
  variant: 'solid' | 'outline' | 'ghost' = 'solid',
  size: 'sm' | 'md' | 'lg' = 'md',
  additionalClasses?: string,
) => {
  const colors = getSemanticColors(semantic);
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    solid: colors.button,
    outline: `border ${colors.border} ${colors.text} bg-transparent ${addHoverToClasses(colors.bg)}`,
    ghost: `${colors.text} bg-transparent ${addHoverToClasses(colors.bg)}`,
  };

  return cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size],
    variantClasses[variant],
    additionalClasses,
  );
};

/**
 * Creates input field classes with validation state
 */
export const createValidatedInput = (
  state: ValidationState = 'neutral',
  additionalClasses?: string,
) => {
  const colors = getValidationColors(state);

  return cn(
    'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    colors.border,
    state !== 'neutral' && colors.bg,
    'focus-visible:ring-ring',
    additionalClasses,
  );
};

/**
 * Creates status indicator dot
 */
export const createStatusDot = (
  status: OperatorStatus,
  size: 'sm' | 'md' | 'lg' = 'md',
  additionalClasses?: string,
) => {
  const colors = getOperatorStatusColors(status);
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return cn('rounded-full', sizeClasses[size], colors.dot, additionalClasses);
};

/**
 * Utility to check if a semantic color is a "positive" state
 */
export const isPositiveSemanticColor = (semantic: SemanticColor): boolean => {
  return semantic === 'success' || semantic === 'info';
};

/**
 * Utility to check if a semantic color is a "negative" state
 */
export const isNegativeSemanticColor = (semantic: SemanticColor): boolean => {
  return semantic === 'error' || semantic === 'warning';
};

/**
 * Get the appropriate semantic color for a status
 */
export const statusToSemanticColor = (status: StatusColor): SemanticColor => {
  const statusMapping: Record<StatusColor, SemanticColor> = {
    active: 'success',
    inactive: 'info',
    degraded: 'warning',
    slashed: 'error',
    pending: 'warning',
  };
  return statusMapping[status];
};
