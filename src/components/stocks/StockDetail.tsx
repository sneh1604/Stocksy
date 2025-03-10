import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockQuote, fetchStockIntraday } from '../../api/stocksApi';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { RootState } from '../../store/reducers';
import { buyStock, sellStock } from '../../store/actions/index';
import { formatCurrency } from '../../utils/helpers';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

interface StockDetailProps {
  symbol: string;
  onClose?: () => void;
}

const StockDetail: React.FC<StockDetailProps> = ({ symbol, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [intradayData, setIntradayData] = useState<any>(null);

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const balance = useSelector((state: RootState) => state.portfolio.balance);
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const [quote, intraday] = await Promise.all([
        fetchStockQuote(symbol),
        fetchStockIntraday(symbol)
      ]);
      setStockData(quote);
      setIntradayData(intraday);
    } catch (error) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    const shares = parseInt(quantity);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const totalCost = shares * stockData.price;
    if (totalCost > balance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    try {
      dispatch(buyStock(symbol, shares, stockData.price));
      setQuantity('');
      Alert.alert('Success', `Bought ${shares} shares of ${symbol}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete purchase');
    }
};

const handleSell = () => {
    const shares = parseInt(quantity);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const currentHolding = holdings[symbol]?.shares || 0;
    if (shares > currentHolding) {
      Alert.alert('Error', 'Not enough shares to sell');
      return;
    }

    try {
      dispatch(sellStock(symbol, shares, stockData.price));
      setQuantity('');
      Alert.alert('Success', `Sold ${shares} shares of ${symbol}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete sale');
    }
};

  if (loading || !stockData) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.symbol}>{symbol}</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.price}>
          {stockData?.price ? formatCurrency(stockData.price) : '-'}
        </Text>
        <Text style={[
          styles.change,
          stockData?.change >= 0 ? styles.positive : styles.negative
        ]}>
          {stockData?.change ? (
            `${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} 
            (${stockData.changePercent.toFixed(2)}%)`
          ) : '-'}
        </Text>
      </Card>

      <Card style={styles.tradingCard}>
        <Text style={styles.sectionTitle}>Trade</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
        />
        <View style={styles.buttonContainer}>
          <View style={[styles.button, styles.buyButton]}>
            <Button
              title="Buy"
              onPress={handleBuy}
            />
          </View>
          <View style={[styles.button, styles.sellButton]}>
            <Button
              title="Sell"
              onPress={handleSell}
            />
          </View>
        </View>
      </Card>

      <Card style={styles.holdingCard}>
        <Text style={styles.sectionTitle}>Your Position</Text>
        <Text>Shares: {holdings[symbol]?.shares || 0}</Text>
        <Text>Average Cost: {formatCurrency(holdings[symbol]?.averagePrice || 0)}</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  change: {
    fontSize: 18,
    marginTop: 4,
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  tradingCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#F44336',
  },
  holdingCard: {
    margin: 16,
    padding: 16,
  },
});

export default StockDetail;