import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { getUserTransactions } from '../services/firestore';
import Card from '../components/common/Card';
import { formatCurrency } from '../utils/helpers';

interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userTransactions = await getUserTransactions(userId);
      setTransactions(userTransactions as Transaction[]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      
      {transactions.length === 0 ? (
        <Text style={styles.noTransactions}>No transactions yet</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={[
                  styles.type,
                  item.type === 'buy' ? styles.buyText : styles.sellText
                ]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.details}>
                <Text>Shares: {item.shares}</Text>
                <Text>Price: {formatCurrency(item.price)}</Text>
                <Text style={styles.total}>Total: {formatCurrency(item.total)}</Text>
                <Text style={styles.date}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noTransactions: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buyText: {
    backgroundColor: '#e6f7ed',
    color: '#4CAF50',
  },
  sellText: {
    backgroundColor: '#ffebee',
    color: '#F44336',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  total: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  date: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  }
});

export default TransactionHistoryScreen;
