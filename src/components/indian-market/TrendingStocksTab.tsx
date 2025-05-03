import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { fetchTrendingStocks } from '../../api/indianStockApi';
import StockCard from '../stocks/StockCard';
import Loading from '../common/Loading';
import { colors, spacing } from '../../theme';
import { useNavigation } from '@react-navigation/native';

interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const TrendingStocksTab = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadTrendingStocks();
  }, []);

  const loadTrendingStocks = async () => {
    try {
      setLoading(true);
      const data = await fetchTrendingStocks();
      setStocks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading trending stocks:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (symbol: string, price: number) => {
    navigation.navigate('StockDetails', {
      symbol,
      initialPrice: price,
      isIndianStock: true,
      companyName: stocks.find(s => s.symbol === symbol)?.companyName || ''
    });
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={({ item }) => (
          <StockCard
            stock={item}
            onPress={() => handleStockPress(item.symbol, item.price)}
          />
        )}
        keyExtractor={item => item.symbol}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.medium,
  },
});

export default TrendingStocksTab;
