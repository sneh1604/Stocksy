import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZPihbj5jmu-1pSCEqKS484uZK8_jTgYg",
  authDomain: "stock-simulator-app-8ebef.firebaseapp.com",
  projectId: "stock-simulator-app-8ebef",
  storageBucket: "stock-simulator-app-8ebef",
  messagingSenderId: "724165861449",
  appId: "1:724165861449:web:b9cad8a4b8d02f54f45f98"
};

let app;
let firebaseAuth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(app);
} else {
  app = getApp();
  firebaseAuth = getAuth(app);
}

const db = getFirestore(app);

export { firebaseAuth as auth, db };
export default app;
