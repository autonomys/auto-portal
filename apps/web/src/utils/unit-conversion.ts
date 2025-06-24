/**
 * Unit conversion utilities for Auto SDK integration
 * Shannon is the smallest unit (10^-18 AI3)
 */

export const ai3ToShannon = (ai3Amount: number): string => {
  return (ai3Amount * Math.pow(10, 18)).toString();
};

export const shannonToAi3 = (shannonAmount: string): number => {
  return parseInt(shannonAmount) / Math.pow(10, 18);
};

export const formatAi3 = (shannonAmount: string, decimals: number = 4): string => {
  return shannonToAi3(shannonAmount).toFixed(decimals);
};

export const formatAi3Number = (ai3Amount: number, decimals: number = 4): string => {
  return ai3Amount.toFixed(decimals);
};

export const parseAi3 = (ai3String: string): number => {
  return parseFloat(ai3String);
};
