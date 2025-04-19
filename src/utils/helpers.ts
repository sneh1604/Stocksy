/**
 * Format a number as Indian Rupee currency
 * Ensures proper formatting for Indian users
 * @param value The number to format as currency
 */
export const formatCurrency = (value: number): string => {
  // Format with ₹ symbol, commas for thousands and 2 decimal places
  return `₹${formatIndianNumber(value)}`;
};

/**
 * Format a number using Indian number format with commas
 * Example: 1,00,000.00 instead of 100,000.00
 * @param value The number to format
 */
export const formatIndianNumber = (value: number): string => {
  const numStr = Math.abs(value).toFixed(2);
  const parts = numStr.split('.');
  const integerPart = parts[0];
  
  // Format according to Indian system (lakhs, crores)
  let formattedInteger = '';
  if (integerPart.length > 3) {
    formattedInteger = ',' + integerPart.substring(integerPart.length - 3);
    let remaining = integerPart.substring(0, integerPart.length - 3);
    
    // Add commas after every 2 digits for the remaining part
    while (remaining.length > 0) {
      const segment = remaining.length >= 2 ? remaining.substring(remaining.length - 2) : remaining;
      formattedInteger = ',' + segment + formattedInteger;
      remaining = remaining.substring(0, remaining.length - 2);
    }
    
    // Remove leading comma if present
    formattedInteger = formattedInteger.startsWith(',') ? formattedInteger.substring(1) : formattedInteger;
  } else {
    formattedInteger = integerPart;
  }
  
  return (value < 0 ? '-' : '') + formattedInteger + '.' + parts[1];
};

/**
 * Calculate profit/loss for a stock position with proper error handling
 */
export const calculateProfitLoss = (
  currentPrice: number,
  averagePrice: number,
  shares: number
): number => {
  // Handle edge cases
  if (!currentPrice || !averagePrice || !shares || averagePrice <= 0 || shares <= 0) {
    return 0;
  }
  
  // Calculate and round to 2 decimal places for consistency
  return parseFloat(((currentPrice - averagePrice) * shares).toFixed(2));
};

/**
 * Calculate percentage change with proper error handling
 */
export const calculatePercentageChange = (
  currentValue: number,
  previousValue: number
): number => {
  // Handle division by zero and other edge cases
  if (!previousValue || previousValue === 0 || !currentValue) {
    return 0;
  }
  
  return parseFloat((((currentValue - previousValue) / Math.abs(previousValue)) * 100).toFixed(2));
};

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