import { formatAutonomysAddress } from './utils';

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (value: string | number, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format AI3 currency values
 */
export const formatAI3 = (value: string | number, decimals: number = 2): string => {
  const formatted = formatNumber(value, decimals);
  return `${formatted} AI3`;
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with units (K, M, B)
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Format date relative to now
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

/**
 * Format timestamp to human readable
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Truncate address for display (using Autonomys format)
 */
export const truncateAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string => {
  const autonomysAddress = formatAutonomysAddress(address);

  if (autonomysAddress.length <= startLength + endLength) {
    return autonomysAddress;
  }

  return `${autonomysAddress.slice(0, startLength)}...${autonomysAddress.slice(-endLength)}`;
};

/**
 * Get color class for percentage values
 */
export const getPercentageColor = (
  value: number,
  positiveColor = 'text-green-600',
  negativeColor = 'text-red-600',
  neutralColor = 'text-gray-600',
): string => {
  if (value > 0) return positiveColor;
  if (value < 0) return negativeColor;
  return neutralColor;
};

/**
 * Format time ago from timestamp
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};
