import { initializeApp } from 'firebase/app';
import { FirebaseOptions } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from '../config/firebase';

const config: FirebaseOptions = firebaseConfig;

// Use the existing Firebase instance from the auth setup
import { db } from '../config/firebase';

// Local storage for transactions when Firestore fails
let localTransactions: any[] = [];

// Load cached local transactions on service init
(async () => {
  try {
    const storedTransactions = await AsyncStorage.getItem('localTransactions');
    if (storedTransactions) {
      localTransactions = JSON.parse(storedTransactions);
      console.log(`Loaded ${localTransactions.length} cached transactions`);
    }
  } catch (error) {
    console.error('Failed to load cached transactions:', error);
  }
})();

// Save local transactions to AsyncStorage
const saveLocalTransactionsToCache = async () => {
  try {
    await AsyncStorage.setItem('localTransactions', JSON.stringify(localTransactions));
  } catch (error) {
    console.error('Failed to cache transactions:', error);
  }
};

export const saveTransaction = async (transaction: {
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}) => {
  if (!transaction.userId) {
    throw new Error('User ID is required');
  }

  try {
    // First try to save to Firestore
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      timestamp: transaction.timestamp.toISOString(),
      createdAt: serverTimestamp()
    });
    
    console.log('[Firestore] Transaction saved:', docRef.id);
    
    // If successful, also update portfolio
    await updatePortfolioWithTransaction(transaction);
    
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error saving transaction:', error);
    
    // Store transaction locally as fallback
    const localTransaction = {
      id: `local_${Date.now()}`,
      ...transaction,
      timestamp: transaction.timestamp.toISOString(),
      createdAt: new Date().toISOString(),
      savedLocally: true,
      syncPending: true
    };
    
    // Save to local cache
    localTransactions.push(localTransaction);
    await saveLocalTransactionsToCache();
    
    // Still update portfolio locally
    try {
      await updatePortfolioWithTransaction(transaction);
    } catch (portfolioError) {
      console.error('[Local] Error updating portfolio:', portfolioError);
    }
    
    console.log('[Local] Transaction saved locally:', localTransaction.id);
    return localTransaction.id;
  }
};

// Update the portfolio document based on the transaction
export const updatePortfolioWithTransaction = async (transaction: {
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
}) => {
  try {
    const portfolioRef = doc(db, 'portfolios', transaction.userId);
    const portfolioDoc = await getDoc(portfolioRef);
    
    // If portfolio exists, update it
    if (portfolioDoc.exists()) {
      const portfolioData = portfolioDoc.data();
      const holdings = portfolioData.holdings || {};
      const currentHolding = holdings[transaction.symbol] || { shares: 0, averagePrice: 0 };
      let balance = portfolioData.balance || 0;
      
      if (transaction.type === 'buy') {
        // Calculate new average price
        const totalShares = currentHolding.shares + transaction.shares;
        const totalCost = (currentHolding.shares * currentHolding.averagePrice) + (transaction.shares * transaction.price);
        const newAveragePrice = totalShares > 0 ? totalCost / totalShares : 0;
        
        // Update holdings and decrease balance
        holdings[transaction.symbol] = {
          shares: totalShares,
          averagePrice: newAveragePrice
        };
        balance -= transaction.total;
      } else {
        // Selling - update shares and increase balance
        const remainingShares = currentHolding.shares - transaction.shares;
        
        if (remainingShares > 0) {
          // Keep same average price if still have shares
          holdings[transaction.symbol] = {
            shares: remainingShares,
            averagePrice: currentHolding.averagePrice
          };
        } else {
          // Remove the holding completely if no shares left
          delete holdings[transaction.symbol];
        }
        
        balance += transaction.total;
      }
      
      // Update the portfolio
      await updateDoc(portfolioRef, {
        holdings,
        balance,
        lastUpdated: new Date().toISOString()
      });
      
      return true;
    } else {
      // Create new portfolio if it doesn't exist
      const DEFAULT_BALANCE = 1000000; // 10 lakh INR
      let newPortfolio = {
        balance: DEFAULT_BALANCE,
        holdings: {},
        lastUpdated: new Date().toISOString()
      };
      
      if (transaction.type === 'buy') {
        newPortfolio.holdings = {
          [transaction.symbol]: {
            shares: transaction.shares,
            averagePrice: transaction.price
          }
        };
        newPortfolio.balance = DEFAULT_BALANCE - transaction.total;
      }
      
      await setDoc(portfolioRef, newPortfolio);
      return true;
    }
  } catch (error) {
    console.error('[Firestore] Error updating portfolio with transaction:', error);
    
    // Try to store portfolio data locally
    try {
      const portfolioData = await AsyncStorage.getItem(`portfolio_${transaction.userId}`);
      let portfolio = portfolioData ? JSON.parse(portfolioData) : { 
        balance: 1000000, // Default 10 lakh INR
        holdings: {} 
      };
      
      // Update local portfolio same way as Firestore
      const holdings = portfolio.holdings || {};
      const currentHolding = holdings[transaction.symbol] || { shares: 0, averagePrice: 0 };
      
      if (transaction.type === 'buy') {
        // Calculate new average price
        const totalShares = currentHolding.shares + transaction.shares;
        const totalCost = (currentHolding.shares * currentHolding.averagePrice) + 
                        (transaction.shares * transaction.price);
        const newAveragePrice = totalShares > 0 ? totalCost / totalShares : 0;
        
        holdings[transaction.symbol] = {
          shares: totalShares,
          averagePrice: newAveragePrice
        };
        portfolio.balance -= transaction.total;
      } else {
        // Selling - update shares and increase balance
        const remainingShares = currentHolding.shares - transaction.shares;
        
        if (remainingShares > 0) {
          holdings[transaction.symbol] = {
            shares: remainingShares,
            averagePrice: currentHolding.averagePrice
          };
        } else {
          delete holdings[transaction.symbol];
        }
        
        portfolio.balance += transaction.total;
      }
      
      portfolio.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(`portfolio_${transaction.userId}`, JSON.stringify(portfolio));
      return true;
    } catch (localError) {
      console.error('[Local] Failed to update portfolio locally:', localError);
      return false;
    }
  }
};

