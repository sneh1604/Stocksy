import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockQuote, fetchStockCandles } from '../../api/stocksApi';
import Card from '../common/Card';
import Button from '../common/Button';
import { RootState } from '../../store/reducers';
import { buyStock, sellStock } from '../../store/actions/index';
import { formatCurrency } from '../../utils/helpers';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { saveTransaction } from '../../services/firestore';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface StockDetailProps {
  symbol: string;
  initialPrice?: number;
  onClose?: () => void;
}

interface StockDetailState {
  stockData: any | null;
  candleData: any;
  loading: boolean;
  quantity: string;
  error: string | null;
}

const StockDetail: React.FC<StockDetailProps> = ({ symbol, initialPrice, onClose }) => {
  const [state, setState] = useState<StockDetailState>({
    stockData: initialPrice ? {
      symbol,
      price: initialPrice,
      change: 0,
      changePercent: 0
    } : null,
    candleData: null,
    loading: true,
    quantity: '',
    error: null
  });

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const balance = useSelector((state: RootState) => state.portfolio.balance);
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const navigation = useNavigation();

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const quote = await fetchStockQuote(symbol);
        let candles = null;
        
        try {
          candles = await fetchStockCandles(symbol);
        } catch (error) {
          console.log('Candle data not available, continuing without it');
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            stockData: quote,
            candleData: candles,
            loading: false,
            error: null
          }));
        }
      } catch (error) {
        console.error(`Error loading data for ${symbol}:`, error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: 'Failed to load stock data',
            loading: false
          }));
        }
      }
    };

    loadData();
    // Refresh data every 15 seconds
    interval = setInterval(loadData, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const handleTransaction = async (type: 'buy' | 'sell') => {
    if (!userId) {
      Alert.alert(
        'Authentication Required',
        'Please login to trade stocks',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }

    const shares = parseInt(state.quantity);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number of shares');
      return;
    }

    if (!state.stockData?.price) {
      Alert.alert('Price Data Missing', 'Unable to get current stock price. Please try again.');
      return;
    }

    const currentPrice = state.stockData.price;
    const totalCost = shares * currentPrice;

    if (type === 'buy') {
      if (totalCost > balance) {
        Alert.alert('Insufficient Funds', `You need ${formatCurrency(totalCost)} to complete this purchase but only have ${formatCurrency(balance)} available.`);
        return;
      }
      
      Alert.alert(
        'Confirm Purchase',
        `Buy ${shares} shares of ${symbol} for ${formatCurrency(totalCost)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Buy', 
            style: 'default',
            onPress: async () => {
              try {
                // First update Redux store (this always works even if Firestore fails)
                dispatch(buyStock(symbol, shares, currentPrice));
                
                try {
                  // Then try to save transaction to Firestore (might fail)
                  await saveTransaction({
                    userId,
                    symbol,
                    type: 'buy',
                    shares,
                    price: currentPrice,
                    total: totalCost,
                    timestamp: new Date()
                  });
                } catch (error) {
                  console.log('Firestore transaction save failed, but Redux store was updated');
                  // Transaction will be saved locally as fallback
                }
                
                setState(prev => ({ ...prev, quantity: '' }));
                Alert.alert('Purchase Successful', `You bought ${shares} shares of ${symbol} at ${formatCurrency(currentPrice)} per share`);
              } catch (error) {
                console.error('Error completing purchase:', error);
                Alert.alert('Transaction Failed', 'Could not complete your purchase. Please try again.');
              }
            }
          }
        ]
      );
    } else { // Sell
      const currentHolding = holdings[symbol]?.shares || 0;
      
      if (currentHolding < shares) {
        Alert.alert('Insufficient Shares', `You only have ${currentHolding} shares of ${symbol} available to sell`);
        return;
      }
      
      Alert.alert(
        'Confirm Sale',
        `Sell ${shares} shares of ${symbol} for ${formatCurrency(totalCost)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sell', 
            style: 'default',
            onPress: async () => {
              try {
                // First update Redux store (this always works even if Firestore fails)
                dispatch(sellStock(symbol, shares, currentPrice));
                
                try {
                  // Then try to save transaction to Firestore (might fail)
                  await saveTransaction({
                    userId,
                    symbol,
                    type: 'sell',
                    shares,
                    price: currentPrice,
                    total: totalCost,
                    timestamp: new Date()
                  });
                } catch (error) {
                  console.log('Firestore transaction save failed, but Redux store was updated');
                  // Transaction will be saved locally as fallback
                }
                
                setState(prev => ({ ...prev, quantity: '' }));
                Alert.alert('Sale Successful', `You sold ${shares} shares of ${symbol} at ${formatCurrency(currentPrice)} per share`);
              } catch (error) {
                console.error('Error completing sale:', error);
                Alert.alert('Transaction Failed', 'Could not complete your sale. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const renderChart = () => {
    if (!state.candleData || !state.candleData.prices || state.candleData.prices.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Chart data not available</Text>
        </View>
      );
    }

    // Format chart data
    const data = {
      labels: state.candleData.timestamps.map((timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }).filter((_: any, i: number) => i % 5 === 0), // Show every 5th label
      datasets: [
        {
          data: state.candleData.prices,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '1',
        strokeWidth: '0',
      }
    };

    const screenWidth = Dimensions.get('window').width - 32; // padding 16 on each side

    return (
      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    );
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading {symbol} data...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            // Retry loading data
            fetchStockQuote(symbol)
              .then(quote => setState(prev => ({ 
                ...prev, 
                stockData: quote,
                loading: false 
              })))
              .catch(error => setState(prev => ({ 
                ...prev, 
                error: 'Failed to load stock data',
                loading: false 
              })));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
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
          {state.stockData?.price ? formatCurrency(state.stockData.price) : '-'}
        </Text>
        <Text style={[
          styles.change,
          state.stockData?.change >= 0 ? styles.positive : styles.negative
        ]}>
          {state.stockData?.change ? (
            `${state.stockData.change >= 0 ? '+' : ''}${state.stockData.change.toFixed(2)} 
            (${state.stockData.changePercent.toFixed(2)}%)`
          ) : '-'}
        </Text>
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Price Chart</Text>
        {renderChart()}
      </Card>

      <Card style={styles.tradingCard}>
        <Text style={styles.sectionTitle}>Trade {symbol}</Text>
        <View style={styles.currentInfo}>
          <Text style={styles.infoText}>Available Cash: {formatCurrency(balance)}</Text>
          <Text style={styles.infoText}>Current Position: {holdings[symbol]?.shares || 0} shares</Text>
        </View>
        
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={state.quantity}
          onChangeText={(text) => setState(prev => ({ ...prev, quantity: text }))}
          placeholder="Enter number of shares"
        />
        
        {state.quantity && !isNaN(parseInt(state.quantity)) && (
          <Text style={styles.estimatedCost}>
            Estimated {holdings[symbol]?.shares ? "value" : "cost"}: {formatCurrency(parseInt(state.quantity) * state.stockData.price)}
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyButton]}
            onPress={() => handleTransaction('buy')}
          >
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.sellButton, (!holdings[symbol]?.shares && styles.disabledButton)]}
            onPress={() => handleTransaction('sell')}
            disabled={!holdings[symbol]?.shares}
          >
            <Text style={styles.buttonText}>Sell</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {holdings[symbol]?.shares > 0 && (
        <Card style={styles.holdingCard}>
          <Text style={styles.sectionTitle}>Your Position</Text>
          <View style={styles.holdingDetails}>
            <View style={styles.holdingRow}>
              <Text style={styles.holdingLabel}>Shares:</Text>
              <Text style={styles.holdingValue}>{holdings[symbol]?.shares}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={styles.holdingLabel}>Average Cost:</Text>
              <Text style={styles.holdingValue}>{formatCurrency(holdings[symbol]?.averagePrice || 0)}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={styles.holdingLabel}>Current Value:</Text>
              <Text style={styles.holdingValue}>{formatCurrency((holdings[symbol]?.shares || 0) * state.stockData.price)}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={styles.holdingLabel}>Profit/Loss:</Text>
              <Text style={[
                styles.holdingValue,
                state.stockData.price >= holdings[symbol]?.averagePrice ? styles.profit : styles.loss
              ]}>
                {formatCurrency((state.stockData.price - holdings[symbol]?.averagePrice) * holdings[symbol]?.shares)}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  chartCard: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    marginTop: 10,
    borderRadius: 8,
  },
  chartPlaceholder: {
    height: 200,
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    color: '#666',
  },
  tradingCard: {
    margin: 16,
    padding: 16,
  },
  currentInfo: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    marginBottom: 8,
    fontSize: 16,
  },
  estimatedCost: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  sellButton: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  holdingCard: {
    margin: 16,
    padding: 16,
  },
  holdingDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  holdingLabel: {
    fontSize: 14,
    color: '#666',
  },
  holdingValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#F44336',
  }
});

export default StockDetail;