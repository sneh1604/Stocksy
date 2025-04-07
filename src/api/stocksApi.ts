import axios from 'axios';
import { FINNHUB_API_KEY, FINNHUB_BASE_URL, DEFAULT_STOCKS } from '../config/constants';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: { 
        symbol, 
        token: FINNHUB_API_KEY 
      }
    });

    const data = response.data;
    if (!data || typeof data.c === 'undefined') {
      throw new Error('Invalid API response');
    }

    return {
      symbol,
      price: Number(data.c) || 0,
      change: Number(data.d) || 0,
      changePercent: Number(data.dp) || 0
    };
  } catch (error) {
    console.error(`[API] Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

export const searchStocks = async (query: string) => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
      params: {
        q: query,
        token: FINNHUB_API_KEY
      }
    });

    return response.data.result.map((item: any) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const fetchStockCandles = async (symbol: string) => {
  try {
    // Check if the API key is valid
    if (!FINNHUB_API_KEY || FINNHUB_API_KEY.includes('dummy')) {
      console.warn('Invalid or demo Finnhub API key detected');
      return generateMockCandleData();
    }
    
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution: '30', // 30-minute intervals
        from: oneDayAgo,
        to: now,
        token: FINNHUB_API_KEY
      }
    });

    if (!response.data || response.data.s === 'no_data') {
      console.log(`No candle data available for ${symbol}, using mock data`);
      return generateMockCandleData();
    }

    return {
      timestamps: response.data.t,
      prices: response.data.c,
      volumes: response.data.v
    };
  } catch (error) {
    console.error(`[API] Error fetching candles for ${symbol}:`, error);
    console.log(`Using mock candle data for ${symbol}`);
    return generateMockCandleData();
  }
};

// Generate mock candle data when the API fails
function generateMockCandleData() {
  const now = Math.floor(Date.now() / 1000);
  const timestamps = [];
  const prices = [];
  const volumes = [];
  
  // Generate 24 hours of 30-minute interval data
  for (let i = 0; i < 48; i++) {
    timestamps.push(now - (i * 30 * 60)); // 30 minute intervals
    // Random price between 90 and 110
    prices.push(100 + Math.random() * 20 - 10);
    // Random volume
    volumes.push(Math.floor(Math.random() * 10000) + 1000);
  }
  
  // Reverse arrays so they're in chronological order
  return {
    timestamps: timestamps.reverse(),
    prices: prices.reverse(),
    volumes: volumes.reverse()
  };
}

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;

export const startRealtimeUpdates = (symbols: string[], callback: (data: any) => void) => {
  ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

  ws.onopen = () => {
    console.log('Connected to Finnhub WebSocket');
    symbols.forEach(symbol => {
      ws?.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'trade') {
      callback(data);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return () => {
    if (ws) {
      symbols.forEach(symbol => {
        ws?.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      });
      ws.close();
    }
  };
};

export const fetchStockIntraday = async (symbol: string) => {
  try {
    // Check if the API key is valid
    if (!FINNHUB_API_KEY || FINNHUB_API_KEY.includes('dummy')) {
      console.warn('Invalid or demo Finnhub API key detected');
      return generateMockIntradayData();
    }
    
    const now = Math.floor(Date.now() / 1000);
    const start = now - (24 * 60 * 60);

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution: '5',
        from: start,
        to: now,
        token: FINNHUB_API_KEY
      }
    });

    if (!response.data || response.data.s === 'no_data') {
      return generateMockIntradayData();
    }

    return {
      timestamps: response.data.t || [],
      prices: response.data.c || [],
      volumes: response.data.v || []
    };
  } catch (error) {
    console.error(`[API] Error fetching intraday data for ${symbol}:`, error);
    return generateMockIntradayData();
  }
};

function generateMockIntradayData() {
  const now = Math.floor(Date.now() / 1000);
  const timestamps = [];
  const prices = [];
  const volumes = [];
  
  // Generate 24 hours of 5-minute interval data
  for (let i = 0; i < 288; i++) {
    timestamps.push(now - (i * 5 * 60)); // 5 minute intervals
    prices.push(100 + Math.sin(i/10) * 5 + (Math.random() * 2 - 1));
    volumes.push(Math.floor(Math.random() * 5000) + 500);
  }
  
  return {
    timestamps: timestamps.reverse(),
    prices: prices.reverse(),
    volumes: volumes.reverse()
  };
}