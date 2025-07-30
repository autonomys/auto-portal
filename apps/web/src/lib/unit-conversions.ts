import { parseTokenAmount, formatTokenAmount } from '@autonomys/auto-utils';

/**
 * Unit conversion utilities that wrap the official SDK functions
 * with more explicit naming and appropriate return types for our UI needs
 */

/**
 * Convert shannon (smallest unit) to AI3 tokens as a number
 * @param shannons - Balance in shannons as string or number
 * @returns Balance in AI3 as number (suitable for calculations and display)
 */
export const shannonsToAI3 = (shannons: string | number): number => {
  const shannonsStr = typeof shannons === 'string' ? shannons : shannons.toString();
  return Number(parseTokenAmount(shannonsStr));
};

/**
 * Convert AI3 tokens to shannons (smallest unit)
 * @param ai3 - Balance in AI3 as number or string
 * @returns Balance in shannons as string
 */
export const ai3ToShannons = (ai3: number | string): string => {
  const ai3Value = typeof ai3 === 'string' ? parseFloat(ai3) : ai3;
  return String(formatTokenAmount(ai3Value));
};

/**
 * Format AI3 amount with proper decimals for display
 * @param ai3Value - AI3 amount as number
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted string with specified decimals
 */
export const formatAI3Amount = (ai3Value: number, decimals: number = 4): string =>
  ai3Value.toFixed(decimals);
