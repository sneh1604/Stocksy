export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  StockDetails: { 
    symbol: string; 
    initialPrice: number; 
    isIndianStock?: boolean;
    companyName: string;
  };
  Portfolio: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  SearchStock: undefined;
  Auth: undefined;
  TransactionHistory: undefined;
  News: undefined;
  IndianMarket: undefined;
  BSEStock: { 
    symbol: string; 
    initialPrice: number;
    companyName: string;
  };
  NSEStock: { 
    symbol: string; 
    initialPrice: number;
    companyName: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
