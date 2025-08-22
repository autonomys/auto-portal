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

// Calculate APY from two points (CAGR). Returns null on invalid inputs.
export const calculateApy = (startPrice: PricePoint, endPrice: PricePoint): number | null => {
  const startValue = startPrice?.price;
  const endValue = endPrice?.price;
  const startDate = startPrice?.date;
  const endDate = endPrice?.date;

  if (!startValue || !endValue || !startDate || !endDate) return null;
  if (startValue <= 0 || endValue <= 0) return null;

  const daysDiff = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
  if (daysDiff <= 0) return null;

  const growth = endValue / startValue;
  const annualized = Math.pow(growth, 365 / daysDiff) - 1;
  return annualized;
};

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
