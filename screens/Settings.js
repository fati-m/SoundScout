import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import GridIcon from '../assets/logo/grid.svg';
import GhostIcon from '../assets/logo/ghost.svg';
import ProfileIcon from '../assets/logo/profile.svg';
import SignOutIcon from '../assets/logo/signOut.svg';
import DeleteAccountIcon from '../assets/logo/deleteAccount.svg';
import {
    fetchUserProfile,
    signOut,
    deleteAccount,
    validatePassword,
    updateDisplayName,
    updateProfilePicture,
    updatePassword,
    isGhostMode,
    toggleGhostMode,
    isGridView,
    toggleGridView
} from './utils/backendUtils';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings({ navigation }) {
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [password, setPassword] = useState('');
    const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [tempDisplayName, setTempDisplayName] = useState('');
    const [tempProfilePic, setTempProfilePic] = useState('');
    const [tempNewPassword, setTempNewPassword] = useState('');
    const [tempConfirmPassword, setTempConfirmPassword] = useState('');
    const [ghostModeEnabled, setGhostModeEnabled] = useState(false);
    const [isGridViewEnabled, setIsGridViewEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const resetTempFields = () => {
        setTempDisplayName(displayName);
        setTempProfilePic(profilePic);
        setTempNewPassword('');
        setTempConfirmPassword('');
    };

    useEffect(() => {
        if (showEditProfilePopup) {
            resetTempFields();
        }
    }, [showEditProfilePopup]);

    useEffect(() => {
        const fetchInitialGhostModeState = async () => {
            try {
                const ghostModeState = await isGhostMode();
                setGhostModeEnabled(ghostModeState);
            } catch (error) {
                console.error('Error fetching initial Ghost Mode state:', error.message);
            }
        };

        fetchInitialGhostModeState();
    }, []);

    useEffect(() => {
        const fetchInitialGridViewState = async () => {
            try {
                const gridViewState = await isGridView();
                setIsGridViewEnabled(gridViewState);
            } catch (error) {
                console.error('Error fetching initial Grid View state:', error.message);
            }
        };

        fetchInitialGridViewState();
    }, []);

    const handleDeleteAccount = async () => {
        try {
            setErrorMessage("");
            setIsLoading(true);

            const userId = await AsyncStorage.getItem('spotifyUserId');
            if (!userId) throw new Error('User ID not found in storage.');

            if (!password) {
                setErrorMessage("Please enter your password to confirm.");
                return;
            }

            const isValid = await validatePassword(userId, password);
            if (!isValid) {
                setErrorMessage("Incorrect password. Please try again.");
                return;
            }

            await deleteAccount(userId);
            await AsyncStorage.clear();
            setShowDeletePopup(false);

            navigation.navigate('Login');
        } catch (error) {
            console.error('Error deleting account:', error.message);
            setErrorMessage('Failed to delete account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeProfilePic = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access the camera roll is required.');
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
        }
    };

    const handleToggleGhostMode = async () => {
        try {
            const newGhostModeState = !ghostModeEnabled;
            console.log('Ghost Mode toggled in Settings:', newGhostModeState);

            const success = await toggleGhostMode(newGhostModeState);
            if (!success) {
                Alert.alert('Error', 'Failed to update Ghost Mode setting in Firebase. Please try again.');
                return;
            }

            setGhostModeEnabled(newGhostModeState);

            Alert.alert(
                newGhostModeState ? 'Ghost Mode Enabled' : 'Ghost Mode Disabled',
                newGhostModeState
                    ? 'Your location is now hidden from others.'
                    : 'Your location is now visible to others.'
            );
        } catch (error) {
            console.error('Error toggling Ghost Mode:', error.message);
            Alert.alert('Error', 'Failed to toggle Ghost Mode. Please try again.');
        }
    };

    const handleToggleGridView = async () => {
        try {
            const newGridViewState = !isGridViewEnabled;
            console.log('Grid View toggled in Settings:', newGridViewState);
            const success = await toggleGridView(!isGridViewEnabled, { navigation });
            if (!success) {
                Alert.alert('Error', 'Failed to toggle to Grid View. Please try again.');
                return;
            }

            setIsGridViewEnabled(newGridViewState);

            Alert.alert(
                newGridViewState ? 'Grid View Enabled' : 'Grid View Disabled',
                newGridViewState
                    ? 'Your Home Screen is now in Grid View.'
                    : 'Your Home Screen is now in Map View.'
            );
        } catch (error) {
            console.error('Error toggling Grid View:', error.message);
            Alert.alert('Error', 'Failed to toggle to Grid View. Please try again.');
        }
    };

    const saveProfileChanges = async () => {
        try {
            setIsLoading(true);
            if (tempNewPassword && tempConfirmPassword !== tempNewPassword) {
                setErrorMessage('Passwords do not match.');
                return;
            }

            if (tempDisplayName !== displayName) {
                await updateDisplayName(tempDisplayName);
                setDisplayName(tempDisplayName);
            }
            if (tempProfilePic !== profilePic) {
                await updateProfilePicture(tempProfilePic);
                setProfilePic(tempProfilePic);
            }
            if (tempNewPassword) {
                await updatePassword(tempNewPassword);
            }

            setSuccessMessage('All changes saved.');
            setTimeout(() => setShowEditProfilePopup(false), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage('Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigation.navigate("Login");
        } catch (error) {
            console.error("Error during sign out:", error.message);
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setIsLoading(true);
                const userId = await AsyncStorage.getItem('spotifyUserId');
                const userProfile = await fetchUserProfile(userId);
                setDisplayName(userProfile.username || 'Unknown User');
                setProfilePic(userProfile.profilePic || '');
            } catch (error) {
                console.error('Error fetching user info:', error.message);
                Alert.alert('Error', 'Failed to load user information.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <View style={styles.container}>
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#CA5038" />
                </View>
            </Modal>
            <View style={styles.backButtonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>&lt; Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Settings</Text>
            </View>
            <View style={styles.signedInAsContainer}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#F8EEDF" />
                ) : (
                    <>
                        {profilePic ? (
                            <Image source={{ uri: profilePic }} style={styles.signedInProfilePic} />
                        ) : (
                            <ProfileIcon width={50} height={50} />
                        )}
                        <View style={styles.signedInTextContainer}>
                            <Text style={styles.signedInLabel}>Signed in as:</Text>
                            <Text style={styles.signedInUsername}>{displayName || 'Guest'}</Text>
                        </View>
                    </>
                )}
            </View>
            <View style={styles.settingsOptions}>
                <View style={styles.toggleContainer}>
                    <View style={styles.gridIconText}>
                        <GhostIcon width={30} height={30} />
                        <View style={styles.gridViewLabels}>
                            <Text style={styles.gridView}>Ghost Mode</Text>
                            <Text style={styles.gridViewSub}>Hide from others</Text>
                        </View>
                    </View>
                    <Switch
                        value={ghostModeEnabled}
                        onValueChange={handleToggleGhostMode}
                        trackColor={{ false: '#767577', true: '#EAC255' }}
                        thumbColor={ghostModeEnabled ? '#93CE89' : '#EAC255'}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <View style={styles.gridIconText}>
                        <GridIcon width={30} height={30} />
                        <View style={styles.gridViewLabels}>
                            <Text style={styles.gridView}>Grid View</Text>
                            <Text style={styles.gridViewSub}>
                                Change from map to grid
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={isGridViewEnabled}
                        onValueChange={handleToggleGridView}
                        trackColor={{ false: '#767577', true: '#EAC255' }}
                        thumbColor={isGridViewEnabled ? '#93CE89' : '#EAC255'}
                    />
                </View>
                <TouchableOpacity
                    style={styles.cardBase}
                    onPress={() => {
                        setShowEditProfilePopup(true);
                    }}
                >
                    <ProfileIcon width={30} height={30} />
                    <Text style={styles.settingsOptionText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardBase} onPress={handleSignOut}>
                    <SignOutIcon width={30} height={30} />
                    <Text style={styles.settingsOptionText}>Sign Out</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardBase} onPress={() => setShowDeletePopup(true)}>
                    <DeleteAccountIcon width={30} height={30} />
                    <Text style={styles.settingsOptionText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Delete Account Modal */}
            <Modal
                visible={showDeletePopup}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDeletePopup(false)}
            >
                <View style={styles.deleteModalContainer}>
                    <View style={styles.deleteModalContent}>
                        <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
                        <Text style={styles.modalDescription}>
                            Are you sure you want to delete your account? This action cannot be undone.
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                            }}
                        />
                        {/* Display error message */}
                        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowDeletePopup(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    !password && styles.confirmButtonDisabled,
                                ]}
                                onPress={handleDeleteAccount}
                                disabled={!password}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditProfilePopup}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEditProfilePopup(false)}
            >
                <View style={styles.editModalContainer}>
                    <View style={styles.editModalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        {/* Display Name */}
                        <Text style={styles.label}>Enter New Display Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="New Display Name"
                            value={displayName}
                            onChangeText={setDisplayName}
                        />

                        {/* Profile Picture */}
                        <Text style={styles.label}>Upload New Profile Picture</Text>
                        {profilePic ? (
                            <Image source={{ uri: profilePic }} style={styles.profilePic} />
                        ) : (
                            <View style={styles.profilePicPlaceholder}>
                                <Text style={styles.profilePicPlaceholderText}>No Profile Pic</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.uploadButton} onPress={handleChangeProfilePic}>
                            <Text style={styles.uploadButtonText}>Select Profile Picture</Text>
                        </TouchableOpacity>

                        {/* New Password */}
                        <Text style={styles.label}>Enter New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Text style={styles.passwordRequirements}>
                            Password must be at least 8 characters long, include one uppercase letter, and one number.
                        </Text>

                        {/* Confirm Password */}
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        {/* Buttons */}
                        {/* Display Success Message */}
                        {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
                        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowEditProfilePopup(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={async () => {
                                    if (tempNewPassword && tempConfirmPassword !== tempNewPassword) {
                                        setErrorMessage('Passwords do not match.');
                                        return;
                                    }
                                    if (
                                        tempNewPassword &&
                                        (tempNewPassword.length < 8 || !/[A-Z]/.test(tempNewPassword) || !/[0-9]/.test(tempNewPassword))
                                    ) {
                                        setErrorMessage(
                                            'Password must be at least 8 characters long, include one uppercase letter, and one number.'
                                        );
                                        return;
                                    }

                                    setErrorMessage('');

                                    try {
                                        if (tempDisplayName !== displayName) {
                                            await updateDisplayName('12345', tempDisplayName);
                                            setDisplayName(tempDisplayName);
                                        }
                                        if (tempProfilePic !== profilePic) {
                                            await updateProfilePicture('12345', tempProfilePic);
                                            setProfilePic(tempProfilePic);
                                        }
                                        if (tempNewPassword) {
                                            await updatePassword('12345', tempNewPassword);
                                        }
                                        setSuccessMessage('All changes saved successfully.');
                                        setTimeout(() => setShowEditProfilePopup(false), 2000);
                                    } catch (error) {
                                        console.error('Error updating profile:', error);
                                        setErrorMessage('Failed to update profile. Please try again.');
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAC255',
        paddingTop: 60,
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 10,
    },
    backButton: {
        paddingHorizontal: 10,
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
        marginBottom: 30,
        width: 200,
    },
    header: {
        textAlign: 'center',
        color: '#F8EEDF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    signedInAsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#CA5038',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 30,
        marginBottom: 20,
    },
    signedInProfilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    signedInTextContainer: {
        flexDirection: 'column',
    },
    signedInLabel: {
        color: '#F8EEDF',
        fontSize: 14,
        fontWeight: '600',
    },
    signedInUsername: {
        color: '#93CE89',
        fontSize: 18,
        fontWeight: '700',
    },
    settingsOptions: {
        paddingHorizontal: 30,
    },
    cardBase: {
        flexDirection: 'row',
        backgroundColor: '#CA5038',
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 15,
        marginBottom: 15,
        alignItems: 'center',
        gap: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#CA5038',
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 15,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    gridIconText: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gridViewLabels: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    settingsOptionText: {
        color: '#F8EEDF',
        fontSize: 18,
        fontWeight: '600',
    },
    gridView: {
        color: '#F8EEDF',
        fontSize: 18,
        fontWeight: '600',
    },
    gridViewSub: {
        color: '#F8EEDF',
    },
    deleteModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteModalContent: {
        backgroundColor: '#F8EEDF',
        padding: 20,
        borderRadius: 10,
        width: '90%',
    },
    editModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editModalContent: {
        backgroundColor: '#F8EEDF',
        padding: 20,
        borderRadius: 10,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#EAC255',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        color: '#F8EEDF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#CA5038',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
    },
    confirmButton: {
        backgroundColor: '#93CE89',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
    },
    confirmButtonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    uploadButton: {
        backgroundColor: '#CA5038',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginBottom: 20
    },
    uploadButtonText: {
        color: '#F8EEDF',
        textAlign: 'center',
    },
    buttonText: {
        color: '#F8EEDF',
        textAlign: 'center',
    },
    successMessage: {
        color: '#28A745',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    errorMessage: {
        color: '#FF0000',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    passwordRequirements: {
        fontSize: 12,
        color: '#777',
        marginBottom: 20,
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
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
