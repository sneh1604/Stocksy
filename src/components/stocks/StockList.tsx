import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchStockQuote, searchStocks, fetchDefaultStocks } from '../../api/stocksApi';
import StockCard from './StockCard';
import Loading from '../common/Loading';
import { RootStackParamList } from '../../navigation/types';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  name?: string;
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

  // Load default stocks on component mount
  useEffect(() => {
    loadDefaultStocks();
  }, []);

  const loadDefaultStocks = async () => {
    try {
      setLoading(true);
      // Use the fetchDefaultStocks function from stocksApi
      const stocksData = await fetchDefaultStocks();
      setStocks(stocksData as StockData[]);
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
            results.slice(0, 5).map(async (result: { symbol: string; }) => {
              try {
                const quote = await fetchStockQuote(result.symbol);
                return {
                  symbol: result.symbol,
                  price: quote.price,
                  change: quote.change,
                  changePercent: quote.changePercent
                };
              } catch (error) {
                console.error(`Error fetching quote for ${result.symbol}:`, error);
                return null;
              }
            })
          );
          setStocks(stockData.filter(Boolean) as StockData[]); // Filter out any null/undefined values
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

  // Implement a simple periodic refresh (every 30 seconds)
  useEffect(() => {
    if (stocks.length > 0) {
      const intervalId = setInterval(async () => {
        try {
          const updatedStocks = await Promise.all(
            stocks.map(async (stock) => {
              try {
                const quote = await fetchStockQuote(stock.symbol);
                return {
                  ...stock,
                  price: quote.price || stock.price,
                  change: quote.change || stock.change,
                  changePercent: quote.changePercent || stock.changePercent
                };
              } catch {
                return stock; // Keep existing data if fetch fails
              }
            })
          );
          setStocks(updatedStocks);
        } catch (error) {
          console.error('Error updating stock prices:', error);
        }
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(intervalId);
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
            key={item.symbol} // Add a key prop here for additional safety
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