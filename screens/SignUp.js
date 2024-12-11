import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { createAccount } from './utils/backendUtils';

export default function SignUp({ route, navigation }) {
    const { userProfile } = route.params;
    const [username, setUsername] = useState(userProfile.display_name || '');
    const [profilePic, setProfilePic] = useState(userProfile.images?.[0]?.url || null);
    const [email] = useState(userProfile.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        try {
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

            setErrorMessage('');

            setIsLoading(true);

            const userProfileData = {
                id: userProfile.id,
                username,
                email,
                password,
                profilePicUri: profilePic,
                isGhostMode: false,
                isGridView: false
            };

            const newAccount = await createAccount(userProfileData);
            console.log('Account created successfully:', newAccount);

            const accessToken = await AsyncStorage.getItem('spotifyAccessToken');
            navigation.navigate('Map', { token: accessToken });
        } catch (error) {
            console.error('Error creating account:', error);
            setErrorMessage('Error creating account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeProfilePic = async () => {
        setIsLoading(true);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access media library is required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setProfilePic(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting profile picture:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#CA5038" />
                </View>
            </Modal>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>&lt; Back</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Sign Up</Text>
                    </View>

                    <Text style={styles.label}>Profile Picture</Text>
                    {profilePic ? (
                        <Image source={{ uri: profilePic }} style={styles.profilePic} />
                    ) : (
                        <View style={styles.profilePicPlaceholder}>
                            <Text style={styles.profilePicPlaceholderText}>No Profile Pic</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.button} onPress={handleChangeProfilePic}>
                        <Text style={styles.buttonText}>Change Profile Picture</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                    />
                    <Text style={styles.passwordRequirements}>
                        Password must be at least 8 characters long, include one uppercase letter, and one
                        number.
                    </Text>

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        secureTextEntry
                    />

                    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                    <TouchableOpacity style={styles.submitButton} onPress={() => {
                        setIsLoading(true);
                        setTimeout(handleSignUp, 0);
                    }}>
                        <Text style={styles.submitButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8EEDF',
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    backButton: {
        marginTop: 40,
    },
    backButtonText: {
        color: '#CA5038',
        fontWeight: 'bold',
        fontSize: 24,
    },
    headerContainer: {
        backgroundColor: '#CA5038',
        alignSelf: 'center',
        padding: 5,
        borderRadius: 20,
        marginBottom: 40,
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
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
