export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  StockDetails: { symbol: string; initialPrice: number };
  Portfolio: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  SearchStock: undefined;
  Auth: undefined;
  TransactionHistory: undefined;
  News: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
