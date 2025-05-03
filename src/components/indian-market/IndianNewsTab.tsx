import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Modal, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { darkColors } from '../../theme/darkTheme';
import Card from '../common/Card';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  image_url: string;
  pub_date: string;
  source: string;
  topics: string[];
}

const API_KEY = 'sk-live-q68c6TzuJtAuMbtSYL6ykLvXcYyBK2YoCt5qDefy';
const BASE_URL = 'https://stock.indianapi.in';

const IndianNewsTab = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/news`, {
        headers: { 'X-Api-Key': API_KEY }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsPress = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const NewsDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!selectedNews}
      onRequestClose={() => setSelectedNews(null)}
    >
      <View style={[styles.modalContainer, { backgroundColor: darkColors.surface }]}>
        <ScrollView style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setSelectedNews(null)}
          >
            <Ionicons name="close" size={24} color={darkColors.text} />
          </TouchableOpacity>

          {selectedNews?.image_url && (
            <Image 
              source={{ uri: selectedNews.image_url }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
          )}

          <Text style={[styles.modalTitle, { color: darkColors.text }]}>{selectedNews?.title}</Text>
          
          <View style={styles.sourceContainer}>
            <Text style={[styles.source, { color: darkColors.textSecondary }]}>{selectedNews?.source}</Text>
            <Text style={[styles.date, { color: darkColors.textSecondary }]}>
              {formatDate(selectedNews?.pub_date || '')}
            </Text>
          </View>

          {selectedNews?.topics && (
            <View style={styles.topicsContainer}>
              {selectedNews.topics.map((topic, index) => (
                <View key={index} style={styles.topicTag}>
                  <Text style={[styles.topicText, { color: darkColors.text }]}>{topic}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.summary, { color: darkColors.textSecondary }]}>{selectedNews?.summary}</Text>

          <TouchableOpacity 
            style={[styles.readMoreButton, { backgroundColor: darkColors.primary }]}
            onPress={() => Linking.openURL(selectedNews?.url || '')}
          >
            <Text style={[styles.readMoreText, { color: darkColors.text }]}>
              Read Full Article
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={darkColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={darkColors.loss} />
        <Text style={[styles.errorText, { color: darkColors.loss }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: darkColors.primary }]} onPress={fetchNews}>
          <Text style={[styles.retryText, { color: darkColors.text }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkColors.background }]}>
      <FlatList
        data={news}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleNewsPress(item)}>
            <Card style={[styles.newsCard, { backgroundColor: darkColors.surface }]}>
              {item.image_url && (
                <Image 
                  source={{ uri: item.image_url }} 
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              )}
              <Text style={[styles.source, { color: darkColors.textSecondary }]}>{item.source}</Text>
              <Text style={[styles.title, { color: darkColors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: darkColors.textSecondary }]} numberOfLines={2}>
                {item.summary}
              </Text>
              <Text style={[styles.date, { color: darkColors.textSecondary }]}>{formatDate(item.pub_date)}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <NewsDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsCard: {
    marginBottom: spacing.medium,
  },
  source: {
    fontSize: typography.fontSizes.small,
    marginBottom: spacing.tiny,
  },
  title: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginBottom: spacing.small,
  },
  description: {
    fontSize: typography.fontSizes.small,
    marginBottom: spacing.small,
  },
  date: {
    fontSize: typography.fontSizes.tiny,
  },
  errorText: {
    marginTop: spacing.medium,
    fontSize: typography.fontSizes.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    borderRadius: 8,
  },
  retryText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  },
  modalContainer: {
    flex: 1,
    marginTop: 40,
  },
  modalContent: {
    flex: 1,
    padding: spacing.medium,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing.small,
  },
  modalTitle: {
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold as 'bold',
    marginVertical: spacing.medium,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  thumbnailImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.small,
  },
  sourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.medium,
  },
  topicTag: {
    backgroundColor: darkColors.primary + '20',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: 16,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  topicText: {
    fontSize: typography.fontSizes.small,
  },
  summary: {
    fontSize: typography.fontSizes.medium,
    lineHeight: 24,
    marginBottom: spacing.large,
  },
  readMoreButton: {
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.medium,
  },
  readMoreText: {
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium as '500',
  }
});

export default IndianNewsTab;
