import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { fetchBSEMostActive, fetchNSEMostActive } from '../../api/indianStockApi';
import StockCard from '../stocks/StockCard';
import Loading from '../common/Loading';
import { colors, spacing } from '../../theme';

const Tab = createMaterialTopTabNavigator();

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  name?: string;
}

const BSEList = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBSEStocks();
  }, []);

  const loadBSEStocks = async () => {
    try {
      const data = await fetchBSEMostActive();
      setStocks(data);
    } catch (error) {
      console.error('Error loading BSE stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (symbol: string, price: number) => {
    console.log(`Stock pressed: ${symbol}, Price: ${price}`);
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={({ item }) => (
          <StockCard 
            stock={item} 
            onPress={() => handleStockPress(item.symbol, item.price)}
          />
        )}
        keyExtractor={item => item.symbol}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const NSEList = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNSEStocks();
  }, []);

  const loadNSEStocks = async () => {
    try {
      const data = await fetchNSEMostActive();
      setStocks(data);
    } catch (error) {
      console.error('Error loading NSE stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockPress = (symbol: string, price: number) => {
    console.log(`Stock pressed: ${symbol}, Price: ${price}`);
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={({ item }) => (
          <StockCard 
            stock={item} 
            onPress={() => handleStockPress(item.symbol, item.price)}
          />
        )}
        keyExtractor={item => item.symbol}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const MostActiveTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="BSE" component={BSEList} />
      <Tab.Screen name="NSE" component={NSEList} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.medium,
  },
});

export default MostActiveTab;
