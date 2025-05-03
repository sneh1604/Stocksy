import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors, typography, shadows } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
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
    <Card style={[styles.container, { backgroundColor: darkColors.surface }]}>
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
          <Ionicons name="receipt-outline" size={32} color={darkColors.textSecondary} />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: darkColors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: darkColors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.small,
    color: darkColors.textSecondary,
  },
  activeTabText: {
    color: darkColors.text,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  transactionItem: {
    paddingVertical: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginRight: 8,
    color: darkColors.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBadge: {
    backgroundColor: darkColors.profit + '20',
  },
  sellBadge: {
    backgroundColor: darkColors.loss + '20',
  },
  badgeText: {
    fontSize: typography.fontSizes.tiny,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: darkColors.text,
  },
  transactionDetails: {
    marginBottom: 4,
  },
  shares: {
    fontSize: typography.fontSizes.small,
    color: darkColors.text,
  },
  total: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
    color: darkColors.text,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: typography.fontSizes.tiny,
    color: darkColors.textSecondary,
  },
  syncPendingBadge: {
    backgroundColor: darkColors.primaryVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncPendingText: {
    fontSize: typography.fontSizes.tiny,
    color: darkColors.text,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    color: darkColors.textSecondary,
    marginTop: 8,
  },
});

export default TransactionTabs;
