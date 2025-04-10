import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import { SearchStockScreen } from '../screens/SearchStockScreen';
import AuthScreen from '../screens/AuthScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import NewsScreen from '../screens/NewsScreen';

import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Tab navigator for main screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchStock') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'TransactionHistory') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.dark,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="SearchStock" 
        component={SearchStockScreen}
        options={{
          title: 'Search'
        }}
      />
      <Tab.Screen 
        name="News" 
        component={NewsScreen}
        options={{
          title: 'News'
        }}
      />
      <Tab.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{
          title: 'History'
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.dark,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="Main"
          component={TabNavigator}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="StockDetails"
          component={StockDetailScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.symbol,
          })}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{
            headerShown: false,
            title: 'Login / Sign Up',
            // This will prevent going back to the home screen
            headerBackVisible: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
