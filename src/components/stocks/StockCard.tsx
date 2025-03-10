import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StockCardProps {
  stock: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  };
  onPress?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onPress }) => {
  const isPositive = stock.change >= 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.price}>${stock.price.toFixed(2)}</Text>
        <Text style={[
          styles.change,
          isPositive ? styles.positive : styles.negative
        ]}>
          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    fontSize: 14,
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
});

export default StockCard;