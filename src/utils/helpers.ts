export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  export const calculateProfitLoss = (
    currentPrice: number,
    averagePrice: number,
    shares: number
  ): number => {
    return (currentPrice - averagePrice) * shares;
  };
  
  export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };