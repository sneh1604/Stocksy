import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchStockQuote, searchStocks, startRealtimeUpdates } from '../../api/stocksApi';
import StockCard from './StockCard';
import Loading from '../common/Loading';
import { RootStackParamList } from '../../navigation/types';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;

const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];

interface StockListProps {
  onStockPress?: (symbol: string, price: number) => void;
}

const StockList: React.FC<StockListProps> = ({ onStockPress }) => {
  const navigation = useNavigation<NavigationProp>();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDefaultStocks();
  }, []);

  const loadDefaultStocks = async () => {
    try {
      setLoading(true);
      const stockData = await Promise.all(
        defaultSymbols.map(async (symbol) => {
          try {
            const data = await fetchStockQuote(symbol);
            return data;
          } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
          }
        })
      );
      setStocks(stockData.filter(Boolean) as StockData[]);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await searchStocks(query);
        // Check if results exist and is an array
        if (results && Array.isArray(results)) {
          const stockData = await Promise.all(
            results.slice(0, 5).map((result: { symbol: string; }) => fetchStockQuote(result.symbol))
          );
          setStocks(stockData.filter(Boolean)); // Filter out any null/undefined values
        } else {
          setStocks([]); // Set empty array if no results
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        setStocks([]); // Set empty array on error
      }
    } else if (query.length === 0) {
      loadDefaultStocks();
    }
  };

  const handleStockPress = (symbol: string, price: number) => {
    if (onStockPress) {
      onStockPress(symbol, price);
    } else {
      navigation.navigate('StockDetails', { 
        symbol,
        initialPrice: price 
      });
    }
  };

  // Implement real-time price updates
  useEffect(() => {
    if (stocks.length > 0) {
      const symbols = stocks.map(stock => stock.symbol);
      const cleanup = startRealtimeUpdates(symbols, (data) => {
        if (data.data) {
          const trade = data.data[0];
          setStocks(prevStocks => 
            prevStocks.map(stock => 
              stock.symbol === data.symbol
                ? {
                    ...stock,
                    price: trade.p,
                    change: trade.p - stock.price,
                    changePercent: ((trade.p - stock.price) / stock.price) * 100
                  }
                : stock
            )
          );
        }
      });

      return cleanup;
    }
  }, [stocks.map(s => s.symbol).join(',')]);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search stocks..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <StockCard 
            stock={item} 
            onPress={() => handleStockPress(item.symbol, item.price)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});

export default StockList;