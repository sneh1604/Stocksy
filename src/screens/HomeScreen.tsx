import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StockList from '../components/stocks/StockList';
import Portfolio from '../components/stocks/Portfolio';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stock Simulator</Text>
            <Portfolio />
            <StockList />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default HomeScreen;