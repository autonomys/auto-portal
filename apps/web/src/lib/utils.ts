import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { address } from '@autonomys/auto-utils';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an address to display in Autonomys format (SS58 prefix 6094)
 */
export const formatAutonomysAddress = (addr?: string): string => {
  if (!addr) return '';
  try {
    return address(addr);
  } catch (error) {
    console.warn('Failed to format address:', error);
    return addr; // Return original address if formatting fails
  }
};

export const shortenAddress = (addr?: string, length = 4) => {
  if (!addr) return '';
  const formattedAddr = formatAutonomysAddress(addr);
  return `${formattedAddr.slice(0, length + 2)}…${formattedAddr.slice(-length)}`;
};
