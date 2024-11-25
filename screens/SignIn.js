import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmail } from './utils/backendUtils';

export default function SignIn({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignIn = async () => {
        try {
            // Validate email and password
            if (!email || !password) {
                setErrorMessage('Both email and password are required.');
                return;
            }

            // Authenticate user
            const { accessToken, refreshToken } = await signInWithEmail(email, password);

            // Save tokens to AsyncStorage
            await AsyncStorage.setItem('spotifyAccessToken', accessToken);
            await AsyncStorage.setItem('spotifyRefreshToken', refreshToken);

            // Navigate to Map screen
            navigation.navigate('Map', { token: accessToken });
        } catch (error) {
            console.error('Error during sign-in:', error);
            setErrorMessage('Invalid email or password. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>&lt; Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {/* App Logo */}
                <Image
                    source={require('../assets/logo/SoundScout.gif')}
                    style={styles.logo}
                />

                <Text style={styles.header}>Sign In</Text>

                {/* Email Input */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                />

                {/* Error Message */}
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSignIn}>
                    <Text style={styles.submitButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8EEDF',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 10,
    },
    backButton: {
        paddingTop: 40,
        paddingHorizontal: 10,
    },
    backButtonText: {
        color: '#CA5038',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    logo: {
        height: 200,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        marginBottom: 20,
    },
    error: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
