import { AnyAction } from 'redux'; // Import AnyAction
import { AuthActionTypes, StockActionTypes } from '../types';

// Action creators for authentication
export const loginUser = (userData: any): AnyAction => ({
  type: AuthActionTypes.LOGIN,
  payload: userData,
});

export const logoutUser = (): AnyAction => ({
  type: AuthActionTypes.LOGOUT,
});

export const loginError = (error: string): AnyAction => ({
  type: AuthActionTypes.LOGIN_ERROR,
  payload: error,
});

// Action creators for stock transactions
export const buyStock = (
  stockId: string,
  quantity: number,
  price: number
): AnyAction => ({
  type: StockActionTypes.BUY_STOCK,
  payload: {
    stockId,
    quantity,
    price,
  },
});

export const sellStock = (
  stockId: string,
  quantity: number,
  price: number
): AnyAction => ({
  type: StockActionTypes.SELL_STOCK,
  payload: {
    stockId,
    quantity,
    price,
  },
});

export const updatePrice = (
  stockId: string,
  price: number
): AnyAction => ({
  type: StockActionTypes.UPDATE_PRICE,
  payload: {
    stockId,
    price,
  },
});