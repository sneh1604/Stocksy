import { StockActionTypes } from '../types';

interface PortfolioState {
  holdings: {
    [key: string]: {
      shares: number;
      averagePrice: number;
    };
  };
  balance: number;
}

const initialState: PortfolioState = {
  holdings: {},
  balance: 100000, // Starting with $100,000
};

const portfolioReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case StockActionTypes.BUY_STOCK:
      const { stockId, quantity, price } = action.payload;
      const totalCost = quantity * price;
      
      if (state.balance < totalCost) {
        return state; // Not enough balance
      }

      return {
        ...state,
        balance: state.balance - totalCost,
        holdings: {
          ...state.holdings,
          [stockId]: {
            shares: (state.holdings[stockId]?.shares || 0) + quantity,
            averagePrice: calculateNewAveragePrice(
              state.holdings[stockId]?.shares || 0,
              state.holdings[stockId]?.averagePrice || 0,
              quantity,
              price
            ),
          },
        },
      };

    case StockActionTypes.SELL_STOCK:
      const { stockId: sellStockId, quantity: sellQuantity, price: sellPrice } = action.payload;
      const holding = state.holdings[sellStockId];

      if (!holding || holding.shares < sellQuantity) {
        return state; // Not enough shares
      }

      const newHoldings = { ...state.holdings };
      if (holding.shares === sellQuantity) {
        delete newHoldings[sellStockId];
      } else {
        newHoldings[sellStockId] = {
          ...holding,
          shares: holding.shares - sellQuantity,
        };
      }

      return {
        ...state,
        balance: state.balance + (sellQuantity * sellPrice),
        holdings: newHoldings,
      };

    case StockActionTypes.INITIALIZE_PORTFOLIO:
      return {
        ...state,
        balance: action.payload.balance,
        holdings: action.payload.holdings || {}
      };

    default:
      return state;
  }
};

const calculateNewAveragePrice = (
  currentShares: number,
  currentAvgPrice: number,
  newShares: number,
  newPrice: number
) => {
  const totalShares = currentShares + newShares;
  const totalCost = (currentShares * currentAvgPrice) + (newShares * newPrice);
  return totalCost / totalShares;
};

export default portfolioReducer;