import { INDIAN_STOCK_API_KEY, INDIAN_STOCK_API_BASE_URL } from '../config/constants';

// Validate API key
if (!INDIAN_STOCK_API_KEY) {
  throw new Error('Indian Stock API key is not configured. Please set INDIAN_STOCK_API_KEY in your constants file.');
}

const headers = {
  'X-Api-Key': INDIAN_STOCK_API_KEY,  // Updated header name
  'Content-Type': 'application/json'
};

const handleApiResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid or expired API key. Please check your API key configuration.');
  }
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error: ${text}`);
  }
  
  try {
    const data = await response.json();
    if (data.error) {
      if (data.error.includes('api key')) {
        throw new Error('API key error: ' + data.error);
      }
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid API response format');
    }
    throw error;
  }
};

export interface IndianStockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  companyName: string;
}

export interface IPOData {
  symbol: string;
  companyName: string;
  issuePrice: number;
  lotSize: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
}

export const fetchIndianStockQuote = async (symbol: string): Promise<IndianStockQuote> => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/stock?symbol=${symbol}`, { headers });
    const data = await handleApiResponse(response);
    
    return {
      symbol: data.symbol,
      price: parseFloat(data.currentPrice),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.changePercent),
      volume: parseInt(data.volume),
      companyName: data.companyName
    };
  } catch (error) {
    console.error('Error fetching Indian stock quote:', error);
    throw error;
  }
};

export const fetch52WeekHighLow = async () => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/fetch_52_week_high_low_data`, { headers });
    const data = await handleApiResponse(response);
    
    return {
      fiftyTwoWeekHigh: data.high,
      fiftyTwoWeekLow: data.low
    };
  } catch (error) {
    console.error('Error fetching 52 week high/low:', error);
    throw error;
  }
};

export const fetchTrendingStocks = async () => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/trending`, { 
      method: 'GET',
      headers 
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    return []; // Return empty array as fallback
  }
};

export const fetchIPOData = async () => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/ipo`, { headers });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    return []; // Return empty array as fallback
  }
};

export const fetchBSEMostActive = async () => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/stock?exchange=BSE&name=active`, { headers });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching BSE stocks:', error);
    return []; // Return empty array as fallback
  }
};

export const fetchNSEMostActive = async () => {
  try {
    const response = await fetch(`${INDIAN_STOCK_API_BASE_URL}/stock?exchange=NSE&name=active`, { headers });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching NSE stocks:', error);
    return []; // Return empty array as fallback
  }
};
