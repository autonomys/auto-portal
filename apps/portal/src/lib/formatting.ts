/**
 * Format a number with thousand separators
 */
export const formatNumber = (value: string | number, decimals: number = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  const safeDecimals = Number.isFinite(decimals)
    ? Math.max(0, Math.min(20, Math.floor(decimals)))
    : 0;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  }).format(num);
};

/**
 * Format AI3 currency values
 */
export const formatAI3 = (value: string | number, decimals: number = 2): string => {
  const formatted = formatNumber(value, decimals);
  // Use non-breaking space between value and unit to prevent wrapping
  return `${formatted}\u00A0AI3`;
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value == null || isNaN(value)) return '0%';
  const safeDecimals = Number.isFinite(decimals)
    ? Math.max(0, Math.min(20, Math.floor(decimals)))
    : 1;
  return `${value.toFixed(safeDecimals)}%`;
};

/**
 * Format large numbers with suffixes (K, M, B)
 */
export const formatCompactNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }

  return formatNumber(num);
};

interface ApyColorOptions {
  onDark?: boolean;
}

/**
 * Get color class for APY values
 */
export const getAPYColor = (apy: number, options?: ApyColorOptions) => {
  const onDark = options?.onDark === true;
  // Use positive color scale as APY increases; avoid implying small positive APY is bad
  if (apy < 0) {
    return onDark ? 'text-error-400' : 'text-error-600';
  }
  // Neutral for small positive APY; adapt to dark backgrounds
  if (apy < 5) {
    return onDark ? 'text-white' : 'text-foreground';
  }
  if (apy < 10) {
    return onDark ? 'text-success-300' : 'text-success-500';
  }
  if (apy < 20) {
    return onDark ? 'text-success-400' : 'text-success-600';
  }
  return onDark ? 'text-success-500' : 'text-success-700';
};

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
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 'Just now';
  }

  const now = Date.now();
  const diff = now - timestamp;

  if (diff <= 0) {
    return 'Just now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }
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
