import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Portfolio from '../components/stocks/Portfolio';
import { RootState } from '../store/types';
import { logoutUser } from '../store/actions';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { getFirestoreRules } from '../services/firestore';
import { colors, typography, spacing } from '../theme';
import { darkColors } from '../theme/darkTheme';

// Define proper navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Reload data here
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleAuthButton = async () => {
        if (user) {
            try {
                await auth.signOut();
                await AsyncStorage.removeItem('user');
                dispatch(logoutUser());
            } catch (error) {
                console.error('Error signing out:', error);
            }
        } else {
            navigation.navigate('Auth');
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text style={[styles.headerTitle, { color: darkColors.text }]}>Stock Simulator</Text>
            ),
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SearchStock')}
                        style={styles.headerButton}
                    >
                        <Ionicons name="search" size={22} color={darkColors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleAuthButton}
                        style={styles.headerButton}
                    >
                        <Ionicons 
                            name={user ? "log-out" : "log-in"} 
                            size={22} 
                            color={darkColors.primary} 
                        />
                    </TouchableOpacity>
                </View>
            ),
            headerStyle: {
                backgroundColor: darkColors.surface,
            },
            headerShadowVisible: false,
        });
    }, [navigation, user]);

    // Add a useEffect to show a one-time notice about Firestore rules
    React.useEffect(() => {
        // Show this once if user is logged in
        if (user) {
            const showFirestoreHelp = async () => {
                const hasShownFirestoreHelp = await AsyncStorage.getItem('hasShownFirestoreHelp');
                if (!hasShownFirestoreHelp) {
                    setTimeout(() => {
                        Alert.alert(
                            'Firestore Permissions',
                            'To fix transaction saving errors, you need to update your Firebase security rules.',
                            [
                                { 
                                    text: 'Show Instructions', 
                                    onPress: () => {
                                        Alert.alert(
                                            'Fix Firebase Rules',
                                            'Follow these steps:\n\n' +
                                            '1. Go to your Firebase Console\n' +
                                            '2. Select your project\n' +
                                            '3. Go to "Firestore Database"\n' +
                                            '4. Click on "Rules" tab\n' +
                                            '5. Replace the rules with the ones created in your project\'s "firestore.rules" file\n' +
                                            '6. Click "Publish"',
                                            [{ text: 'OK', style: 'default' }]
                                        );
                                    }
                                },
                                { 
                                    text: 'Don\'t Show Again', 
                                    onPress: () => {
                                        AsyncStorage.setItem('hasShownFirestoreHelp', 'true');
                                    } 
                                }
                            ]
                        );
                    }, 2000);
                }
            };
            
            showFirestoreHelp();
        }
    }, [user]);

    if (!user) {
        return (
            <View style={[styles.authPrompt, { backgroundColor: darkColors.background }]}>
                <Ionicons name="bar-chart" size={80} color={darkColors.primary} style={styles.appIcon} />
                <Text style={[styles.appTitle, { color: darkColors.text }]}>Stocksy</Text>
                <Text style={[styles.authText, { color: darkColors.textSecondary }]}>
                    Practice investing with virtual money and learn to trade stocks risk-free
                </Text>
                <TouchableOpacity
                    style={[styles.authButton, { backgroundColor: darkColors.primary }]}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <Text style={[styles.authButtonText, { color: darkColors.text }]}>Login / Sign Up</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Use FlatList as container for the portfolio section
    return (
        <FlatList
            style={[styles.container, { backgroundColor: darkColors.background }]}
            data={[]} // Empty data array since we're using header component
            keyExtractor={() => 'portfolio'}
            renderItem={null}
            ListHeaderComponent={() => (
                <>
                    {user && (
                        <View style={[styles.welcomeContainer, { backgroundColor: darkColors.surface }]}>
                            <Text style={[styles.welcomeText, { color: darkColors.text }]}>
                                Welcome, {user?.displayName || user?.email?.split('@')[0] || 'Trader'}
                            </Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, { backgroundColor: darkColors.surfaceVariant }]}
                                    onPress={() => navigation.navigate('TransactionHistory')}
                                >
                                    <Ionicons name="time-outline" size={16} color={darkColors.primary} />
                                    <Text style={[styles.actionButtonText, { color: darkColors.primary }]}>History</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.actionButton, { backgroundColor: darkColors.surfaceVariant }]}
                                    onPress={() => navigation.navigate('SearchStock')}
                                >
                                    <Ionicons name="search" size={16} color={darkColors.primary} />
                                    <Text style={[styles.actionButtonText, { color: darkColors.primary }]}>Find Stocks</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <Portfolio />
                </>
            )}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    colors={[colors.primary]}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    headerTitle: {
        fontSize: typography.fontSizes.large,
        fontWeight: typography.fontWeights.bold as "bold",
        color: colors.dark,
    },
    welcomeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
        backgroundColor: colors.background,
        zIndex: 10,
    },
    welcomeText: {
        fontSize: typography.fontSizes.medium,
        fontWeight: typography.fontWeights.medium as "500",
        color: colors.dark,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.small,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        marginLeft: spacing.small,
    },
    actionButtonText: {
        fontSize: typography.fontSizes.small,
        fontWeight: typography.fontWeights.medium as "500",
        color: colors.primary,
        marginLeft: 4,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginHorizontal: spacing.small,
    },
    authPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xlarge,
        backgroundColor: colors.background,
    },
    appIcon: {
        marginBottom: spacing.base,
    },
    appTitle: {
        fontSize: typography.fontSizes.xhuge,
        fontWeight: typography.fontWeights.bold as "bold",
        color: colors.dark,
        marginBottom: spacing.base,
    },
    authText: {
        fontSize: typography.fontSizes.medium,
        textAlign: 'center',
        color: colors.gray,
        marginBottom: spacing.xlarge,
    },
    authButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xlarge,
        paddingVertical: spacing.medium,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    authButtonText: {
        color: colors.white,
        fontSize: typography.fontSizes.large,
        fontWeight: typography.fontWeights.medium as "500",
    },
});

export default HomeScreen;