import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockQuote, fetchStockCandles } from '../../api/stocksApi';
import Card from '../common/Card';
import Button from '../common/Button';
import { RootState } from '../../store/reducers';
import { buyStock, sellStock } from '../../store/actions/index';
import { formatCurrency, formatIndianNumber } from '../../utils/helpers';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { saveTransaction } from '../../services/firestore';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usdToInr } from '../../utils/currencyConverter';
import { darkColors } from '../../theme/darkTheme';

interface StockDetailProps {
  symbol: string;
  initialPrice: number;
  companyName?: string;  // Make it optional for backward compatibility
  onClose?: () => void;
}

interface StockDetailState {
  stockData: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  } | null;
  candleData: {
    prices: number[];
    timestamps: number[];
  } | null;
  loading: boolean;
  quantity: string;
  error: string | null;
}

const StockDetail: React.FC<StockDetailProps> = ({ 
  symbol, 
  initialPrice, 
  companyName,
  onClose 
}) => {
  const [state, setState] = useState<StockDetailState>({
    stockData: initialPrice ? {
      symbol,
      price: usdToInr(initialPrice), // Convert immediately to INR if initial price provided
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
    let interval: NodeJS.Timeout | null = null;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const quote = await fetchStockQuote(symbol);
        
        // Convert USD price to INR for display consistency
        if (quote) {
          quote.price = usdToInr(quote.price);
          // Keep percentage changes accurate
          if (quote.change && quote.price) {
            quote.changePercent = ((quote.change / (quote.price - quote.change)) * 100);
          }
        }
        
        let candles = null;
        try {
          candles = await fetchStockCandles(symbol);
          // Convert candle prices to INR
          if (candles && candles.prices) {
            candles.prices = candles.prices.map((price: number) => usdToInr(price));
          }
        } catch (error) {
          console.log('Candle data not available, continuing without it');
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            stockData: quote ? {
              symbol,
              price: quote.price || 0,
              change: quote.change || 0,
              changePercent: quote.changePercent || 0
            } : null,
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
      if (interval) clearInterval(interval);
    };
  }, [symbol]);

  // Validate quantity input to only allow positive integers
  const validateQuantityInput = (text: string) => {
    if (/^\d*$/.test(text)) {
      setState(prev => ({ ...prev, quantity: text }));
    }
  };
  
  // Calculate profit/loss for current holding
  const calculateProfitLoss = () => {
    if (!holdings[symbol] || !state.stockData?.price) return { value: 0, percentage: 0 };
    
    const avgPrice = holdings[symbol].averagePrice || 0;
    const shares = holdings[symbol].shares || 0;
    const currentPrice = state.stockData.price;
    
    if (avgPrice === 0) return { value: 0, percentage: 0 };
    
    const value = (currentPrice - avgPrice) * shares;
    const percentage = ((currentPrice / avgPrice - 1) * 100);
    
    return {
      value: parseFloat(value.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2))
    };
  };

  const handleTransaction = async (type: 'buy' | 'sell') => {
    if (!userId) {
      Alert.alert(
        'Authentication Required',
        'Please login to trade stocks',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Auth' as never) }
        ]
      );
      return;
    }

    if (!state.quantity || state.quantity.trim() === '') {
      Alert.alert('Invalid Quantity', 'Please enter the number of shares you wish to trade.');
      return;
    }

    const shares = parseInt(state.quantity);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive number of shares.');
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
        Alert.alert(
          'Insufficient Funds',
          `You need ${formatCurrency(totalCost)} to buy ${shares} shares, but only have ${formatCurrency(balance)} available.`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Adjust Quantity', 
              style: 'default',
              onPress: () => {
                const maxPossibleShares = Math.floor(balance / currentPrice);
                if (maxPossibleShares > 0) {
                  setState(prev => ({ ...prev, quantity: maxPossibleShares.toString() }));
                }
              }
            }
          ]
        );
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
                dispatch(buyStock(symbol, shares, currentPrice));
                
                try {
                  await saveTransaction({
                    userId,
                    symbol,
                    companyName: companyName || symbol, // Use symbol as fallback
                    type: 'buy',
                    shares,
                    price: currentPrice,
                    total: totalCost,
                    timestamp: new Date()
                  });
                } catch (error) {
                  console.log('Firestore transaction save failed, but Redux store was updated');
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
    } else {
      const currentHolding = holdings[symbol]?.shares || 0;
      
      if (currentHolding === 0) {
        Alert.alert('No Shares to Sell', `You don't own any shares of ${symbol}.`);
        return;
      }
      
      if (currentHolding < shares) {
        Alert.alert(
          'Insufficient Shares', 
          `You only have ${currentHolding} shares of ${symbol} available to sell.`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Sell All', 
              style: 'default',
              onPress: () => {
                setState(prev => ({ ...prev, quantity: currentHolding.toString() }));
              }
            }
          ]
        );
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
                dispatch(sellStock(symbol, shares, currentPrice));
                
                try {
                  await saveTransaction({
                    userId,
                    symbol,
                    companyName: companyName || symbol, // Use symbol as fallback
                    type: 'sell',
                    shares,
                    price: currentPrice,
                    total: totalCost,
                    timestamp: new Date()
                  });
                } catch (error) {
                  console.log('Firestore transaction save failed, but Redux store was updated');
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

    // Format chart data and ensure valid dates
    const data = {
      labels: state.candleData.timestamps
        .filter((timestamp: number) => timestamp && !isNaN(timestamp)) // Filter invalid timestamps
        .map((timestamp: number) => {
          try {
            const date = new Date(timestamp * 1000);
            if (isNaN(date.getTime())) return ""; // Skip invalid dates
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          } catch (e) {
            return ""; // Return empty string for any date errors
          }
        })
        .filter((label: string) => label !== "") // Filter out empty labels
        .filter((_: any, i: number) => i % 5 === 0), // Show every 5th label for readability
      datasets: [
        {
          data: state.candleData.prices,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }
      ],
    };

    // Fallback if no valid labels
    if (data.labels.length === 0) {
      data.labels = ['0h', '4h', '8h', '12h', '16h', '20h']; // Generic time labels
    }

    const chartConfig = {
      backgroundGradientFrom: darkColors.background,
      backgroundGradientTo: darkColors.background,
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
        withDots={false}
        withShadow={true}
      />
    );
  };

  const profitLoss = calculateProfitLoss();
  
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
          style={[styles.retryButton, { backgroundColor: darkColors.primary }]} 
          onPress={() => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            fetchStockQuote(symbol)
              .then(quote => {
                const inrPrice = usdToInr(quote.price);
                setState(prev => ({ 
                  ...prev, 
                  stockData: {
                    symbol,
                    price: inrPrice,
                    change: quote.change || 0,
                    changePercent: quote.changePercent || 0
                  },
                  loading: false 
                }));
              })
              .catch(error => setState(prev => ({ 
                ...prev, 
                error: 'Failed to load stock data',
                loading: false 
              })));
          }}
        >
          <Text style={[styles.retryButtonText, { color: darkColors.text }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkColors.background }]}>
      <Card style={[styles.header, { backgroundColor: darkColors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.symbol, { color: darkColors.onSurface }]}>{symbol}</Text>
          {companyName && <Text style={[styles.companyName, { color: darkColors.onSurfaceSecondary }]}>{companyName}</Text>}
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: darkColors.onSurfaceSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.price, { color: darkColors.onSurface }]}>
          {state.stockData?.price ? formatCurrency(state.stockData.price) : '-'}
        </Text>
        <Text style={[
          styles.change,
          (state.stockData?.change ?? 0) >= 0 ? styles.positive : styles.negative,
          { color: (state.stockData?.change ?? 0) >= 0 ? darkColors.positive : darkColors.negative }
        ]}>
          {state.stockData?.change ? (
            `${state.stockData.change >= 0 ? '+' : ''}${state.stockData.change.toFixed(2)} 
            (${state.stockData.changePercent.toFixed(2)}%)`
          ) : '-'}
        </Text>
      </Card>

      <Card style={[styles.chartCard, { backgroundColor: darkColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: darkColors.onSurface }]}>Price Chart</Text>
        {renderChart()}
      </Card>

      <Card style={[styles.tradingCard, { backgroundColor: darkColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: darkColors.text }]}>Trade {symbol}</Text>
        <View style={[styles.summaryBox, { backgroundColor: darkColors.surfaceVariant }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: darkColors.onSurfaceSecondary }]}>Cash</Text>
            <Text style={[styles.summaryValue, { color: darkColors.onSurface }]}>{formatIndianNumber(balance)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: darkColors.onSurfaceSecondary }]}>Position</Text>
            <Text style={[styles.summaryValue, { color: darkColors.onSurface }]}>{holdings[symbol]?.shares || 0} shares</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: darkColors.onSurfaceSecondary }]}>Price</Text>
            <Text style={[styles.summaryValue, { color: darkColors.onSurface }]}>{formatCurrency(state.stockData?.price || 0)}</Text>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: darkColors.onSurface }]}>Number of Shares</Text>
          <View style={[styles.inputWrapper, { borderColor: darkColors.border }]}>
            <TextInput
              style={[styles.input, { color: darkColors.onSurface }]}
              keyboardType="numeric"
              value={state.quantity}
              onChangeText={validateQuantityInput}
              placeholder="Enter quantity"
              placeholderTextColor={darkColors.placeholder}
            />
          </View>
        </View>
        
        {state.quantity && !isNaN(parseInt(state.quantity)) && parseInt(state.quantity) > 0 && (
          <View style={[styles.estimateContainer, { backgroundColor: darkColors.surfaceVariant }]}>
            <Text style={[styles.estimateLabel, { color: darkColors.onSurfaceSecondary }]}>
              Estimated {holdings[symbol]?.shares ? "Value" : "Cost"}
            </Text>
            <Text style={[styles.estimateValue, { color: darkColors.primary }]}>
              {formatCurrency(parseInt(state.quantity) * (state.stockData?.price || 0))}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.buyButton,
              { backgroundColor: darkColors.buyButton }
            ]}
            onPress={() => handleTransaction('buy')}
          >
            <Text style={[styles.buttonText, { color: darkColors.text }]}>Buy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.sellButton,
              { backgroundColor: darkColors.sellButton },
              !holdings[symbol]?.shares && { backgroundColor: darkColors.disabledButton }
            ]}
            onPress={() => handleTransaction('sell')}
            disabled={!holdings[symbol]?.shares}
          >
            <Text style={[styles.buttonText, { color: darkColors.text }]}>Sell</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {holdings[symbol]?.shares > 0 && (
        <Card style={[styles.holdingCard, { backgroundColor: darkColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: darkColors.onSurface }]}>Your Position</Text>
          <View style={[styles.holdingDetails, { backgroundColor: darkColors.surfaceVariant }]}>
            <View style={styles.holdingRow}>
              <Text style={[styles.holdingLabel, { color: darkColors.onSurfaceSecondary }]}>Shares Owned</Text>
              <Text style={[styles.holdingValue, { color: darkColors.onSurface }]}>{holdings[symbol]?.shares}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={[styles.holdingLabel, { color: darkColors.onSurfaceSecondary }]}>Avg Cost/Share</Text>
              <Text style={[styles.holdingValue, { color: darkColors.onSurface }]}>{formatCurrency(holdings[symbol]?.averagePrice || 0)}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={[styles.holdingLabel, { color: darkColors.onSurfaceSecondary }]}>Total Investment</Text>
              <Text style={[styles.holdingValue, { color: darkColors.onSurface }]}>{formatCurrency((holdings[symbol]?.shares || 0) * holdings[symbol]?.averagePrice)}</Text>
            </View>
            <View style={styles.holdingRow}>
              <Text style={[styles.holdingLabel, { color: darkColors.onSurfaceSecondary }]}>Current Value</Text>
              <Text style={[styles.holdingValue, { color: darkColors.onSurface }]}>{formatCurrency((holdings[symbol]?.shares || 0) * (state.stockData?.price || 0))}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.profitLossContainer}>
              <View style={styles.profitLossHeader}>
                <Text style={[styles.profitLossLabel, { color: darkColors.onSurface }]}>Profit/Loss</Text>
                <Text style={[
                  styles.profitLossValue,
                  profitLoss.value >= 0 ? styles.profit : styles.loss,
                  { color: profitLoss.value >= 0 ? darkColors.profit : darkColors.loss }
                ]}>
                  {profitLoss.value >= 0 ? '+' : ''}{formatCurrency(profitLoss.value)}
                </Text>
              </View>
              <View style={[
                styles.profitLossBar,
                profitLoss.value >= 0 ? styles.profitBar : styles.lossBar,
                { backgroundColor: profitLoss.value >= 0 ? darkColors.profitLight : darkColors.lossLight }
              ]}>
                <Text style={[styles.profitLossBarText, { color: darkColors.text }]}>
                  {profitLoss.value >= 0 ? '+' : ''}{profitLoss.percentage.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </Card>
      )}
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: darkColors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: darkColors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: darkColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: 'bold',
    color: darkColors.text,
  },
  header: {
    margin: 16,
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkColors.surface,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 16,
    marginTop: 4,
  },
  closeButton: {
    fontSize: 24,
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
    color: darkColors.positive,
  },
  negative: {
    color: darkColors.negative,
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
    backgroundColor: darkColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    color: darkColors.onSurfaceSecondary,
  },
  tradingCard: {
    margin: 16,
    padding: 16,
  },
  summaryBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: darkColors.border,
    marginHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  estimateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  estimateLabel: {
    fontSize: 14,
  },
  estimateValue: {
    fontSize: 14,
    fontWeight: 'bold',
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
    marginRight: 8,
  },
  sellButton: {
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: darkColors.disabledButton,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  holdingCard: {
    margin: 16,
    padding: 16,
  },
  holdingDetails: {
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
  },
  holdingValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: 12,
  },
  profitLossContainer: {
    marginTop: 8,
  },
  profitLossHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profitLossLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  profitLossValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profitLossBar: {
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profitBar: {
    backgroundColor: darkColors.profitLight,
  },
  lossBar: {
    backgroundColor: darkColors.lossLight,
  },
  profitLossBarText: {
    fontWeight: 'bold',
  },
  profit: {
    color: darkColors.profit,
  },
  loss: {
    color: darkColors.loss,
  },
  bottomSpacer: {
    height: 32,
  }
});

export default StockDetail;