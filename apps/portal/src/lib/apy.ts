// APY calculation utilities

export interface PricePoint {
  price: number;
  date: Date;
}
export interface ReturnDetails {
  periodReturn: number; // simple return over the window
  annualizedReturn: number; // CAGR based on start/end dates
  startDate: Date;
  endDate: Date;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateReturnDetails = (
  startPrice: PricePoint,
  endPrice: PricePoint,
): ReturnDetails | null => {
  const startValue = startPrice?.price;
  const endValue = endPrice?.price;
  const startDate = startPrice?.date;
  const endDate = endPrice?.date;

  if (!startValue || !endValue || !startDate || !endDate) return null;
  if (startValue <= 0 || endValue <= 0) return null;

  const daysDiff = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
  if (daysDiff <= 0) return null;

  const growth = endValue / startValue;
  const periodReturn = growth - 1;
  const annualizedReturn = Math.pow(growth, 365 / daysDiff) - 1;

  return {
    periodReturn,
    annualizedReturn,
    startDate,
    endDate,
  };
};

// Adjust returns to account for portion of capital that is actually staked
import { STAKE_RATIO } from '@/constants/staking';

export const adjustReturnDetailsForStakeRatio = (
  details: ReturnDetails,
  stakeRatio: number = STAKE_RATIO,
): ReturnDetails => ({
  ...details,
  periodReturn: details.periodReturn * stakeRatio,
  annualizedReturn: details.annualizedReturn * stakeRatio,
});

export type ReturnWindowsKeys = 'd1' | 'd3' | 'd7' | 'd30';

export const adjustReturnDetailsWindowsForStakeRatio = (
  windows: Partial<Record<ReturnWindowsKeys, ReturnDetails>>,
  stakeRatio: number = STAKE_RATIO,
) => {
  const adjusted: Partial<Record<ReturnWindowsKeys, ReturnDetails>> = {};
  (['d1', 'd3', 'd7', 'd30'] as ReturnWindowsKeys[]).forEach(key => {
    const v = windows[key];
    if (v) adjusted[key] = adjustReturnDetailsForStakeRatio(v, stakeRatio);
  });
  return adjusted;
};
