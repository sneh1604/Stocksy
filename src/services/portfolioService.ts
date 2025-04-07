import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Default portfolio for new users
const DEFAULT_BALANCE = 1000000; // 10 Lakh INR for Indian context

// Portfolio interface matching our Redux state
export interface PortfolioData {
  balance: number;
  holdings: {
    [symbol: string]: {
      shares: number;
      averagePrice: number;
    }
  };
}

/**
 * Get a user's portfolio from Firestore
 */
export const getUserPortfolio = async (userId: string): Promise<PortfolioData | null> => {
  if (!userId) {
    console.log('No userId provided to getUserPortfolio');
    // Return default portfolio for anonymous users
    return {
      balance: DEFAULT_BALANCE,
      holdings: {},
    };
  }

  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);
    
    if (portfolioSnap.exists()) {
      // Return existing portfolio data but omit the lastUpdated field
      const data = portfolioSnap.data();
      const { lastUpdated, ...portfolioData } = data;
      
      return portfolioData as PortfolioData;
    } else {
      // Create a new portfolio with default values
      const newPortfolio: PortfolioData = {
        balance: DEFAULT_BALANCE, // 10 Lakh INR
        holdings: {}
      };
      
      // We add the timestamp only on the Firestore side
      await setDoc(portfolioRef, {
        ...newPortfolio,
        lastUpdated: new Date().toISOString()
      });
      
      return newPortfolio;
    }
  } catch (error) {
    console.error('Error getting portfolio from Firestore:', error);
    console.log('Returning default portfolio due to error');
    
    // Return default portfolio if Firestore fails
    return {
      balance: DEFAULT_BALANCE,
      holdings: {},
    };
  }
};

/**
 * Update a user's portfolio in Firestore
 */
export const updateUserPortfolio = async (userId: string, portfolioData: PortfolioData): Promise<boolean> => {
  if (!userId) {
    console.log('No userId provided to updateUserPortfolio');
    return false;
  }
  
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    
    // Use ISO string for timestamp instead of serverTimestamp to avoid serialization issues
    const dataToUpdate = {
      ...portfolioData,
      lastUpdated: new Date().toISOString()
    };
    
    await updateDoc(portfolioRef, dataToUpdate);
    return true;
  } catch (error) {
    console.error('Error updating portfolio in Firestore:', error);
    
    // If document doesn't exist yet, create it
    try {
      const portfolioRef = doc(db, 'portfolios', userId);
      const dataToSet = {
        ...portfolioData,
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(portfolioRef, dataToSet);
      return true;
    } catch (secondError) {
      console.error('Failed to create portfolio document:', secondError);
      return false;
    }
  }
};

/**
 * Record a portfolio transaction in the user's history
 */
export const recordPortfolioUpdate = async (
  userId: string, 
  action: string,
  data: any
): Promise<void> => {
  if (!userId) {
    console.log('No userId provided to recordPortfolioUpdate');
    return;
  }
  
  try {
    const historyRef = doc(db, 'portfolio-history', userId);
    const historySnap = await getDoc(historyRef);
    
    const historyEntry = {
      action,
      data,
      timestamp: new Date().toISOString() // Use ISO string instead of serverTimestamp
    };
    
    if (historySnap.exists()) {
      await updateDoc(historyRef, {
        updates: arrayUnion(historyEntry)
      });
    } else {
      await setDoc(historyRef, {
        updates: [historyEntry]
      });
    }
  } catch (error) {
    console.error('Error recording portfolio update:', error);
  }
};
