/**
 * Format a number with thousand separators
 */
export const formatNumber = (value: string | number, decimals: number = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
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
export const formatPercentage = (value: number, decimals: number = 1): string =>
  `${value.toFixed(decimals)}%`;

/**
 * Format large numbers with suffixes (K, M, B)
 */
export const formatCompactNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return formatNumber(num);
};

/**
 * Get color class for percentage values
 */
export const getPercentageColor = (
  percentage: number,
  thresholds: { good: number; warning: number },
) => {
  if (percentage >= thresholds.good) {
    return 'text-success-600';
  }
  if (percentage >= thresholds.warning) {
    return 'text-warning-600';
  }
  return 'text-destructive-600';
};

/**
 * Get color class for APY values
 */
export const getAPYColor = (apy: number) => getPercentageColor(apy, { good: 16, warning: 12 });

/**
 * Truncate address for display
 */
export const truncateAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string => {
  if (address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
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

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'Just now';
};
