import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

type RootStackParamList = {
  StockDetails: { symbol: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;

import { View, FlatList, StyleSheet, TextInput } from 'react-native';
import { fetchStockQuote, searchStocks } from '../../api/stocksApi';
import StockCard from './StockCard';
import Loading from '../common/Loading';

const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];

const StockList = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDefaultStocks();
  }, []);

  const loadDefaultStocks = async () => {
    try {
      const stockData = await Promise.all(
        defaultSymbols.map(symbol => fetchStockQuote(symbol))
      );
      setStocks(stockData);
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

  const handleStockPress = (symbol: string) => {
    navigation.navigate('StockDetails', { symbol });
  };

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
            onPress={() => handleStockPress(item.symbol)}
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