import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { loginUser } from '../../store/actions';
import { RootState } from '../../store/types';
import { AnyAction } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors } from '../../theme/darkTheme';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Store auth data in AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            }));
            
            dispatch(loginUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            }));
            setEmail('');
            setPassword('');
        } catch (error: any) {
            const errorMessage = error.code === 'auth/user-not-found' 
                ? 'No account found with this email' 
                : error.message;
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: darkColors.background }]}>
            <Text style={[styles.title, { color: darkColors.text }]}>Welcome Back</Text>
            <TextInput
                style={[styles.input, {
                    backgroundColor: darkColors.surface,
                    borderColor: darkColors.border,
                    color: darkColors.text
                }]}
                placeholder="Email"
                placeholderTextColor={darkColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, {
                    backgroundColor: darkColors.surface,
                    borderColor: darkColors.border,
                    color: darkColors.text
                }]}
                placeholder="Password"
                placeholderTextColor={darkColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity 
                style={[
                    styles.button, 
                    loading && styles.buttonDisabled,
                    { backgroundColor: loading ? darkColors.disabledButton : darkColors.primary }
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={[styles.buttonText, { color: darkColors.text }]}>
                    {loading ? 'Logging in...' : 'Login'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginForm;
