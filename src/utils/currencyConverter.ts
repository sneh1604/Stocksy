// USD to INR conversion rate (this would ideally come from an API)
const USD_TO_INR_RATE = 83.30;

/**
 * Convert USD to INR
 * @param usd Amount in USD
 * @returns Amount in INR
 */
export const usdToInr = (usd: number): number => {
  return usd * USD_TO_INR_RATE;
};

/**
 * Convert INR to USD
 * @param inr Amount in INR
 * @returns Amount in USD
 */
export const inrToUsd = (inr: number): number => {
  return inr / USD_TO_INR_RATE;
};

/**
 * Format a number as Indian currency (₹)
 * @param amount Amount to format
 * @returns Formatted string with ₹ symbol
 */
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number in Indian format with lakhs and crores
 * @param num Number to format
 * @returns Formatted string with Indian number format
 */
export const formatIndianNumber = (num: number): string => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return formatIndianCurrency(num);
};
