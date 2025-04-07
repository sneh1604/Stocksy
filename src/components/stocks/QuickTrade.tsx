import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RootState } from '../../store/reducers';
import { buyStock, sellStock } from '../../store/actions/portfolioActions';
import { saveTransaction } from '../../services/firestore';
import { colors, typography, spacing, shadows } from '../../theme';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

interface QuickTradeProps {
  symbol: string;
  price: number;
  currentShares?: number;
}

const QuickTrade: React.FC<QuickTradeProps> = ({ symbol, price, currentShares = 0 }) => {
  const [quantity, setQuantity] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const balance = useSelector((state: RootState) => state.portfolio.balance);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  const handleQuantityChange = (text: string) => {
    // Only allow positive integers
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  };

  const handleTrade = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to trade stocks.');
      return;
    }

    const shares = parseInt(quantity);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number of shares.');
      return;
    }

    const totalAmount = shares * price;

    if (tradeType === 'buy') {
      if (totalAmount > balance) {
        Alert.alert('Insufficient Funds', `You need ${formatCurrency(totalAmount)} to complete this purchase but only have ${formatCurrency(balance)} available.`);
        return;
      }
      
      try {
        dispatch(buyStock(symbol, shares, price));
        await saveTransaction({
          userId,
          symbol,
          type: 'buy',
          shares,
          price,
          total: totalAmount,
          timestamp: new Date()
        });
        setQuantity('');
        Alert.alert('Success', `Successfully bought ${shares} shares of ${symbol} at ${formatCurrency(price)} per share.`);
      } catch (error) {
        console.error('Error buying stock:', error);
        Alert.alert('Failed', `Could not complete the purchase. Please try again.`);
      }
    } else {
      if (shares > currentShares) {
        Alert.alert('Insufficient Shares', `You only have ${currentShares} shares to sell.`);
        return;
      }
      
      try {
        dispatch(sellStock(symbol, shares, price));
        await saveTransaction({
          userId,
          symbol,
          type: 'sell',
          shares,
          price,
          total: totalAmount,
          timestamp: new Date()
        });
        setQuantity('');
        Alert.alert('Success', `Successfully sold ${shares} shares of ${symbol} at ${formatCurrency(price)} per share.`);
      } catch (error) {
        console.error('Error selling stock:', error);
        Alert.alert('Failed', `Could not complete the sale. Please try again.`);
      }
    }
  };

  const estimatedTotal = quantity ? parseInt(quantity) * price : 0;

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Quick Trade - {symbol}</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Current Price:</Text>
        <Text style={styles.priceValue}>{formatCurrency(price)}</Text>
      </View>
      
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            tradeType === 'buy' ? styles.activeTypeButton : null
          ]}
          onPress={() => setTradeType('buy')}
        >
          <Text style={[
            styles.typeButtonText,
            tradeType === 'buy' ? styles.activeTypeButtonText : null
          ]}>BUY</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            tradeType === 'sell' ? styles.activeTypeButton : null,
            currentShares === 0 ? styles.disabledButton : null
          ]}
          onPress={() => setTradeType('sell')}
          disabled={currentShares === 0}
        >
          <Text style={[
            styles.typeButtonText,
            tradeType === 'sell' ? styles.activeTypeButtonText : null,
            currentShares === 0 ? styles.disabledButtonText : null
          ]}>SELL</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Quantity:</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
          placeholder="Enter shares"
        />
      </View>
      
      {quantity && (
        <View style={styles.estimateContainer}>
          <Text style={styles.estimateLabel}>Estimated {tradeType === 'buy' ? 'Cost' : 'Value'}:</Text>
          <Text style={styles.estimateValue}>{formatCurrency(estimatedTotal)}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.tradeButton,
          tradeType === 'buy' ? styles.buyButton : styles.sellButton,
          (!quantity || parseInt(quantity) <= 0) ? styles.disabledTradeButton : null
        ]}
        onPress={handleTrade}
        disabled={!quantity || parseInt(quantity) <= 0}
      >
        <Text style={styles.tradeButtonText}>
          {tradeType === 'buy' ? 'Buy Now' : 'Sell Now'}
        </Text>
      </TouchableOpacity>
      
      {tradeType === 'buy' && (
        <Text style={styles.balanceText}>Available: {formatCurrency(balance)}</Text>
      )}
      
      {tradeType === 'sell' && (
        <Text style={styles.balanceText}>Available: {currentShares} shares</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.medium,
    padding: spacing.medium,
  },
  title: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
    marginBottom: spacing.medium,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  priceLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
  },
  priceValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.small,
    alignItems: 'center',
    backgroundColor: colors.light,
    marginHorizontal: spacing.tiny,
    borderRadius: 6,
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  typeButtonText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.gray,
  },
  activeTypeButtonText: {
    color: colors.white,
  },
  disabledButtonText: {
    color: colors.gray,
  },
  inputContainer: {
    marginBottom: spacing.medium,
  },
  inputLabel: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    marginBottom: spacing.tiny,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    fontSize: typography.fontSizes.medium,
  },
  estimateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  estimateLabel: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
  },
  estimateValue: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  tradeButton: {
    paddingVertical: spacing.medium,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  buyButton: {
    backgroundColor: colors.profit,
  },
  sellButton: {
    backgroundColor: colors.loss,
  },
  disabledTradeButton: {
    backgroundColor: colors.lightGray,
  },
  tradeButtonText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.white,
  },
  balanceText: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default QuickTrade;
