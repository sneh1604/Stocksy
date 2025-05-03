import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
import Card from '../common/Card';

const API_KEY = 'sk-live-q68c6TzuJtAuMbtSYL6ykLvXcYyBK2YoCt5qDefy';
const BASE_URL = 'https://stock.indianapi.in';

interface BSEStock {
  ticker: string;
  company: string;
  price: number;
  percent_change: number;
  net_change: number;
  volume: number;
  overall_rating: string;
}

const BSEActiveTab = () => {
  const [stocks, setStocks] = useState<BSEStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const fetchBSEStocks = async () => {
    try {
      console.log('Fetching BSE stocks...');
      const response = await fetch(`${BASE_URL}/BSE_most_active`, {
        headers: { 'X-Api-Key': API_KEY }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BSE stocks');
      }

      const responseText = await response.text();
      console.log('BSE Response:', responseText);

      const data = JSON.parse(responseText);
      setStocks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('BSE fetch error:', err);
      setError('Failed to load BSE stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBSEStocks();
  }, []);

  const handleStockPress = (stock: BSEStock) => {
    navigation.navigate('StockDetails', {
      symbol: stock.ticker,
      initialPrice: stock.price,
      isIndianStock: true,
      companyName: stock.company
    });
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: darkColors.background }]}>
      <FlatList
        data={stocks}
        keyExtractor={item => item.ticker}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleStockPress(item)}>
            <Card style={[styles.card, { backgroundColor: darkColors.surface }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.companyName, { color: darkColors.text }]}>{item.company}</Text>
                  <Text style={[styles.symbol, { color: darkColors.textSecondary }]}>{item.ticker}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, { color: darkColors.text }]}>₹{item.price.toFixed(2)}</Text>
                  <View style={[
                    styles.changeContainer,
                    item.net_change >= 0 ? styles.positiveChange : styles.negativeChange,
                    { backgroundColor: darkColors.card }
                  ]}>
                    <Ionicons 
                      name={item.net_change >= 0 ? "trending-up" : "trending-down"} 
                      size={16} 
                      color={item.net_change >= 0 ? darkColors.profit : darkColors.loss} 
                    />
                    <Text style={[styles.changeText, item.net_change >= 0 ? styles.positiveText : styles.negativeText]}>
                      {item.net_change.toFixed(2)} ({item.percent_change.toFixed(2)}%)
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.small,
  },
  card: {
    marginBottom: spacing.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: 'bold',
  },
  symbol: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.fontSizes.medium,
    fontWeight: 'bold',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.tiny,
  },
  changeText: {
    fontSize: typography.fontSizes.small,
    marginLeft: spacing.tiny,
  },
  positiveChange: {
    backgroundColor: darkColors.profit + '20',
  },
  negativeChange: {
    backgroundColor: darkColors.loss + '20',
  },
  positiveText: {
    color: darkColors.profit,
  },
  negativeText: {
    color: darkColors.loss,
  },
  volume: {
    fontSize: typography.fontSizes.tiny,
    color: colors.gray,
    marginTop: spacing.tiny,
  }
});

export default BSEActiveTab;
