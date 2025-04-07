export enum AuthActionTypes {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    LOGIN_ERROR = 'LOGIN_ERROR',
  }
  
  export enum StockActionTypes {
    BUY_STOCK = 'BUY_STOCK',
    SELL_STOCK = 'SELL_STOCK',
    UPDATE_PRICE = 'UPDATE_PRICE',
    INITIALIZE_PORTFOLIO = 'INITIALIZE_PORTFOLIO',
  }
  
  export interface Stock {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }
  
  export interface Portfolio {
    holdings: {
      [symbol: string]: {
        shares: number;
        averagePrice: number;
      };
    };
    balance: number;
  }

  export interface RootState {
    auth: {
        user: {
            uid: string | null;
            email: string | null;
            displayName: string | null;
        } | null;
    };
}

export interface StockTransaction {
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

import { Action } from 'redux';

// Define action interfaces that extend Redux's Action interface
export interface LoginAction extends Action<AuthActionTypes.LOGIN> {
  type: AuthActionTypes.LOGIN;
  payload: any;
  [key: string]: any; // Add string index signature
}

export interface LogoutAction extends Action<AuthActionTypes.LOGOUT> {
  type: AuthActionTypes.LOGOUT;
  [key: string]: any; // Add string index signature
}

export interface LoginErrorAction extends Action<AuthActionTypes.LOGIN_ERROR> {
  type: AuthActionTypes.LOGIN_ERROR;
  payload: string;
  [key: string]: any; // Add string index signature
}

export interface BuyStockAction extends Action<StockActionTypes.BUY_STOCK> {
  type: StockActionTypes.BUY_STOCK;
  payload: {
    stockId: string;
    quantity: number;
    price: number;
  };
  [key: string]: any; // Add string index signature
}

export interface SellStockAction extends Action<StockActionTypes.SELL_STOCK> {
  type: StockActionTypes.SELL_STOCK;
  payload: {
    stockId: string;
    quantity: number;
    price: number;
  };
  [key: string]: any; // Add string index signature
}

export interface UpdatePriceAction extends Action<StockActionTypes.UPDATE_PRICE> {
  type: StockActionTypes.UPDATE_PRICE;
  payload: {
    stockId: string;
    price: number;
  };
  [key: string]: any; // Add string index signature
}

export interface InitializePortfolioAction extends Action<StockActionTypes.INITIALIZE_PORTFOLIO> {
  type: StockActionTypes.INITIALIZE_PORTFOLIO;
  payload: {
    balance: number;
    holdings: {
      [symbol: string]: {
        shares: number;
        averagePrice: number;
      }
    };
  };
  [key: string]: any; // Add string index signature
}

// Define union types for actions
export type AuthAction = LoginAction | LogoutAction | LoginErrorAction;
export type StockAction = BuyStockAction | SellStockAction | UpdatePriceAction | InitializePortfolioAction;
export type AppAction = AuthAction | StockAction;