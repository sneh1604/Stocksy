import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StockDetail from '../components/stocks/StockDetail';
import IndianStockDetail from '../components/indian-market/IndianStockDetail';
import { RootStackParamList } from '../navigation/types';
import { darkColors } from '../theme/darkTheme';

type StockDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'StockDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;
};

const StockDetailScreen: React.FC<StockDetailsScreenProps> = ({ route, navigation }) => {
  const { symbol, initialPrice, isIndianStock, companyName } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: darkColors.background }]}>
      {isIndianStock ? (
        <IndianStockDetail 
          symbol={symbol}
          initialPrice={initialPrice}
          companyName={companyName || symbol}  // Use symbol as fallback
          onClose={() => navigation.goBack()}
        />
      ) : (
        <StockDetail 
          symbol={symbol}
          initialPrice={initialPrice}
          companyName={companyName || symbol}  // Use symbol as fallback
          onClose={() => navigation.goBack()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StockDetailScreen;
