// AI3 token has 18 decimal places
const AI3_DECIMALS = 18;
const SHANNON_TO_AI3_DIVISOR = Math.pow(10, AI3_DECIMALS);

/**
 * Convert shannon (smallest unit) to AI3 tokens
 * @param shannons - Balance in shannons as string or number
 * @returns Balance in AI3 as number
 */
export const shannonsToAI3 = (shannons: string | number): number => {
  const shannonsStr = typeof shannons === 'string' ? shannons : shannons.toString();
  
  // Handle the conversion with proper precision
  const shannonsBigInt = BigInt(shannonsStr);
  const divisorBigInt = BigInt(SHANNON_TO_AI3_DIVISOR);
  
  // Get the integer part
  const integerPart = shannonsBigInt / divisorBigInt;
  
  // Get the fractional part for precision
  const remainder = shannonsBigInt % divisorBigInt;
  const fractionalPart = Number(remainder) / SHANNON_TO_AI3_DIVISOR;
  
  return Number(integerPart) + fractionalPart;
};

/**
 * Convert AI3 tokens to shannons (smallest unit)
 * @param ai3 - Balance in AI3 as number
 * @returns Balance in shannons as string
 */
export const ai3ToShannons = (ai3: number): string => {
  const shannons = ai3 * SHANNON_TO_AI3_DIVISOR;
  return Math.floor(shannons).toString();
};