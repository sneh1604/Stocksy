import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStockQuote } from '../../api/stocksApi';
import Card from '../common/Card';
import { RootState } from '../../store/reducers/index';
import { formatCurrency, formatIndianNumber, calculateProfitLoss } from '../../utils/helpers';
import { colors, typography, spacing, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { initializeUserPortfolio } from '../../store/actions/portfolioActions';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import PortfolioHoldings from './PortfolioHoldings';
import QuickTrade from './QuickTrade';
import PortfolioTransactions from './PortfolioTransactions';
import { getUserTransactions } from '../../services/firestore';
import TransactionTabs from './TransactionTabs';
import { usdToInr } from '../../utils/currencyConverter';
import { darkColors } from '../../theme/darkTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;

interface PortfolioHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
}

// Define a type for portfolio holdings
interface Holding {
  shares: number;
  averagePrice: number;
}

const Portfolio: React.FC = () => {
    const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    const [totalProfitLoss, setTotalProfitLoss] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    
    const portfolio = useSelector((state: RootState) => state.portfolio);
    const balance = useSelector((state: RootState) => state.portfolio.balance);
    const userId = useSelector((state: RootState) => state.auth.user?.uid);
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

    // Load initial portfolio data from Firestore when user logs in
    useEffect(() => {
        const initializePortfolio = async () => {
            if (userId && !isInitialized) {
                await dispatch(initializeUserPortfolio(userId));
                setIsInitialized(true);
                loadTransactions();
            }
        };
        
        initializePortfolio();
    }, [userId, dispatch, isInitialized]);
    
    // Load portfolio data when portfolio state changes
    useEffect(() => {
        loadPortfolioData();
    }, [portfolio]);

    const loadTransactions = async () => {
        if (!userId) return;
        
        try {
            const userTransactions = await getUserTransactions(userId);
            setTransactions(userTransactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    // Modified loadPortfolioData to convert USD to INR
    const loadPortfolioData = async () => {
        try {
            if (!portfolio.holdings || Object.keys(portfolio.holdings).length === 0) {
                setHoldings([]);
                setTotalValue(0);
                setTotalProfitLoss(0);
                return;
            }
            
            const updatedHoldings = await Promise.all(
                Object.entries(portfolio.holdings as Record<string, Holding>).map(async ([symbol, holding]) => {
                    try {
                        const quote = await fetchStockQuote(symbol);
                        // Convert USD to INR
                        const currentPrice = usdToInr(quote.price);
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
                    } catch (error) {
                        console.error(`Error fetching data for ${symbol}:`, error);
                        return {
                            symbol,
                            shares: holding.shares,
                            averagePrice: holding.averagePrice,
                            currentPrice: holding.averagePrice, // Fallback to average price
                            totalValue: holding.averagePrice * holding.shares,
                            profitLoss: 0,
                        };
                    }
                })
            );

            setHoldings(updatedHoldings);
            const newTotalValue = updatedHoldings?.reduce((sum, item) => sum + item.totalValue, 0) || 0;
            const newTotalProfitLoss = updatedHoldings?.reduce((sum, item) => sum + item.profitLoss, 0) || 0;
            
            setTotalValue(newTotalValue);
            setTotalProfitLoss(newTotalProfitLoss);

            // If a stock is selected, set it to the first holding by default
            if (!selectedStock && updatedHoldings.length > 0) {
                setSelectedStock(updatedHoldings[0].symbol);
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        
        // If user is logged in, re-initialize from Firestore
        if (userId) {
            await dispatch(initializeUserPortfolio(userId));
            await loadTransactions();
        }
        
        // Then reload data with fresh prices
        await loadPortfolioData();
        setRefreshing(false);
    };

    const handleHoldingPress = (symbol: string, price: number) => {
        navigation.navigate('StockDetails', {
            symbol,
            initialPrice: price,
            isIndianStock: false,
            companyName: symbol // Using symbol as fallback for company name
        });
    };

    const calculatePortfolioPercentChange = () => {
        if (totalValue === 0 || balance + totalValue === 0) return 0;
        return ((totalProfitLoss) / (balance + totalValue - totalProfitLoss)) * 100;
    };

    const percentChange = calculatePortfolioPercentChange();
    
    const getSelectedStockData = () => {
        if (!selectedStock) return null;
        return holdings.find(h => h.symbol === selectedStock);
    };
    
    const selectedStockData = getSelectedStockData();
    
    // Main view
    return (
        <View style={[styles.container, { backgroundColor: darkColors.background }]}>
            <FlatList
                data={[]}
                renderItem={null}
                keyExtractor={() => 'dummy'}
                ListHeaderComponent={
                    <>
                        <Card style={[styles.summaryCard, { backgroundColor: darkColors.surface }]}>
                            <Text style={[styles.portfolioTitle, { color: darkColors.text }]}>Portfolio Overview</Text>
                            
                            <View style={styles.balanceRow}>
                                <Text style={[styles.totalBalanceLabel, { color: darkColors.textSecondary }]}>Total Balance</Text>
                                <Text style={[styles.totalBalanceValue, { color: darkColors.text }]}>
                                    {formatIndianNumber(balance + totalValue)}
                                </Text>
                                
                                <View style={[
                                    styles.changeIndicator,
                                    { backgroundColor: percentChange >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
                                ]}>
                                    <Ionicons 
                                        name={percentChange >= 0 ? "arrow-up" : "arrow-down"} 
                                        size={14} 
                                        color={percentChange >= 0 ? colors.profit : colors.loss} 
                                    />
                                    <Text style={[
                                        styles.changeText,
                                        { color: percentChange >= 0 ? colors.profit : colors.loss }
                                    ]}>
                                        {Math.abs(percentChange).toFixed(2)}%
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: darkColors.border }]} />
                            
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: darkColors.textSecondary }]}>Cash</Text>
                                    <Text style={[styles.summaryValue, { color: darkColors.text }]}>
                                        {formatIndianNumber(balance)}
                                    </Text>
                                </View>
                                
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: darkColors.textSecondary }]}>Investments</Text>
                                    <Text style={[styles.summaryValue, { color: darkColors.text }]}>
                                        {formatIndianNumber(totalValue)}
                                    </Text>
                                </View>
                                
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: darkColors.textSecondary }]}>Profit/Loss</Text>
                                    <Text style={[
                                        styles.summaryValue,
                                        { color: totalProfitLoss >= 0 ? colors.profit : colors.loss }
                                    ]}>
                                        {formatIndianNumber(totalProfitLoss)}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                        
                        {/* Portfolio Holdings Component */}
                        <View style={styles.sectionContainer}>
                            <PortfolioHoldings holdings={holdings} />
                        </View>
                        
                        {/* Quick Trade Component */}
                        {selectedStockData && (
                            <View style={styles.sectionContainer}>
                                <QuickTrade 
                                    symbol={selectedStockData.symbol}
                                    price={selectedStockData.currentPrice}
                                    currentShares={selectedStockData.shares}
                                />
                            </View>
                        )}
                        
                        {/* Transaction Tabs Component */}
                        <View style={styles.sectionContainer}>
                            <TransactionTabs transactions={transactions} />
                        </View>
                    </>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    listContent: {
        paddingBottom: spacing.xlarge,
        flexGrow: 1,
        padding: spacing.base,
    },
    summaryCard: {
        marginVertical: 8,
        padding: 16,
    },
    portfolioTitle: {
        fontSize: typography.fontSizes.large,
        fontWeight: typography.fontWeights.bold as 'bold',
        color: colors.dark,
        marginBottom: spacing.small,
    },
    balanceRow: {
        marginBottom: spacing.medium,
    },
    totalBalanceLabel: {
        fontSize: typography.fontSizes.small,
        color: colors.gray,
        marginBottom: spacing.tiny,
    },
    totalBalanceValue: {
        fontSize: typography.fontSizes.huge,
        fontWeight: typography.fontWeights.bold as 'bold',
        color: colors.dark,
    },
    changeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.small,
        paddingVertical: spacing.tiny,
        borderRadius: 12,
        marginTop: spacing.tiny,
    },
    changeText: {
        fontSize: typography.fontSizes.small,
        fontWeight: typography.fontWeights.medium as '500',
        marginLeft: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.medium,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: typography.fontSizes.small,
        color: colors.gray,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: typography.fontSizes.medium,
        fontWeight: typography.fontWeights.medium as '500',
        color: colors.dark,
    },
    sectionContainer: {
        marginBottom: spacing.base,
    },
    sectionTitle: {
        fontSize: typography.fontSizes.medium,
        fontWeight: typography.fontWeights.bold as 'bold',
        marginBottom: spacing.small,
        color: colors.dark,
    },
});

export default Portfolio;