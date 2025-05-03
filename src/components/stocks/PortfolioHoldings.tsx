import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography, spacing, shadows } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
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
      initialPrice: price,
      isIndianStock: false,
      companyName: symbol // Using symbol as company name fallback
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
          <Text style={[styles.symbol, { color: darkColors.text }]}>{item.symbol}</Text>
          <Text style={[
            styles.profitLoss,
            isProfit ? styles.profit : styles.loss
          ]}>
            {isProfit ? '+' : ''}{formatCurrency(item.profitLoss)}
          </Text>
        </View>
        
        <View style={[styles.holdingDetails, { backgroundColor: darkColors.card }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: darkColors.textSecondary }]}>Shares</Text>
            <Text style={[styles.detailValue, { color: darkColors.text }]}>{item.shares}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: darkColors.textSecondary }]}>Avg Price</Text>
            <Text style={[styles.detailValue, { color: darkColors.text }]}>{formatCurrency(item.averagePrice)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: darkColors.textSecondary }]}>Current</Text>
            <Text style={[styles.detailValue, { color: darkColors.text }]}>{formatCurrency(item.currentPrice)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: darkColors.textSecondary }]}>Value</Text>
            <Text style={[styles.detailValue, { color: darkColors.text }]}>{formatCurrency(item.totalValue)}</Text>
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
      <Ionicons name="briefcase-outline" size={48} color={darkColors.textSecondary} />
      <Text style={styles.emptyText}>No stocks in your portfolio</Text>
      <Text style={styles.emptySubtext}>Search for stocks to start investing</Text>
    </View>
  );
  
  return (
    <Card style={[styles.container, { backgroundColor: darkColors.surface }]}>
      <Text style={[styles.title, { color: darkColors.text }]}>Your Holdings</Text>
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
    marginVertical: 16,
  },
  title: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  holdingItem: {
    paddingVertical: 8,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  profitLoss: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  profit: {
    color: darkColors.profit,
  },
  loss: {
    color: darkColors.loss,
  },
  holdingDetails: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: typography.fontSizes.small,
  },
  detailValue: {
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as '500',
  },
  performanceBar: {
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  profitBar: {
    backgroundColor: darkColors.profit + '20',
  },
  lossBar: {
    backgroundColor: darkColors.loss + '20',
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
    backgroundColor: darkColors.border,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
    color: darkColors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.small,
    color: darkColors.textSecondary,
    marginTop: 8,
  },
});

export default PortfolioHoldings;
