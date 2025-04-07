import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: string;
  savedLocally?: boolean;
}

interface TransactionTabsProps {
  transactions: Transaction[];
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell'>('all');
  
  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });
  
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <View style={[
          styles.badge, 
          item.type === 'buy' ? styles.buyBadge : styles.sellBadge
        ]}>
          <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.shares}>{item.shares} shares @ {formatCurrency(item.price)}</Text>
        <Text style={styles.total}>Total: {formatCurrency(item.total)}</Text>
      </View>
      
      <View style={styles.transactionFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString('en-IN')} • 
          {new Date(item.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.savedLocally && (
          <View style={styles.syncPendingBadge}>
            <Text style={styles.syncPendingText}>Sync Pending</Text>
          </View>
        )}
      </View>
    </View>
  );
  
  return (
    <Card style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
          onPress={() => setActiveTab('buy')}
        >
          <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
            Buy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            Sell
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions.slice(0, 5)} // Show only the last 5 transactions
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={32} color={colors.gray} />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    borderRadius: 8,
    marginBottom: spacing.medium,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  tabText: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  transactionItem: {
    paddingVertical: spacing.small,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.tiny,
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginRight: spacing.small,
  },
  badge: {
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  sellBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  badgeText: {
    fontSize: typography.fontSizes.tiny,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  transactionDetails: {
    marginBottom: spacing.tiny,
  },
  shares: {
    fontSize: typography.fontSizes.small,
  },
  total: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: typography.fontSizes.tiny,
    color: colors.gray,
  },
  syncPendingBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncPendingText: {
    fontSize: typography.fontSizes.tiny,
    color: colors.white,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.small,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.large,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
    marginTop: spacing.small,
  },
});

export default TransactionTabs;
