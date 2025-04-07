import { formatIndianCurrency, formatIndianNumber } from './currencyConverter';

// Format number as currency (INR)
export const formatCurrency = (amount: number): string => {
  return formatIndianCurrency(amount);
};

// Calculate profit/loss
export const calculateProfitLoss = (
  currentPrice: number,
  averagePrice: number,
  shares: number
): number => {
  return (currentPrice - averagePrice) * shares;
};

// Export the Indian number format function
export { formatIndianNumber };

// Add other helper functions...

export const formatCompactNumber = (num: number): string => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)}K`;
  }
  return `₹${num.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};