import { AnyAction } from 'redux';
import { StockActionTypes } from '../types';
import { getUserPortfolio, updatePortfolioWithTransaction } from '../../services/firestore';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../reducers';

// Buy stock action with Firestore sync
export const buyStock = (
  stockId: string,
  quantity: number,
  price: number
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    // First dispatch the action to update Redux state
    dispatch({
      type: StockActionTypes.BUY_STOCK,
      payload: {
        stockId,
        quantity,
        price,
      },
    });
    
    // Get the updated portfolio and user ID
    const state = getState();
    const userId = state.auth.user?.uid;
    
    // If logged in, sync with Firestore directly
    // This is now handled by the saveTransaction function in firestore.ts
  };
};

// Sell stock action with Firestore sync
export const sellStock = (
  stockId: string,
  quantity: number,
  price: number
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    // First dispatch the action to update Redux state
    dispatch({
      type: StockActionTypes.SELL_STOCK,
      payload: {
        stockId,
        quantity,
        price,
      },
    });
    
    // Get the updated portfolio and user ID
    const state = getState();
    const userId = state.auth.user?.uid;
    
    // If logged in, sync with Firestore directly
    // This is now handled by the saveTransaction function in firestore.ts
  };
};

// Initialize portfolio from Firestore or local storage
export const initializeUserPortfolio = (
  userId: string
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    if (!userId) {
      console.warn('No userId provided to initializeUserPortfolio');
      return;
    }
    
    try {
      const portfolio = await getUserPortfolio(userId);
      
      if (portfolio) {
        dispatch({
          type: StockActionTypes.INITIALIZE_PORTFOLIO,
          payload: {
            balance: portfolio.balance || 1000000, // Default to 10 lakh INR
            holdings: portfolio.holdings || {}
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize portfolio:', error);
      // Initialize with default portfolio if all else fails
      dispatch({
        type: StockActionTypes.INITIALIZE_PORTFOLIO,
        payload: {
          balance: 1000000, // 10 lakh INR
          holdings: {}
        }
      });
    }
  };
};
