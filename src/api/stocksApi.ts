import axios from 'axios';
import { ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL } from '../config/constants';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  console.log(`[API] Fetching stock quote for symbol: ${symbol}`);
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    console.log(`[API] Successfully fetched quote for ${symbol}`);

    const quote = response.data['Global Quote'];
    const result = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
    };
    console.log('[API] Processed quote data:', result);
    return result;
  } catch (error) {
    console.error(`[API] Error fetching stock quote for ${symbol}:`, error);
    throw error;
  }
};

export const searchStocks = async (query: string) => {
  console.log(`[API] Searching stocks with query: ${query}`);
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    console.log(`[API] Successfully completed stock search for "${query}"`);

    const results = response.data.bestMatches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      region: match['4. region'],
      type: match['3. type']
    }));
    console.log('[API] Processed search results:', results);
    return results;
  } catch (error) {
    console.error(`[API] Error searching stocks with query "${query}":`, error);
    throw error;
  }
};

export const fetchStockIntraday = async (symbol: string) => {
  console.log(`[API] Fetching intraday data for symbol: ${symbol}`);
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval: '5min',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    console.log(`[API] Successfully fetched intraday data for ${symbol}`);
    
    const result = response.data['Time Series (5min)'];
    console.log('[API] Processed intraday data:', { 
      symbol, 
      dataPoints: Object.keys(result).length 
    });
    return result;
  } catch (error) {
    console.error(`[API] Error fetching intraday data for ${symbol}:`, error);
    throw error;
  }
};