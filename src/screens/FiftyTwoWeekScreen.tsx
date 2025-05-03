import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { fetch52WeekHighLow } from '../api/indianStockApi';
import Card from '../components/common/Card';
import { colors, typography, spacing } from '../theme';
import Loading from '../components/common/Loading';
import { formatCurrency } from '../utils/helpers';

interface FiftyTwoWeekData {
  symbol: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  date: string;
}

const FiftyTwoWeekScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [highData, setHighData] = useState<FiftyTwoWeekData[]>([]);
  const [lowData, setLowData] = useState<FiftyTwoWeekData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetch52WeekHighLow();
      setHighData(data.fiftyTwoWeekHigh);
      setLowData(data.fiftyTwoWeekLow);
    } catch (error) {
      console.error('Error loading 52 week data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={[]} // Empty data as we're using ListHeaderComponent
        renderItem={() => null} // Add empty renderItem as it's required
        ListHeaderComponent={() => (
          <>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>52 Week Highs</Text>
              <FlatList
                data={highData}
                renderItem={({ item }) => (
                  <View style={styles.stockItem}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.price}>{formatCurrency(item.currentPrice)}</Text>
                  </View>
                )}
                keyExtractor={item => item.symbol}
                scrollEnabled={false}
              />
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>52 Week Lows</Text>
              <FlatList
                data={lowData}
                renderItem={({ item }) => (
                  <View style={styles.stockItem}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={[styles.price, styles.lowPrice]}>{formatCurrency(item.currentPrice)}</Text>
                  </View>
                )}
                keyExtractor={item => item.symbol}
                scrollEnabled={false}
              />
            </Card>
          </>
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
  section: {
    marginBottom: spacing.medium,
    padding: spacing.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.medium,
    color: colors.dark,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
    color: colors.dark,
  },
  price: {
    fontSize: typography.fontSizes.medium,
    color: colors.profit,
  },
  lowPrice: {
    color: colors.loss,
  }
});

export default FiftyTwoWeekScreen;
