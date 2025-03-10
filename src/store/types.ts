export enum AuthActionTypes {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    LOGIN_ERROR = 'LOGIN_ERROR',
  }
  
  export enum StockActionTypes {
    BUY_STOCK = 'BUY_STOCK',
    SELL_STOCK = 'SELL_STOCK',
    UPDATE_PRICE = 'UPDATE_PRICE',
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