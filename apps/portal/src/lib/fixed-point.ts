export const FIXED_1E18 = 1000000000000000000n;

export const multiplySharesBySharePrice = (sharesStr: string, sharePriceStr: string): string => {
  try {
    // Treat both shares and share_price as fixed-point integers scaled by 1e18
    const shares = BigInt(sharesStr);
    const price = BigInt(sharePriceStr);
    const amount = (shares * price) / FIXED_1E18;
    return amount.toString();
  } catch {
    return '0';
  }
};
