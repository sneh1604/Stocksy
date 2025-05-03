export const ALPHA_VANTAGE_API_KEY = 'demo';
export const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export const MOCK_STOCK_DATA = {
  'AAPL': { basePrice: 150, name: 'Apple Inc.' },
  'GOOGL': { basePrice: 2800, name: 'Alphabet Inc.' },
  'MSFT': { basePrice: 280, name: 'Microsoft Corporation' },
  'AMZN': { basePrice: 3300, name: 'Amazon.com Inc.' },
  'META': { basePrice: 330, name: 'Meta Platforms Inc.' }
};

// If you're getting API errors, replace this with a valid Finnhub API key
// Free keys are available at https://finnhub.io/register
export const FINNHUB_API_KEY = 'ctlrbqhr01qv7qq356pgctlrbqhr01qv7qq356q0'; // Replace with your API key
export const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// A fallback API key if above key doesn't work
export const FINNHUB_FALLBACK_API_KEY = 'sandbox_cg2e85qad3iaij1tvaig'; // Sandbox API key

export const DEFAULT_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];

export const INDIAN_STOCK_API_KEY = 'sk-live-q68c6TzuJtAuMbtSYL6ykLvXcYyBK2YoCt5qDefy';
export const INDIAN_STOCK_API_BASE_URL = 'https://stock.indianapi.in'; // Removed /api/v1

// Add some default Indian stocks
export const DEFAULT_INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'
];