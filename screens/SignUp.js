import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { createAccount } from './utils/backendUtils';

/**
 * SignUp.js
 * Allows users to sign up for the app with prefilled data from Spotify.
 * Includes fields for username, profile picture, email (grayed out), password, and confirm password.
 */

export default function SignUp({ route, navigation }) {
    const { userProfile } = route.params;
    const [username, setUsername] = useState(userProfile.display_name || '');
    const [profilePic, setProfilePic] = useState(userProfile.images?.[0]?.url || null);
    const [email] = useState(userProfile.email || ''); // Ensure email is set
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async () => {
        try {
            // Validate password and confirm password
            if (password.length < 8) {
                setErrorMessage('Password must be at least 8 characters long.');
                return;
            }

            if (!/[A-Z]/.test(password)) {
                setErrorMessage('Password must contain at least one uppercase letter.');
                return;
            }

            if (!/[0-9]/.test(password)) {
                setErrorMessage('Password must contain at least one number.');
                return;
            }

            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match.');
                return;
            }

            // Clear error message
            setErrorMessage('');

            // Prepare user profile data
            const userProfileData = {
                username,
                email,
                password,
                profilePicUri: profilePic, // Use the updated profilePic state
            };

            // Call createAccount from backendUtils
            const newAccount = await createAccount(userProfileData);
            console.log('Account created successfully:', newAccount);

            // Navigate to the next screen
            const accessToken = await AsyncStorage.getItem('spotifyAccessToken');
            navigation.navigate('Map', { token: accessToken });
        } catch (error) {
            console.error('Error creating account:', error);
            setErrorMessage('Error creating account. Please try again.');
        }
    };

    const handleChangeProfilePic = async () => {
        try {
            // Request media library permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access media library is required.');
                return;
            }

            // Launch the image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio
                quality: 1,
            });

            if (!result.canceled) {
                setProfilePic(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error changing profile picture:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Sign Up</Text>
            </View>

            {/* Profile Picture */}
            <Text style={styles.label}>Profile Picture</Text>
            {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
                <View style={styles.profilePicPlaceholder}>
                    <Text style={styles.profilePicPlaceholderText}>No Profile Pic</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    // TODO: Add functionality to upload a new profile picture
                    console.log('Upload new profile pic');
                }}
            >
                <Text style={styles.buttonText} onPress={handleChangeProfilePic}>Change Profile Picture</Text>
            </TouchableOpacity>

            {/* Username */}
            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
            />

            {/* Email (Read-only) */}
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
            />
            <Text style={styles.passwordRequirements}>
                Password must be at least 8 characters long, include one uppercase letter, and one number.
            </Text>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
            />

            {/* Error Message */}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
                <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8EEDF',
    },
    headerContainer: {
        backgroundColor: '#CA5038',
        alignSelf: 'center',
        padding: 5,
        borderRadius: 20,
        marginVertical: 40,
        width: 200,
    },
    header: {
        textAlign: 'center',
        color: '#F8EEDF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    profilePicPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profilePicPlaceholderText: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#28A745',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    passwordRequirements: {
        fontSize: 12,
        color: '#777',
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
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
