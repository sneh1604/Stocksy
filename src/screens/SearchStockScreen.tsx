import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { searchStocks, fetchStockQuote } from '../api/stocksApi';
import StockCard from '../components/stocks/StockCard';
import { useDebounce } from '../hooks/useDebounce';
import { colors, typography, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';

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
        
        if (results.length > 0) {
          console.log(`[Search] Found ${results.length} stocks`);
          interface StockResult {
            symbol: string;
            name: string;
          }

          interface StockQuote {
            price: number;
            change: number;
            changePercent: number;
          }

          type StockWithQuote = StockResult & StockQuote;

          const stocksWithQuotes: (StockWithQuote | null)[] = await Promise.all(
            results.slice(0, 5).map(async (stock: StockResult) => {
              try {
                const quote: StockQuote = await fetchStockQuote(stock.symbol);
                return {
                  ...stock,
                  ...quote
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
      initialPrice: price
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          placeholderTextColor={colors.gray}
        />
        {query.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.gray} 
            style={styles.clearIcon}
            onPress={() => setQuery('')}
          />
        )}
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && stocks.length === 0 && query.length > 0 && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={60} color={colors.lightGray} />
          <Text style={styles.noResults}>No stocks found for "{query}"</Text>
          <Text style={styles.noResultsSubtext}>Try searching with a different symbol or company name</Text>
        </View>
      )}

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
    fontWeight: typography.fontWeights.medium as '500',
    color: colors.dark,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  noResultsSubtext: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  listContainer: {
    paddingBottom: spacing.base,
  },
});
