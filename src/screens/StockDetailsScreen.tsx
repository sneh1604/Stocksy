import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { darkColors } from '../theme/darkTheme';
import StockDetail from '../components/stocks/StockDetail';

type RootStackParamList = {
  StockDetails: { symbol: string };
};

type StockDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'StockDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'StockDetails'>;
};

const StockDetailsScreen: React.FC<StockDetailsScreenProps> = ({ route, navigation }) => {
  const { symbol } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: darkColors.background }]}>
      <StockDetail 
        symbol={symbol} 
        initialPrice={0} // Add an appropriate initial price value here
        onClose={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StockDetailsScreen;
