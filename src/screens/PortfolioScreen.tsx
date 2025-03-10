import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Card from '../components/common/Card';
import { fetchStockQuote } from '../api/stocksApi';
import Loading from '../components/common/Loading';

interface PortfolioItem {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
}

const PortfolioScreen = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      // TODO: Replace with actual portfolio data from your backend
      const mockPortfolio = [
        { symbol: 'AAPL', shares: 10, averagePrice: 150 },
        { symbol: 'GOOGL', shares: 5, averagePrice: 2800 },
      ];

      const updatedPortfolio = await Promise.all(
        mockPortfolio.map(async (item) => {
          const quote = await fetchStockQuote(item.symbol);
          const currentPrice = quote.price;
          const totalValue = currentPrice * item.shares;
          const profitLoss = (currentPrice - item.averagePrice) * item.shares;

          return {
            ...item,
            currentPrice,
            totalValue,
            profitLoss,
          };
        })
      );

      setPortfolio(updatedPortfolio);
      setTotalValue(updatedPortfolio?.reduce((sum, item) => sum + item.totalValue, 0) || 0);
      setTotalProfitLoss(updatedPortfolio?.reduce((sum, item) => sum + item.profitLoss, 0) || 0);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Portfolio Summary</Text>
        <Text style={styles.totalValue}>
          Total Value: ${totalValue.toLocaleString()}
        </Text>
        <Text style={[
          styles.profitLoss,
          totalProfitLoss >= 0 ? styles.profit : styles.loss
        ]}>
          Total P/L: ${totalProfitLoss.toLocaleString()}
        </Text>
      </Card>

      {portfolio.map((item) => (
        <Card key={item.symbol}>
          <View style={styles.holdingRow}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <View style={styles.holdingDetails}>
              <Text>Shares: {item.shares}</Text>
              <Text>Avg Price: ${item.averagePrice}</Text>
              <Text>Current: ${item.currentPrice}</Text>
              <Text style={item.profitLoss >= 0 ? styles.profit : styles.loss}>
                P/L: ${item.profitLoss.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 18,
    marginBottom: 4,
  },
  profitLoss: {
    fontSize: 18,
    fontWeight: '600',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  holdingDetails: {
    alignItems: 'flex-end',
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#F44336',
  },
});

export default PortfolioScreen;