export const getUserTransactions = async (userId: string) => {
  try {
    // First try to get from Firestore
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const firestoreTransactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fromFirestore: true
    }));
    
    // Combine with local transactions
    const allTransactions = [
      ...firestoreTransactions,
      ...localTransactions.filter(t => t.userId === userId)
    ];
    
    // Sort by timestamp (newest first)
    return allTransactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('[Firestore] Error fetching user transactions:', error);
    // Return only local transactions on error
    return localTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};

// Try to sync pending local transactions to Firestore
export const syncLocalTransactions = async () => {
  if (localTransactions.length === 0) return;
  
  const pendingTransactions = localTransactions.filter(t => t.syncPending);
  if (pendingTransactions.length === 0) return;
  
  console.log(`Attempting to sync ${pendingTransactions.length} local transactions to Firestore`);
  
  for (const transaction of pendingTransactions) {
    try {
      // Remove local properties
      const { id, savedLocally, syncPending, createdAt, ...firestoreTransaction } = transaction;
      
      // Try to save to Firestore
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...firestoreTransaction,
        createdAt: serverTimestamp()
      });
      
      console.log(`Successfully synced transaction ${id} to Firestore as ${docRef.id}`);
      
      // Remove from local transactions
      localTransactions = localTransactions.filter(t => t.id !== id);
    } catch (error) {
      console.error(`Failed to sync transaction ${transaction.id}:`, error);
    }
  }
  
  // Save updated local transactions
  await saveLocalTransactionsToCache();
};

// Get user portfolio with local fallback
export const getUserPortfolio = async (userId: string) => {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioDoc = await getDoc(portfolioRef);
    
    if (portfolioDoc.exists()) {
      return portfolioDoc.data();
    } else {
      // Try to get local portfolio
      const localPortfolio = await AsyncStorage.getItem(`portfolio_${userId}`);
      if (localPortfolio) {
        return JSON.parse(localPortfolio);
      }
      
      // Create default portfolio
      const DEFAULT_BALANCE = 1000000; // 10 lakh INR
      const newPortfolio = {
        balance: DEFAULT_BALANCE,
        holdings: {},
        lastUpdated: new Date().toISOString()
      };
      
      // Try to save to Firestore
      try {
        await setDoc(portfolioRef, newPortfolio);
      } catch (saveError) {
        console.error('[Firestore] Failed to save new portfolio:', saveError);
        // Save locally as fallback
        await AsyncStorage.setItem(`portfolio_${userId}`, JSON.stringify(newPortfolio));
      }
      
      return newPortfolio;
    }
  } catch (error) {
    console.error('[Firestore] Error getting portfolio:', error);
    
    // Try local portfolio
    try {
      const localPortfolio = await AsyncStorage.getItem(`portfolio_${userId}`);
      if (localPortfolio) {
        return JSON.parse(localPortfolio);
      }
    } catch (localError) {
      console.error('[Local] Error getting portfolio:', localError);
    }
    
    // Return default portfolio
    return {
      balance: 1000000,
      holdings: {},
      lastUpdated: new Date().toISOString()
    };
  }
};

// Add a helper function to get Firestore rules
export const getFirestoreRules = () => {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to transactions for authenticated users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow users to manage their own portfolios
    match /portfolios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
};
