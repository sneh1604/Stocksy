/**
 * USD to INR conversion rate (this would ideally come from an API)
 * Fixed at 83.30 for consistent conversion across the app
 */
export const USD_TO_INR_RATE = 83.30;

/**
 * Converts USD to INR using a fixed exchange rate
 * In a real app, this would fetch the current exchange rate from an API
 */
export const usdToInr = (usdAmount: number): number => {
  if (!usdAmount || isNaN(usdAmount)) return 0;
  
  // Use a fixed exchange rate for consistency
  const exchangeRate = USD_TO_INR_RATE;
  
  // Ensure precision to 2 decimal places
  return Math.round((usdAmount * exchangeRate) * 100) / 100;
};

/**
 * Converts INR to USD using a fixed exchange rate
 * In a real app, this would fetch the current exchange rate from an API
 */
export const inrToUsd = (inrAmount: number): number => {
  if (!inrAmount || isNaN(inrAmount)) return 0;
  
  const exchangeRate = USD_TO_INR_RATE;
  // Ensure precision to 2 decimal places
  return Math.round((inrAmount / exchangeRate) * 100) / 100;
};

/**
 * Format a number as Indian currency (₹)
 * @param amount Amount to format
 * @returns Formatted string with ₹ symbol
 */
export const formatIndianCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) return '₹0.00';
  
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
export const formatCompactIndianNumber = (num: number): string => {
  if (!num || isNaN(num)) return '₹0';
  
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return formatIndianCurrency(num);
};
