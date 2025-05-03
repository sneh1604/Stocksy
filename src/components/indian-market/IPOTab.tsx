import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { fetchIPOData } from '../../api/indianStockApi';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/helpers';

interface IPOData {
  symbol: string;
  companyName: string;
  issuePrice: number;
  lotSize: number;
  openDate: string;
  closeDate: string;
}

const IPOTab = () => {
  const [ipoData, setIpoData] = useState<IPOData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIPOData();
  }, []);

  const loadIPOData = async () => {
    try {
      const data = await fetchIPOData();
      setIpoData(data);
    } catch (error) {
      console.error('Error loading IPO data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={ipoData}
        renderItem={({ item }) => (
          <Card style={styles.ipoCard}>
            <Text style={styles.companyName}>{item.companyName}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Issue Price:</Text>
              <Text style={styles.value}>{formatCurrency(item.issuePrice)}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Lot Size:</Text>
              <Text style={styles.value}>{item.lotSize}</Text>
            </View>
            <View style={styles.dates}>
              <Text style={styles.dateText}>Opens: {item.openDate}</Text>
              <Text style={styles.dateText}>Closes: {item.closeDate}</Text>
            </View>
          </Card>
        )}
        keyExtractor={item => item.symbol}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.medium,
  },
  ipoCard: {
    marginBottom: spacing.medium,
    padding: spacing.medium,
  },
  companyName: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.small,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.tiny,
  },
  label: {
    color: colors.gray,
  },
  value: {
    fontWeight: typography.fontWeights.medium as '500',
  },
  dates: {
    marginTop: spacing.small,
    paddingTop: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    color: colors.gray,
    fontSize: typography.fontSizes.small,
  },
});

export default IPOTab;
