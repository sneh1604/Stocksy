import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
import Card from '../common/Card';
import { RootState } from '../../store/types';
import { buyStock, sellStock } from '../../store/actions/portfolioActions';
import { saveTransaction } from '../../services/firestore';
import { formatCurrency } from '../../utils/helpers';

interface IndianStockDetailProps {
  symbol: string;
  initialPrice: number;
  companyName: string;
  onClose?: () => void;
}

const IndianStockDetail: React.FC<IndianStockDetailProps> = ({ 
  symbol, 
  initialPrice, 
  companyName,
  onClose 
}) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const balance = useSelector((state: RootState) => state.portfolio.balance);
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  const currentHolding = holdings[symbol]?.shares || 0;
  const estimatedCost = parseFloat(quantity) * initialPrice || 0;

  const handleTransaction = async (type: 'buy' | 'sell') => {
    if (!quantity || isNaN(parseFloat(quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const shares = parseInt(quantity);
    if (shares <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    const totalCost = shares * initialPrice;

    if (type === 'buy') {
      if (totalCost > balance) {
        Alert.alert('Insufficient Funds', `You need ₹${totalCost.toLocaleString()} to buy ${shares} shares`);
        return;
      }
    } else if (type === 'sell') {
      if (shares > currentHolding) {
        Alert.alert('Insufficient Shares', `You only have ${currentHolding} shares to sell`);
        return;
      }
    }

    try {
      setLoading(true);
      if (type === 'buy') {
        dispatch(buyStock(symbol, shares, initialPrice));
      } else {
        dispatch(sellStock(symbol, shares, initialPrice));
      }

      await saveTransaction({
        userId,
        symbol,
        companyName,
        type,
        shares,
        price: initialPrice,
        total: totalCost,
        timestamp: new Date()
      });

      Alert.alert(
        'Success',
        `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${companyName}`
      );
      setQuantity('');
    } catch (error) {
      console.error(`Error ${type}ing stock:`, error);
      Alert.alert('Error', `Failed to ${type} stock. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={[styles.container, { backgroundColor: darkColors.surface }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.symbol, { color: darkColors.text }]}>{symbol}</Text>
          <Text style={[styles.companyName, { color: darkColors.textSecondary }]}>{companyName}</Text>
          <Text style={[styles.price, { color: darkColors.text }]}>{formatCurrency(initialPrice)}</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={darkColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.holdings, { backgroundColor: darkColors.card }]}>
        <Text style={[styles.holdingText, { color: darkColors.text }]}>
          Current Holdings: {currentHolding} shares
        </Text>
        <Text style={[styles.holdingText, { color: darkColors.text }]}>
          Available Balance: {formatCurrency(balance)}
        </Text>
      </View>

      <View style={styles.tradingSection}>
        <Text style={[styles.label, { color: darkColors.text }]}>Quantity:</Text>
        <TextInput
          style={[styles.input, { borderColor: darkColors.border, backgroundColor: darkColors.background, color: darkColors.text }]}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Enter number of shares"
          placeholderTextColor={darkColors.textSecondary}
        />

        {estimatedCost > 0 && (
          <Text style={[styles.estimate, { color: darkColors.primary }]}>
            Estimated Cost: {formatCurrency(estimatedCost)}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyButton]}
            onPress={() => handleTransaction('buy')}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sellButton]}
            onPress={() => handleTransaction('sell')}
            disabled={loading || currentHolding === 0}
          >
            <Text style={styles.buttonText}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.medium,
  },
  symbol: {
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  companyName: {
    fontSize: typography.fontSizes.medium,
    marginTop: spacing.tiny,
  },
  price: {
    fontSize: typography.fontSizes.large,
    marginTop: spacing.tiny,
  },
  closeButton: {
    padding: spacing.small,
  },
  holdings: {
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  holdingText: {
    fontSize: typography.fontSizes.medium,
    marginBottom: spacing.tiny,
  },
  tradingSection: {
    marginTop: spacing.medium,
  },
  label: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
    marginBottom: spacing.small,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.medium,
    fontSize: typography.fontSizes.medium,
    marginBottom: spacing.medium,
  },
  estimate: {
    fontSize: typography.fontSizes.medium,
    marginBottom: spacing.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.medium,
  },
  button: {
    flex: 1,
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.profit,
  },
  sellButton: {
    backgroundColor: colors.loss,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
});

export default IndianStockDetail;
