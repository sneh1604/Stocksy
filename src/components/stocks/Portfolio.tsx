import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStockQuote } from '../../api/stocksApi';
import Card from '../common/Card';
import { RootState } from '../../store/reducers/index';
import { formatCurrency, calculateProfitLoss } from '../../utils/helpers';

interface PortfolioHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
}

const Portfolio: React.FC = () => {
    const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    const [totalProfitLoss, setTotalProfitLoss] = useState(0);
    
    const portfolio = useSelector((state: RootState) => state.portfolio);
    const balance = useSelector((state: RootState) => state.portfolio.balance);

    useEffect(() => {
        loadPortfolioData();
    }, [portfolio]);

    const loadPortfolioData = async () => {
        try {
            const updatedHoldings = await Promise.all(
                Object.entries(portfolio.holdings).map(async ([symbol, holding]) => {
                    const quote = await fetchStockQuote(symbol);
                    const currentPrice = quote.price;
                    const totalValue = currentPrice * holding.shares;
                    const profitLoss = calculateProfitLoss(
                        currentPrice,
                        holding.averagePrice,
                        holding.shares
                    );

                    return {
                        symbol,
                        shares: holding.shares,
                        averagePrice: holding.averagePrice,
                        currentPrice,
                        totalValue,
                        profitLoss,
                    };
                })
            );

            setHoldings(updatedHoldings);
            const newTotalValue = updatedHoldings?.reduce((sum, item) => sum + item.totalValue, 0) || 0;
            const newTotalProfitLoss = updatedHoldings?.reduce((sum, item) => sum + item.profitLoss, 0) || 0;
            
            setTotalValue(newTotalValue);
            setTotalProfitLoss(newTotalProfitLoss);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPortfolioData();
        setRefreshing(false);
    };

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Card style={styles.summaryCard}>
                <Text style={styles.title}>Portfolio Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Cash Balance:</Text>
                    <Text style={styles.value}>{formatCurrency(balance)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Portfolio Value:</Text>
                    <Text style={styles.value}>{formatCurrency(totalValue)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Total P/L:</Text>
                    <Text style={[
                        styles.value,
                        totalProfitLoss >= 0 ? styles.profit : styles.loss
                    ]}>
                        {formatCurrency(totalProfitLoss)}
                    </Text>
                </View>
            </Card>

            {holdings.map((holding) => (
                <Card key={holding.symbol} style={styles.holdingCard}>
                    <View style={styles.holdingHeader}>
                        <Text style={styles.symbol}>{holding.symbol}</Text>
                        <Text style={styles.shares}>{holding.shares} shares</Text>
                    </View>
                    <View style={styles.holdingDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Current Price:</Text>
                            <Text style={styles.value}>
                                {formatCurrency(holding.currentPrice)}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Average Cost:</Text>
                            <Text style={styles.value}>
                                {formatCurrency(holding.averagePrice)}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Total Value:</Text>
                            <Text style={styles.value}>
                                {formatCurrency(holding.totalValue)}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Profit/Loss:</Text>
                            <Text style={[
                                styles.value,
                                holding.profitLoss >= 0 ? styles.profit : styles.loss
                            ]}>
                                {formatCurrency(holding.profitLoss)}
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
        margin: 16,
        padding: 16,
    },
    holdingCard: {
        margin: 16,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    holdingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    symbol: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    shares: {
        fontSize: 16,
        color: '#666',
    },
    holdingDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    profit: {
        color: '#4CAF50',
    },
    loss: {
        color: '#F44336',
    },
});

export default Portfolio;