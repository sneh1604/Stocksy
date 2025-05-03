import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { searchStocks, fetchStockQuote } from '../api/stocksApi';
import StockCard from '../components/stocks/StockCard';
import StockList from '../components/stocks/StockList';
import { useDebounce } from '../hooks/useDebounce';
import { colors, typography, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { usdToInr } from '../utils/currencyConverter';
import { darkColors } from '../theme/darkTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;

export const SearchStockScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    const searchStocksData = async () => {
      if (debouncedQuery.length < 2) {
        setStocks([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`[Search] Searching for stocks with query: ${debouncedQuery}`);
        const results = await searchStocks(debouncedQuery);
        
        if (results && Array.isArray(results) && results.length > 0) {
          console.log(`[Search] Found ${results.length} stocks`);
          
          interface StockResult {
            symbol: string;
            description: string;
            displaySymbol: string;
            type: string;
          }

          interface StockQuote {
            symbol: string;
            price: number;
            change: number;
            changePercent: number;
          }

          type StockWithQuote = StockResult & StockQuote;

          const stocksWithQuotes = await Promise.all(
            results.slice(0, 5).map(async (stock: StockResult) => {
              try {
                const quote = await fetchStockQuote(stock.symbol);
                return {
                  ...stock,
                  price: usdToInr(quote.price), // Convert to INR
                  change: quote.change,
                  changePercent: quote.changePercent,
                  name: stock.description
                };
              } catch (error) {
                console.error(`[Search] Error fetching quote for ${stock.symbol}:`, error);
                return null;
              }
            })
          );
          setStocks(stocksWithQuotes.filter(Boolean));
        } else {
          console.log('[Search] No stocks found');
          setStocks([]);
        }
      } catch (error) {
        console.error('[Search] Error searching stocks:', error);
        setError('Failed to search stocks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchStocksData();
  }, [debouncedQuery]);

  const handleStockPress = (symbol: string, price: number) => {
    navigation.navigate('StockDetails', {
      symbol,
      initialPrice: price,
      isIndianStock: false,
      companyName: symbol // Using symbol as fallback for company name
    });
  };

  // Render search results or trending stocks
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (query.length > 0) {
      // User has entered a search query
      if (stocks.length === 0) {
        return (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={60} color={colors.lightGray} />
            <Text style={styles.noResults}>No stocks found for "{query}"</Text>
            <Text style={styles.noResultsSubtext}>Try searching with a different symbol or company name</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              onPress={() => handleStockPress(item.symbol, item.price)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      );
    } else {
      // No search query, show trending/featured stocks
      return (
        <View style={styles.trendingContainer}>
          <Text style={styles.sectionTitle}>Market Watch</Text>
          <StockList onStockPress={handleStockPress} />
          
          <View style={styles.featuredContainer}>
            <Text style={styles.sectionTitle}>Featured Sectors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.sectorCard, { backgroundColor: colors.indian.saffron }]}>
                <Text style={styles.sectorTitle}>Technology</Text>
              </View>
              <View style={[styles.sectorCard, { backgroundColor: colors.indian.green }]}>
                <Text style={styles.sectorTitle}>Finance</Text>
              </View>
              <View style={[styles.sectorCard, { backgroundColor: colors.nse }]}>
                <Text style={styles.sectorTitle}>Healthcare</Text>
              </View>
              <View style={[styles.sectorCard, { backgroundColor: colors.bse }]}>
                <Text style={styles.sectorTitle}>Energy</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkColors.background }]}>
      <View style={[styles.searchInputContainer, { 
        backgroundColor: darkColors.surface,
        borderColor: darkColors.border 
      }]}>
        <Ionicons name="search" size={20} color={darkColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: darkColors.text }]}
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          placeholderTextColor={darkColors.textSecondary}
        />
        {query.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={darkColors.textSecondary} 
            style={styles.clearIcon}
            onPress={() => setQuery('')}
          />
        )}
      </View>
      
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.base,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  clearIcon: {
    marginLeft: spacing.small,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.medium,
    color: colors.dark,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xlarge,
  },
  loadingText: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
    marginTop: spacing.medium,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xlarge,
  },
  errorText: {
    fontSize: typography.fontSizes.medium,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxlarge,
  },
  noResults: {
    fontSize: typography.fontSizes.large,
    color: darkColors.text,
    fontWeight: typography.fontWeights.medium as '500',
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  noResultsSubtext: {
    fontSize: typography.fontSizes.medium,
    color: darkColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  listContainer: {
    paddingBottom: spacing.base,
  },
  trendingContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.small,
    color: darkColors.text,
  },
  featuredContainer: {
    marginTop: spacing.large,
  },
  sectorCard: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginRight: spacing.medium,
    padding: spacing.medium,
    justifyContent: 'flex-end',
  },
  sectorTitle: {
    color: colors.white,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
});
