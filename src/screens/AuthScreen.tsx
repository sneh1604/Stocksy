import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);
    const navigation = useNavigation();
    
    // If user is already logged in, redirect to home
    useEffect(() => {
        if (user) {
            navigation.navigate('Home');
        }
    }, [user, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.formContainer}>
                {isLogin ? <LoginForm /> : <SignupForm />}
                
                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsLogin(!isLogin)}
                >
                    <Text style={styles.switchText}>
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#f5f5f5',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#007AFF',
        fontSize: 16,
    },
});

export default AuthScreen;