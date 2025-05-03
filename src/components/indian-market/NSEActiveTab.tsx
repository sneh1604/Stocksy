import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
import Card from '../common/Card';

const API_KEY = 'sk-live-q68c6TzuJtAuMbtSYL6ykLvXcYyBK2YoCt5qDefy';
const BASE_URL = 'https://stock.indianapi.in';

interface NSEStock {
  ticker: string;
  company: string;
  price: number;
  percent_change: number;
  net_change: number;
  volume: number;
  overall_rating: string;
}

const NSEActiveTab = () => {
  const [stocks, setStocks] = useState<NSEStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const fetchNSEStocks = async () => {
    try {
      console.log('Fetching NSE stocks...');
      const response = await fetch(`${BASE_URL}/NSE_most_active`, {
        headers: { 'X-Api-Key': API_KEY }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch NSE stocks');
      }

      const responseText = await response.text();
      console.log('NSE Response:', responseText);

      const data = JSON.parse(responseText);
      setStocks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('NSE fetch error:', err);
      setError('Failed to load NSE stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNSEStocks();
  }, []);

  const handleStockPress = (stock: NSEStock) => {
    navigation.navigate('StockDetails', {
      symbol: stock.ticker,
      initialPrice: stock.price,
      isIndianStock: true,
      companyName: stock.company
    });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: darkColors.background }]}>
        <ActivityIndicator size="large" color={darkColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: darkColors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={darkColors.loss} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNSEStocks}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                  <Text style={[styles.price, { color: darkColors.text }]}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                  <View
                    style={[
                      styles.changeContainer,
                      item.net_change >= 0 ? styles.positiveChange : styles.negativeChange,
                    ]}
                  >
                    <Ionicons
                      name={item.net_change >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={item.net_change >= 0 ? darkColors.profit : darkColors.loss}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        item.net_change >= 0 ? { color: darkColors.profit } : { color: darkColors.loss },
                      ]}
                    >
                      {item.net_change.toFixed(2)} ({item.percent_change.toFixed(2)}%)
                    </Text>
                  </View>
                  <Text style={[styles.volume, { color: darkColors.textSecondary }]}>
                    Vol: {parseInt(String(item.volume)).toLocaleString()}
                  </Text>
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
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  symbol: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  positiveChange: {
    backgroundColor: darkColors.profit + '20',
  },
  negativeChange: {
    backgroundColor: darkColors.loss + '20',
  },
  changeText: {
    fontSize: typography.fontSizes.small,
    marginLeft: 4,
  },
  volume: {
    fontSize: typography.fontSizes.tiny,
    color: colors.gray,
    marginTop: spacing.tiny,
  },
  errorText: {
    marginTop: spacing.medium,
    fontSize: typography.fontSizes.medium,
    color: darkColors.loss,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    backgroundColor: darkColors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: darkColors.text,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  },
});

export default NSEActiveTab;
