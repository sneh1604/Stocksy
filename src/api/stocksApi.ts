import { DEFAULT_STOCKS, FINNHUB_API_KEY, FINNHUB_FALLBACK_API_KEY } from '../config/constants';
import { usdToInr } from '../utils/currencyConverter';

// Use the primary API key or fall back to the secondary one
const API_KEY = FINNHUB_API_KEY || FINNHUB_FALLBACK_API_KEY;

/**
 * Fetches quote data for a specific stock symbol
 * @param symbol The stock symbol to fetch data for
 * @returns Quote data including price, change, and percentage change
 */
export const fetchStockQuote = async (symbol: string) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      symbol,
      price: data.c || 0, // Current price
      change: data.d || 0, // Change
      changePercent: data.dp || 0 // Change percent
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

/**
 * Fetches candle (OHLC) data for a specific stock symbol
 * @param symbol The stock symbol to fetch data for
 * @param resolution The data resolution (1, 5, 15, 30, 60, D, W, M)
 * @param from Unix timestamp for start date
 * @param to Unix timestamp for end date
 * @returns Candle data including prices and timestamps
 */
export const fetchStockCandles = async (
  symbol: string, 
  resolution = '5', 
  from = Math.floor((Date.now() - 86400000) / 1000), // 24 hours ago
  to = Math.floor(Date.now() / 1000) // now
) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
    const data = await response.json();
    
    if (data.error || data.s === 'no_data') {
      throw new Error(data.error || 'No candle data available');
    }
    
    return {
      prices: data.c, // Closing prices
      timestamps: data.t, // Timestamps
      volumes: data.v // Volumes
    };
  } catch (error) {
    console.error('Error fetching stock candles:', error);
    throw error;
  }
};

/**
 * Searches for stocks that match the query
 * @param query The search query string
 * @returns Array of matching stocks
 */
export const searchStocks = async (query: string) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.result || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
};

/**
 * Fetches market overview data including key indices
 * @returns Market data for major indices
 */
export const fetchMarketOverview = async () => {
  try {
    // In a real app, we would fetch this from an API
    // For now, generate simulated market data
    
    // Generate realistic but random data
    const generateMarketData = (baseValue: number, volatility: number) => {
      const change = (Math.random() * 2 - 1) * volatility;
      const value = baseValue + change;
      const changePercent = (change / baseValue) * 100;
      
      return {
        value: parseFloat(value.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };
    };
    
    return {
      sensex: generateMarketData(72848.5, 400), // Sensex base value with realistic volatility
      nifty: generateMarketData(22055.6, 120)   // Nifty base value with realistic volatility
    };
  } catch (error) {
    console.error('Error fetching market overview:', error);
    
    // Provide fallback data even on error
    return {
      sensex: { value: 72848.5, change: 0, changePercent: 0 },
      nifty: { value: 22055.6, change: 0, changePercent: 0 }
    };
  }
};

/**
 * Fetches default stock data for the main watchlist
 * @returns Array of stock data for default stocks
 */
export const fetchDefaultStocks = async () => {
  try {
    const stocksData = await Promise.all(
      DEFAULT_STOCKS.map(async (symbol) => {
        try {
          const quote = await fetchStockQuote(symbol);
          return {
            symbol,
            price: usdToInr(quote.price), // Convert price to INR
            change: quote.change,
            changePercent: quote.changePercent,
            name: getCompanyName(symbol), // Add company name for better UI
            currency: 'INR'
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );
    
    return stocksData.filter(Boolean); // Filter out any null values
  } catch (error) {
    console.error('Error fetching default stocks:', error);
    throw error;
  }
};

/**
 * Get a stock's company name based on symbol
 * In a real app, this would come from an API
 */
const getCompanyName = (symbol: string): string => {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corp.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corp.',
    'JPM': 'JPMorgan Chase',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.'
  };
  
  return companies[symbol] || symbol;
};