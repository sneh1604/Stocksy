# Stocksy - Virtual Stock Trading Simulator

## Overview
Stocksy is a comprehensive stock trading simulator built with React Native that allows users to practice trading stocks risk-free using virtual currency. The app supports both international stocks and Indian market trading (BSE/NSE), providing a realistic trading experience with real-time market data.

## Key Features

### Authentication
- User registration and login using Firebase Authentication
- Persistent user sessions
- Profile management with display name support

### Portfolio Management
- Virtual balance of ₹10,00,000 (10 Lakh INR) for new users
- Real-time portfolio tracking
- Detailed transaction history
- Profit/Loss tracking for each holding
- Support for both USD and INR denominated stocks

### Stock Markets
#### International Markets
- Real-time stock quotes via Finnhub API
- Support for major US stocks (NASDAQ, NYSE)
- Stock search functionality
- Historical price data and charts

#### Indian Markets
- BSE (Bombay Stock Exchange) active stocks
- NSE (National Stock Exchange) active stocks
- Real-time trending stocks (top gainers/losers)
- IPO tracking and information
- Market news integration

### Trading Features
- Buy/Sell stock functionality
- Quick trade execution
- Real-time price updates
- Position sizing calculator
- Transaction confirmation system
- Offline transaction support with sync capabilities

### User Interface
- Dark theme optimized for trading
- Responsive design
- Real-time data updates
- Interactive charts and graphs
- Loading states and error handling

## Technical Stack

### Frontend
- React Native with Expo
- TypeScript for type safety
- Redux for state management
- React Navigation for routing

### Backend Services
- Firebase Authentication
- Cloud Firestore for data storage
- Real-time data synchronization

### APIs
- Finnhub API for international stocks
- Indian Stock API for BSE/NSE data
- Custom market data integration

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
