import { Dispatch } from 'redux';
import { AuthActionTypes, StockActionTypes } from '../types';

// Define action interfaces
interface LoginAction {
    type: AuthActionTypes.LOGIN;
    payload: any;
}

interface LogoutAction {
    type: AuthActionTypes.LOGOUT;
}

interface BuyStockAction {
    type: StockActionTypes.BUY_STOCK;
    payload: {
        stockId: string;
        quantity: number;
        price: number;
    };
}

interface SellStockAction {
    type: StockActionTypes.SELL_STOCK;
    payload: {
        stockId: string;
        quantity: number;
        price: number;
    };
}

export type StockActions = BuyStockAction | SellStockAction;
export type AuthActions = LoginAction | LogoutAction;
export type AppActions = StockActions | AuthActions;

// Action creators for authentication
export const loginUser = (userData: any): AppActions => ({
    type: AuthActionTypes.LOGIN,
    payload: userData,
});

export const logoutUser = (): AppActions => ({
    type: AuthActionTypes.LOGOUT,
});

// Action creators for stock transactions
export const buyStock = (
    stockId: string,
    quantity: number,
    price: number
): AppActions => ({
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
): AppActions => ({
    type: StockActionTypes.SELL_STOCK,
    payload: {
        stockId,
        quantity,
        price,
    },
});