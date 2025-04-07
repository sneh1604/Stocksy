import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { loginUser, logoutUser } from './src/store/actions';
import { initializeUserPortfolio } from './src/store/actions/portfolioActions';
import { syncLocalTransactions } from './src/services/firestore';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default function App() {
  useEffect(() => {
    // Check for stored user data and initialize Redux store
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          store.dispatch(loginUser(user));
          // Initialize portfolio data if we have a stored user
          if (user.uid) {
            store.dispatch(initializeUserPortfolio(user.uid));
          }
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      }
    };

    checkStoredUser();

    // Setup Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        store.dispatch(loginUser(userData));
        
        // Initialize portfolio data on login
        store.dispatch(initializeUserPortfolio(user.uid));
        
        // Try to sync any pending local transactions
        syncLocalTransactions().catch(err => 
          console.error('Failed to sync local transactions:', err)
        );
      } else {
        await AsyncStorage.removeItem('user');
        store.dispatch(logoutUser());
      }
    });

    // Setup network listener to sync transactions when connection is restored
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && auth.currentUser) {
        console.log('Network connection restored, attempting to sync transactions');
        syncLocalTransactions().catch(err => 
          console.error('Failed to sync local transactions:', err)
        );
      }
    });

    // Setup periodic sync attempt
    const syncInterval = setInterval(() => {
      if (auth.currentUser) {
        syncLocalTransactions().catch(err => 
          console.error('Failed to sync local transactions during interval:', err)
        );
      }
    }, 60000); // Try every minute

    return () => {
      unsubscribe();
      unsubscribeNetInfo();
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppNavigator />
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}