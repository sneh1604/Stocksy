import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography, spacing, shadows } from '../../theme';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;

interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
}

interface PortfolioHoldingsProps {
  holdings: Holding[];
}

const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ holdings }) => {
  const navigation = useNavigation<NavigationProp>();
  
  const handleHoldingPress = (symbol: string, price: number) => {
    navigation.navigate('StockDetails', {
      symbol,
      initialPrice: price
    });
  };

  const renderHoldingItem = ({ item }: { item: Holding }) => {
    const isProfit = item.profitLoss >= 0;
    const profitLossPercentage = ((item.currentPrice - item.averagePrice) / item.averagePrice) * 100;

    return (
      <TouchableOpacity
        style={styles.holdingItem}
        onPress={() => handleHoldingPress(item.symbol, item.currentPrice)}
      >
        <View style={styles.holdingHeader}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={[
            styles.profitLoss,
            isProfit ? styles.profit : styles.loss
          ]}>
            {isProfit ? '+' : ''}{formatCurrency(item.profitLoss)}
          </Text>
        </View>
        
        <View style={styles.holdingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shares</Text>
            <Text style={styles.detailValue}>{item.shares}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Avg Price</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.averagePrice)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.currentPrice)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Value</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.totalValue)}</Text>
          </View>
        </View>
        
        <View style={[
          styles.performanceBar,
          isProfit ? styles.profitBar : styles.lossBar
        ]}>
          <View style={styles.percentView}>
            <Ionicons
              name={isProfit ? 'trending-up' : 'trending-down'}
              size={16}
              color={colors.white}
            />
            <Text style={styles.performanceText}>
              {isProfit ? '+' : ''}{profitLossPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={48} color={colors.gray} />
      <Text style={styles.emptyText}>No stocks in your portfolio</Text>
      <Text style={styles.emptySubtext}>Search for stocks to start investing</Text>
    </View>
  );
  
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Your Holdings</Text>
      {holdings.length > 0 ? (
        <FlatList
          data={holdings}
          renderItem={renderHoldingItem}
          keyExtractor={item => item.symbol}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        renderEmptyState()
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.medium,
  },
  title: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
    marginBottom: spacing.medium,
  },
  holdingItem: {
    paddingVertical: spacing.small,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  profitLoss: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  profit: {
    color: colors.profit,
  },
  loss: {
    color: colors.loss,
  },
  holdingDetails: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: spacing.small,
    marginBottom: spacing.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
  },
  detailValue: {
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as '500',
    color: colors.dark,
  },
  performanceBar: {
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: spacing.medium,
  },
  profitBar: {
    backgroundColor: colors.profit,
  },
  lossBar: {
    backgroundColor: colors.loss,
  },
  percentView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceText: {
    color: colors.white,
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginLeft: spacing.small,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.small,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xlarge,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
    color: colors.dark,
    marginTop: spacing.medium,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    marginTop: spacing.small,
  },
});

export default PortfolioHoldings;
