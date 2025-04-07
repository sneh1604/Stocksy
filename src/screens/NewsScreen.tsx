import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl, 
  Linking, 
  ActivityIndicator 
} from 'react-native';
import { fetchMarketNews, NewsItem } from '../api/newsApi';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import { colors, typography, spacing } from '../theme';

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const NewsScreen: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async () => {
    try {
      setError(null);
      const newsData = await fetchMarketNews();
      setNews(newsData);
    } catch (error) {
      console.error('Failed to load news:', error);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const handleOpenArticle = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity onPress={() => handleOpenArticle(item.url)}>
      <Card style={styles.newsCard} elevation="medium">
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.newsContent}>
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.summary} numberOfLines={3}>
            {item.summary}
          </Text>
          <View style={styles.newsFooter}>
            <Text style={styles.time}>
              <Ionicons name="time-outline" size={14} /> {formatDate(item.datetime)}
            </Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>
                {item.category.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading financial news...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary]} 
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Market News</Text>
            <Text style={styles.headerSubtitle}>
              Latest updates from global financial markets
            </Text>
          </View>
        }
        ListEmptyComponent={() => {
          if (loading) return null;
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyText}>
                {error || 'No news available at the moment.'}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.base,
    color: colors.gray,
    fontSize: typography.fontSizes.medium,
  },
  header: {
    marginBottom: spacing.large,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxlarge,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
    marginBottom: spacing.tiny,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
  },
  newsCard: {
    marginBottom: spacing.base,
    padding: 0,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: spacing.base,
  },
  source: {
    fontSize: typography.fontSizes.small,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium as '500',
    marginBottom: spacing.small,
  },
  headline: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.small,
    color: colors.dark,
  },
  summary: {
    fontSize: typography.fontSizes.regular,
    color: colors.gray,
    marginBottom: spacing.base,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  time: {
    fontSize: typography.fontSizes.small,
    color: colors.gray,
  },
  categoryContainer: {
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.tiny,
    paddingHorizontal: spacing.small,
    borderRadius: 4,
  },
  category: {
    fontSize: typography.fontSizes.tiny,
    fontWeight: typography.fontWeights.bold as 'bold',
    color: colors.dark,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxlarge,
  },
  emptyText: {
    fontSize: typography.fontSizes.medium,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.base,
  },
});

export default NewsScreen;
