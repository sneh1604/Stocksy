import axios from 'axios';
import { FINNHUB_API_KEY } from '../config/constants';

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export const fetchMarketNews = async (count = 20): Promise<NewsItem[]> => {
  try {
    const response = await axios.get('https://finnhub.io/api/v1/news', {
      params: {
        category: 'general',
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.slice(0, count);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching market news:', error);
    return generateMockNews(count);
  }
};

export const fetchCompanyNews = async (symbol: string, count = 10): Promise<NewsItem[]> => {
  try {
    // Calculate dates for past week
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    const fromDate = lastWeek.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol,
        from: fromDate,
        to: toDate,
        token: FINNHUB_API_KEY
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.slice(0, count);
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return generateMockNews(count, symbol);
  }
};

// Generate mock news when API fails
function generateMockNews(count: number, symbol?: string): NewsItem[] {
  const news: NewsItem[] = [];
  const now = Math.floor(Date.now() / 1000); // Convert to seconds for consistency with API
  
  const titles = [
    "Markets rally as tech stocks surge",
    "Federal Reserve maintains interest rates",
    "Inflation data shows signs of cooling",
    "Retail investors drive new market trends",
    "Earnings season begins with positive outlook",
    "Global markets react to economic data",
    "Cryptocurrency markets show volatility",
    "Supply chain issues impact production",
    "New regulations affect financial sector",
    "Market analysts predict strong growth"
  ];
  
  const sources = ["MarketWatch", "Bloomberg", "CNBC", "Reuters", "Financial Times"];
  
  for (let i = 0; i < count; i++) {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    news.push({
      category: "general",
      datetime: now - (i * 3600), // Hours ago
      headline: symbol 
        ? `${symbol}: ${randomTitle}` 
        : randomTitle,
      id: i + 1,
      image: `https://picsum.photos/800/400?random=${i}`,
      related: symbol || "Markets",
      source: randomSource,
      summary: `This is a mock summary for ${symbol || 'market'} news item #${i+1}. This would contain a brief overview of the news article content. For actual data, please ensure your API key is valid.`,
      url: "https://example.com/news"
    });
  }
  
  return news;
}
