import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import Card from '../components/common/Card';
import BSEActiveTab from '../components/indian-market/BSEActiveTab';
import NSEActiveTab from '../components/indian-market/NSEActiveTab';

const API_KEY = 'sk-live-q68c6TzuJtAuMbtSYL6ykLvXcYyBK2YoCt5qDefy';
const BASE_URL = 'https://stock.indianapi.in';

interface TrendingStock {
  ticker_id: string;
  company_name: string;
  price: string;
  percent_change: string;
  net_change: string;
  volume: string;
  exchange_type: string;
  overall_rating: string;
}

interface TrendingStocksResponse {
  trending_stocks: {
    top_gainers: TrendingStock[];
    top_losers: TrendingStock[];
  };
}

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  image_url: string;
  pub_date: string;
  source: string;
  topics: string[];
}

const TrendingStocksTab = () => {
  const navigation = useNavigation();
  const [gainers, setGainers] = useState<TrendingStock[]>([]);
  const [losers, setLosers] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingStocks();
  }, []);

  const fetchTrendingStocks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/trending`, {
        headers: { 'X-Api-Key': API_KEY },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`API Error: ${responseText}`);
      }

      let result: TrendingStocksResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response format from API');
      }

      if (!result.trending_stocks) {
        throw new Error('Invalid data format from API');
      }

      setGainers(result.trending_stocks.top_gainers || []);
      setLosers(result.trending_stocks.top_losers || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load trending stocks: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (stock: TrendingStock) => {
    navigation.navigate('StockDetails', {
      symbol: stock.ticker_id,
      initialPrice: parseFloat(stock.price),
      isIndianStock: true,
      companyName: stock.company_name,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!gainers.length && !losers.length) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="information-circle-outline" size={48} color={colors.gray} />
        <Text style={styles.errorText}>{error || 'No trending stocks available'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTrendingStocks}>
          <Text style={styles.retryText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTrendingStocks}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Gainers</Text>
        <FlatList
          data={gainers}
          keyExtractor={(item) => item.ticker_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleStockPress(item)}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.symbol}>{item.ticker_id}</Text>
                    <Text style={styles.companyName}>{item.company_name}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={[styles.changeContainer, styles.positiveChange]}>
                      <Ionicons name="trending-up" size={16} color={colors.profit} />
                      <Text style={[styles.changeText, styles.positiveText]}>
                        {item.net_change} ({item.percent_change}%)
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Losers</Text>
        <FlatList
          data={losers}
          keyExtractor={(item) => item.ticker_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleStockPress(item)}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.symbol}>{item.ticker_id}</Text>
                    <Text style={styles.companyName}>{item.company_name}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={[styles.changeContainer, styles.negativeChange]}>
                      <Ionicons name="trending-down" size={16} color={colors.loss} />
                      <Text style={[styles.changeText, styles.negativeText]}>
                        {item.net_change} ({item.percent_change}%)
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const IndianNewsTab = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/news`, {
        headers: { 'X-Api-Key': API_KEY },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleNewsPress = (item: NewsItem) => {
    setSelectedNews(item);
  };

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleNewsPress(item)}>
            <Card style={styles.newsCard}>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.newsImage} resizeMode="cover" />
              )}
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.summary}
              </Text>
              <Text style={styles.newsDate}>{new Date(item.pub_date).toLocaleDateString('en-IN')}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedNews} animationType="slide" onRequestClose={() => setSelectedNews(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedNews(null)}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>

          {selectedNews?.image_url && (
            <Image source={{ uri: selectedNews.image_url }} style={styles.modalImage} resizeMode="cover" />
          )}

          <Text style={styles.modalTitle}>{selectedNews?.title}</Text>
          <Text style={styles.modalSource}>{selectedNews?.source}</Text>
          <Text style={styles.modalSummary}>{selectedNews?.summary}</Text>

          {selectedNews?.topics && (
            <View style={styles.topicsContainer}>
              {selectedNews.topics.map((topic, index) => (
                <View key={index} style={styles.topicTag}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const IndianMarketScreen = () => {
  const [activeTab, setActiveTab] = useState('Trending');

  const renderContent = () => {
    switch (activeTab) {
      case 'Trending':
        return <TrendingStocksTab />;
      case 'BSE':
        return <BSEActiveTab />;
      case 'NSE':
        return <NSEActiveTab />;
      case 'News':
        return <IndianNewsTab />;
      default:
        return <TrendingStocksTab />;
    }
  };

  return (
    <View style={styles.darkContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
      >
        <View style={styles.tabContainer}>
          {['Trending', 'BSE', 'NSE', 'News'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === 'Trending' ? 'trending-up' :
                  tab === 'BSE' ? 'stats-chart' :
                  tab === 'NSE' ? 'analytics' : 'newspaper'
                }
                size={24}
                color={activeTab === tab ? colors.primary : colors.gray}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  tabScrollView: {
    maxHeight: 70,
    backgroundColor: '#2d2d2d',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    marginRight: spacing.medium,
    borderRadius: 20,
    backgroundColor: '#3d3d3d',
    minWidth: 100,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  tabText: {
    color: colors.gray,
    marginLeft: spacing.small,
    fontSize: typography.fontSizes.small,
    fontWeight: typography.fontWeights.medium as '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold as 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: spacing.medium,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  card: {
    marginBottom: spacing.small,
    backgroundColor: '#2d2d2d',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbol: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: '#ffffff',
  },
  companyName: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: '#ffffff',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  positiveChange: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  changeText: {
    fontSize: typography.fontSizes.small,
    marginLeft: 4,
  },
  positiveText: {
    color: colors.profit,
  },
  negativeText: {
    color: colors.loss,
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: '#ffffff',
    marginBottom: spacing.medium,
  },
  errorText: {
    marginTop: spacing.medium,
    fontSize: typography.fontSizes.medium,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  },
  newsCard: {
    margin: 10,
    padding: 15,
    backgroundColor: '#2d2d2d',
  },
  newsImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.small,
  },
  newsSource: {
    fontSize: typography.fontSizes.small,
    color: colors.primary,
    marginBottom: spacing.tiny,
  },
  newsTitle: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  newsDescription: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: typography.fontSizes.small,
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: spacing.medium,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing.small,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  modalTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.medium,
    color: '#ffffff',
  },
  modalSource: {
    fontSize: typography.fontSizes.medium,
    color: colors.primary,
    marginBottom: spacing.small,
  },
  modalSummary: {
    fontSize: typography.fontSizes.medium,
    lineHeight: 24,
    color: colors.gray,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.medium,
  },
  topicTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: 16,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  topicText: {
    color: colors.primary,
    fontSize: typography.fontSizes.small,
  },
});

export default IndianMarketScreen;
