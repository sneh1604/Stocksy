import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/helpers';

interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date | string;
}

interface PortfolioTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

const PortfolioTransactions: React.FC<PortfolioTransactionsProps> = ({ transactions, limit = 5 }) => {
  // Take only the most recent transactions up to the limit
  const recentTransactions = transactions
    .slice()
    .sort((a, b) => {
      const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
      const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
  
  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, { color: darkColors.text }]}>{item.symbol}</Text>
          <View style={[
            styles.typeTag,
            item.type === 'buy' ? 
              { backgroundColor: darkColors.profit + '20' } : 
              { backgroundColor: darkColors.loss + '20' }
          ]}>
            <Text style={[styles.typeText, { color: darkColors.text }]}>{item.type === 'buy' ? 'BUY' : 'SELL'}</Text>
          </View>
        </View>
        <Text style={[styles.date, { color: darkColors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleDateString('en-IN')}
        </Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={[styles.quantity, { color: darkColors.text }]}>
          {item.quantity} shares @ {formatCurrency(item.price)}
        </Text>
        <Text style={[
          styles.total,
          item.type === 'buy' ? styles.expense : styles.income,
          { color: item.type === 'buy' ? darkColors.loss : darkColors.profit }
        ]}>
          {item.type === 'buy' ? '-' : '+'}{formatCurrency(item.total)}
        </Text>
      </View>
    </View>
  );
  
  if (transactions.length === 0) {
    return (
      <Card style={[styles.emptyContainer, { backgroundColor: darkColors.surface }]}>
        <Ionicons name="receipt-outline" size={48} color={darkColors.textSecondary} />
        <Text style={[styles.emptyText, { color: darkColors.textSecondary }]}>No recent transactions</Text>
      </Card>
    );
  }
  
  return (
    <Card style={{ backgroundColor: darkColors.surface }}>
      <Text style={[styles.title, { color: darkColors.text }]}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.medium,
  },
  transactionItem: {
    paddingVertical: spacing.small,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.tiny,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginRight: spacing.small,
  },
  typeTag: {
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as '500',
  },
  date: {
    fontSize: typography.fontSizes.small,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: typography.fontSizes.small,
  },
  total: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  },
  expense: {},
  income: {},
  separator: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: spacing.small,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    marginTop: spacing.medium,
  }
});

export default PortfolioTransactions;
