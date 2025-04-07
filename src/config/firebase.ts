import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDZPihbj5jmu-1pSCEqKS484uZK8_jTgYg",
  authDomain: "stock-simulator-app-8ebef.firebaseapp.com",
  projectId: "stock-simulator-app-8ebef",
  storageBucket: "stock-simulator-app-8ebef.appspot.com",
  messagingSenderId: "724165861449",
  appId: "1:724165861449:web:b9cad8a4b8d02f54f45f98"
};

const app = initializeApp(firebaseConfig);

// Initialize auth
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db, app };
export default firebaseConfig;
