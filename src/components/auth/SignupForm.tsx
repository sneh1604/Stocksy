import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { darkColors } from '../../theme/darkTheme';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password should be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Success', 'Account created successfully!');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const errorMessage = error.code === 'auth/email-already-in-use'
                ? 'An account with this email already exists'
                : error.message;
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: darkColors.background }]}>
            <Text style={[styles.title, { color: darkColors.text }]}>Create Account</Text>
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
            <TextInput
                style={[styles.input, {
                    backgroundColor: darkColors.surface,
                    borderColor: darkColors.border,
                    color: darkColors.text
                }]}
                placeholder="Confirm Password"
                placeholderTextColor={darkColors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity 
                style={[
                    styles.button, 
                    loading && styles.buttonDisabled,
                    { backgroundColor: loading ? darkColors.disabledButton : darkColors.primary }
                ]}
                onPress={handleSignup}
                disabled={loading}
            >
                <Text style={[styles.buttonText, { color: darkColors.text }]}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
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
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SignupForm;