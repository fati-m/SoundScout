import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, ScrollView, Image, Text, TouchableOpacity, Alert, Animated, FlatList, Dimensions, ActivityIndicator, Modal } from 'react-native';
import ProfileIcon from '../assets/logo/profile.svg';
import HeartIcon from '../assets/logo/heart.svg';
import OutlineHeartIcon from '../assets/logo/heartOutline.svg';
import PlusIcon from '../assets/logo/plus.svg';
import CloseIcon from '../assets/logo/close.svg';
import MenuIcon from '../assets/logo/menu.svg';
import SettingsIcon from '../assets/logo/settings.svg';
import {
    fetchUserProfile,
    fetchNearbyUsers,
    syncUserDataPeriodically,
    isGhostMode,
    isSongLiked,
    addSongToLikes,
    removeSongFromLikes,
} from './utils/backendUtils';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

export default function Grid({ navigation, route }) {
    const [isLoading, setIsLoading] = useState(true);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [isGhostModeEnabled, setIsGhostModeEnabled] = useState(false);
    const [isGridViewEnabled, setIsGridViewEnabled] = useState(true);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likedSongs, setLikedSongs] = useState({});
    const [userData, setUserData] = useState({
        username: 'Loading...',
        profilePic: null,
        currentlyPlaying: { trackName: 'No track playing', artistName: '', albumCover: '', uri: '' },
        isGhostMode: false,
        location: { latitude: 0, longitude: 0 },
    });
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [successMessage, setSuccessMessage] = useState(route.params?.successMessage || '');
    const [profiles, setUserProfiles] = useState([]);

    const fetchProfiles = async () => {
        try {
            const userId = await AsyncStorage.getItem('spotifyUserId');
            if (!userId) throw new Error("User ID not found in AsyncStorage.");

            const nearbyUsers = await fetchNearbyUsers(userId);

            setUserProfiles(nearbyUsers || []);
            await syncLikedSongs(nearbyUsers);
        } catch (error) {
            console.error('Error fetching user profiles:', error.message);
            Alert.alert('Error', 'Unable to fetch nearby users.');
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleCloseOverlay = async () => {
        setIsOverlayVisible(false);
        await fetchProfiles();
    };

    const calculateDistanceInMiles = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degrees) => degrees * (Math.PI / 180);

        const earthRadiusInMiles = 3958.8;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusInMiles * c;
    };

    useEffect(() => {
        const initializeGrid = async () => {
            try {
                const ghostMode = await isGhostMode();
                console.log("Initial Ghost Mode state:", ghostMode);
                setIsGhostModeEnabled(ghostMode);

                const userId = await AsyncStorage.getItem('spotifyUserId');
                const userProfile = await fetchUserProfile(userId);
                setUserData(userProfile);

                if (userProfile.currentlyPlaying?.uri) {
                    const liked = await isSongLiked(userId, userProfile.currentlyPlaying.uri);
                    setIsLiked(liked);
                }

                await startTrackingLocation();
                startPeriodicSync(userId);

                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing grid:', error.message);
                Alert.alert('Error', 'Failed to initialize grid data.');
            }
        };

        initializeGrid();

        return () => clearInterval(syncInterval);
    }, []);

    let syncInterval;
    const startPeriodicSync = (userId) => {
        syncInterval = setInterval(async () => {
            try {
                await syncUserDataPeriodically(userId);
                await fetchProfiles();
            } catch (error) {
                console.error('Error syncing user data periodically:', error.message);
            }
        }, 30000);
    };

    const startTrackingLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Location Permission Denied', 'Please enable location services.');
                return;
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    if (!isGhostModeEnabled) {
                        setCurrentRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                }
            );
        } catch (error) {
            console.error('Error starting location tracking:', error.message);
        }
    };

    useEffect(() => {
        const syncGhostModeState = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                const userData = userDataString ? JSON.parse(userDataString) : {};
                setIsGhostModeEnabled((prev) => userData.isGhostMode ?? prev);
            } catch (error) {
                console.error("Error syncing Ghost Mode state:", error.message);
            }
        };

        syncGhostModeState();
        const interval = setInterval(syncGhostModeState, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const syncGridModeState = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                const userData = userDataString ? JSON.parse(userDataString) : {};
                setIsGridViewEnabled(userData.isGridView || false);
                // console.log("Grid View state updated:", userData.isGridView);

            } catch (error) {
                console.error("Error switching from Map View to Grid View:", error.message);
            }
        };

        const interval = setInterval(syncGridModeState, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLikeButtonPress = async () => {
        try {
            const userId = await AsyncStorage.getItem('spotifyUserId');
            const song = userData.currentlyPlaying;

            if (!song?.uri) {
                Alert.alert('Error', 'No song is currently playing.');
                return;
            }

            const updatedLikedSongs = { ...likedSongs }; // Create a copy of likedSongs

            if (isLiked) {
                const success = await removeSongFromLikes(userId, song.uri);
                if (success) {
                    setIsLiked(false);
                    delete updatedLikedSongs[song.uri]; // Remove the song from likedSongs
                }
            } else {
                const success = await addSongToLikes(userId, song);
                if (success) {
                    setIsLiked(true);
                    updatedLikedSongs[song.uri] = true; // Add the song to likedSongs
                }
            }

            setLikedSongs(updatedLikedSongs); // Update the likedSongs state
        } catch (error) {
            console.error('Error toggling like status:', error.message);
        }
    };

    const handleLikeOtherUsersSongs = async (songId) => {
        try {
            const userId = await AsyncStorage.getItem('spotifyUserId');
            const song = profiles.find((item) => item.id === songId);

            if (!song?.currentlyPlaying?.uri) {
                Alert.alert('Error', 'Song not found or no track playing.');
                return;
            }

            const updatedLikedSongs = { ...likedSongs };
            const wasLiked = likedSongs[song.currentlyPlaying.uri];

            if (wasLiked) {
                const success = await removeSongFromLikes(userId, song.currentlyPlaying.uri);
                if (!success) throw new Error('Failed to remove song.');
                delete updatedLikedSongs[song.currentlyPlaying.uri];
            } else {
                const success = await addSongToLikes(userId, song.currentlyPlaying);
                if (!success) throw new Error('Failed to add song.');
                updatedLikedSongs[song.currentlyPlaying.uri] = true;
            }

            setLikedSongs(updatedLikedSongs);
        } catch (error) {
            console.error('Error liking/unliking song:', error.message);
            Alert.alert('Error', 'Failed to update like status.');
        }
    };

    const updateLikedSongsState = (updatedSongs) => {
        setLikedSongs((prevState) => {
            const newState = { ...prevState };
            updatedSongs.forEach((song) => {
                if (!song.liked) {
                    delete newState[song.uri]; // Remove unliked songs
                } else {
                    newState[song.uri] = true; // Add liked songs
                }
            });
            return newState;
        });
    };

    const syncLikedSongs = async (profiles) => {
        try {
            const userId = await AsyncStorage.getItem('spotifyUserId');
            const updatedLikedSongs = {};

            for (const profile of profiles) {
                if (profile.currentlyPlaying?.uri) {
                    const liked = await isSongLiked(userId, profile.currentlyPlaying.uri);
                    updatedLikedSongs[profile.currentlyPlaying.uri] = liked;
                }
            }

            setLikedSongs(updatedLikedSongs);
        } catch (error) {
            console.error('Error syncing liked songs:', error.message);
        }
    };

    useEffect(() => {
        const checkIfLiked = async () => {
            const userId = await AsyncStorage.getItem('spotifyUserId');
            const liked = await isSongLiked(userId, userData.currentlyPlaying.uri);
            setIsLiked(liked);
        };

        if (userData.currentlyPlaying?.uri) checkIfLiked();
    }, [userData.currentlyPlaying?.uri]);

    useEffect(() => {
        if (successMessage) {
            fadeAnim.setValue(1);

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 6000,
                useNativeDriver: true,
            }).start(() => {
                setSuccessMessage('');
            });
        }
    }, [successMessage]);

    const renderItem = ({ item }) => {
        const isSongAvailable = item.currentlyPlaying?.trackName &&
            item.currentlyPlaying?.trackName !== "No track playing" &&
            item.currentlyPlaying?.trackName !== "";
        const isLiked = likedSongs[item.currentlyPlaying?.uri] || false;
        const distanceInMiles = calculateDistanceInMiles(
            currentRegion?.latitude || 0,
            currentRegion?.longitude || 0,
            item.location?.latitude || 0,
            item.location?.longitude || 0
        ).toFixed(2);

        return (
            <View style={styles.flatlistItem}>
                <View style={styles.userSummary}>
                    {item.profilePic ? (
                        <Image
                            source={{ uri: item.profilePic }}
                            style={styles.otherProfilePic}
                        />
                    ) : (
                        <ProfileIcon width={60} height={60} style={styles.otherProfilePic} />
                    )}
                    <View style={styles.userSummaryText}>
                        <Text style={styles.otherUserName}>{item.username || 'Unknown User'}</Text>
                        <Text style={styles.otherUserDistance}>{distanceInMiles} miles away</Text>
                    </View>
                </View>
                <Text style={styles.otherCurrentlyListeningHeader}>Currently listening to...</Text>
                <View style={styles.otherCurrentlyListeningSection}>
                    {item.currentlyPlaying?.albumCover ? (
                        <Image
                            source={{ uri: item.currentlyPlaying.albumCover }}
                            style={styles.otherCurrentlyListeningAlbumCover}
                        />
                    ) : (
                        <Image
                            source={require('../assets/logo/album.png')}
                            style={styles.otherCurrentlyListeningAlbumCover}
                        />
                    )}
                    <View style={styles.otherCurrentlyListeningSectionText}>
                        <Text numberOfLines={2} style={styles.otherSongName}>
                            {item.currentlyPlaying?.trackName || 'No track playing'}
                        </Text>
                        <Text numberOfLines={2} style={styles.otherArtistName}>
                            {item.currentlyPlaying?.artistName || ''}
                        </Text>
                    </View>
                </View>
                <View style={styles.songInteractions}>
                    <TouchableOpacity
                        style={[styles.likeSongBtn, !isSongAvailable && { opacity: 0.5 }]}
                        onPress={() => handleLikeOtherUsersSongs(item.id)}
                        disabled={!isSongAvailable}
                    >
                        {isLiked ? (
                            <HeartIcon width={30} height={30} />
                        ) : (
                            <OutlineHeartIcon width={30} height={30} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addToPlaylistBtn, !isSongAvailable && { opacity: 0.5 }]}
                        onPress={() =>
                            navigation.navigate('AddToPlaylist', { songInfo: item.currentlyPlaying })
                        }
                        disabled={!isSongAvailable}
                    >
                        <PlusIcon width={30} height={30} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#CA5038" />
                </View>
            </Modal>

            {/* The menu */}
            <View style={styles.topSection}>
                <View>
                    <Text style={styles.soundScoutHeaderText}>SoundScout</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={async () => {
                            setIsLoading(true);
                            try {
                                const userId = await AsyncStorage.getItem('spotifyUserId');
                                const cachedProfile = JSON.parse(await AsyncStorage.getItem('userData'));
                                console.log("test", cachedProfile);

                                if (!userId) {
                                    throw new Error("User ID not found.");
                                }

                                await syncUserDataPeriodically(userId);

                                const updatedUserData = await fetchUserProfile(userId);

                                setUserData(updatedUserData);
                                setIsOverlayVisible(true);

                                const currentlyPlayingSongUri = updatedUserData.currentlyPlaying?.uri;
                                if (currentlyPlayingSongUri) {
                                    const liked = await isSongLiked(userId, currentlyPlayingSongUri);
                                    setIsLiked(liked);
                                }
                            } catch (error) {
                                console.error("Error syncing user data:", error.message);
                                Alert.alert("Error", "Failed to fetch user music data. Try Again.");
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                    >
                        {userData.profilePic ? (
                            <Image
                                source={{ uri: userData.profilePic }}
                                style={styles.profilePicButton}
                            />
                        ) : (
                            <ProfileIcon width={60} height={60} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
                        <MenuIcon width={45} height={45} />
                    </TouchableOpacity>
                </View>
            </View>
            {isMenuVisible && (
                <View style={styles.menuOverlay}>
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.closeMenuButton}
                            onPress={() => setIsMenuVisible(false)}
                        >
                            <CloseIcon width={20} height={20} />
                        </TouchableOpacity>
                        <View style={styles.menuContent}>
                            <View style={styles.menuItemContainer}>
                                <TouchableOpacity style={styles.menuItem} onPress={() =>
                                    navigation.navigate('Likes', { updateLikedSongsState })}>
                                    <HeartIcon width={50} height={50} />
                                </TouchableOpacity>
                                <Text style={styles.menuText}>Likes</Text>
                            </View>
                            <View style={styles.menuItemContainer}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Settings')}>
                                    <SettingsIcon width={50} height={50} />
                                </TouchableOpacity>
                                <Text style={styles.menuText}>Settings</Text>
                            </View>
                            {/* Add additional menu items here */}
                        </View>
                        <View style={styles.menuTitleContainer}>
                            <Text style={styles.menuTitle}>MAIN MENU</Text>
                        </View>
                    </View>
                </View>
            )}
            {isOverlayVisible && (
                <View style={[styles.overlayContainer]}>
                    <View style={styles.overlayContent}>
                        <TouchableOpacity
                            style={styles.closeOverlayBtn}
                            onPress={handleCloseOverlay}
                        >
                            <CloseIcon width={20} height={20} />
                        </TouchableOpacity>

                        <View style={styles.userSummary}>
                            {userData.profilePic ? (
                                <Image
                                    source={{ uri: userData.profilePic }}
                                    style={styles.profilePic}
                                />
                            ) : (
                                <ProfileIcon width={60} height={60} style={styles.profilePic} />
                            )}
                            <View style={styles.userSummaryText}>
                                <Text style={styles.userName}>{userData.username || 'Unknown User'}</Text>
                                <Text style={styles.userDistance}>This is you</Text>
                            </View>
                        </View>

                        <Text style={styles.currentlyListeningHeader}>Currently listening to...</Text>
                        <View style={styles.currentlyListeningSection}>
                            {userData.currentlyPlaying.albumCover ? (
                                <Image
                                    source={{ uri: userData.currentlyPlaying.albumCover }}
                                    style={styles.currentlyListeningAlbumCover}
                                />
                            ) : (
                                <Image
                                    source={require('../assets/logo/album.png')}
                                    style={styles.currentlyListeningAlbumCover}
                                />
                            )}
                            <View style={styles.currentlyListeningSectionText}>
                                <Text numberOfLines={2} style={styles.songName}>
                                    {userData.currentlyPlaying.trackName}
                                </Text>
                                <Text style={styles.artistName}>{userData.currentlyPlaying.artistName}</Text>
                            </View>
                        </View>

                        <View style={styles.songInteractions}>
                            <TouchableOpacity style={[
                                styles.likeSongBtn,
                                !userData.currentlyPlaying.uri && { opacity: 0.5 },
                            ]}
                                onPress={handleLikeButtonPress}
                                disabled={!userData.currentlyPlaying.uri}>
                                {isLiked ? (
                                    <HeartIcon width={30} height={30} />
                                ) : (
                                    <OutlineHeartIcon width={30} height={30} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addToPlaylistBtn,
                                    !userData.currentlyPlaying.uri && { opacity: 0.5 },
                                ]}
                                onPress={() =>
                                    navigation.navigate('AddToPlaylist', { songInfo: userData.currentlyPlaying })
                                }
                                disabled={!userData.currentlyPlaying.uri}
                            >
                                <PlusIcon width={30} height={30} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {/* Allows for the Success Message to be received correctly*/}
            {successMessage && (
                <Animated.View style={[styles.overlayContainer, { opacity: fadeAnim }]}>
                    <View style={styles.successOverlayContent}>
                        <TouchableOpacity
                            style={styles.closeMenuButton}
                            onPress={() => setSuccessMessage('')}
                        >
                            <CloseIcon width={20} height={20} />
                        </TouchableOpacity>
                        <Text style={styles.successHeader}>Success!</Text>
                        <Text style={styles.successBody}>{successMessage}</Text>
                    </View>
                </Animated.View>
            )}
            {profiles && profiles.length > 0 ? (
                <View style={styles.profilesFlatlist}>
                    <FlatList
                        data={profiles}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20, gap: 20 }}
                    />
                </View>
            ) : (
                <Text style={styles.successHeader}>No other users in your area...</Text>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        flex: 1,
        backgroundColor: '#93CE89',
    },
    profilesFlatlist: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingBottom: 100
    },
    flatlistItem: {
        width: 350,
        height: 350,
        borderColor: '#F8EEDF',
        padding: 20,
        borderWidth: 10,
        borderRadius: 15,
        backgroundColor: '#CA5038',
    },
    successOverlayContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#93CE89',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        justifyContent: 'space-between',
    },
    successHeader: {
        color: '#FFF',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    successBody: {
        color: '#FFF',
        fontSize: 30,
        textAlign: 'left',
    },
    soundScoutHeaderText: {
        color: '#CA5038',
        fontSize: 40,
        fontWeight: 800,
    },
    distanceHeader: {
        width: 300,
        backgroundColor: '#CA5038',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50
    },
    distanceHeaderText: {
        color: '#EAC255',
        fontSize: 30,
        fontWeight: 600,
        textAlign: 'center'
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10,
    },
    overlayContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#CA5038',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        justifyContent: 'space-between',
    },
    closeOverlayBtn: {
        alignSelf: 'flex-end',
    },
    userSummary: {

        alignSelf: "flex-start",
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    userSummaryText: {
        flexDirection: 'column',
        justifyContent: "center"
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 50
    },
    userName: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: 600,
        whiteSpace: 'nowrap',
    },
    userDistance: {
        fontSize: 20,
        color: "#202020"
    },
    otherProfilePic: {
        height: 60,
        width: 60,
        borderRadius: 50
    },
    otherUserName: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: 600,
        whiteSpace: 'nowrap',
    },
    otherUserDistance: {
        fontSize: 18,
        color: "#202020"
    },
    currentlyListeningHeader: {
        alignSelf: "flex-start",
        fontSize: 22,
        fontWeight: "600",
        color: "#F8EEDF",
        paddingBottom: 15
    },
    currentlyListeningSection: {
        flexDirection: "column",
        gap: 8
    },
    currentlyListeningAlbumCover: {
        alignSelf: "center",
        width: 300,
        height: 300,
        borderRadius: 10,
        resizeMode: 'contain',
    },
    currentlyListeningSectionText: {
        flexDirection: "column",
        justifyContent: "center",
        width: 300
    },
    songName: {
        color: "#F8EEDF",
        fontSize: 20,
        fontWeight: 600,
        display: 'flex',
        flexWrap: 'wrap'
    },
    artistName: {
        color: "#202020",
        fontSize: 18,
        display: 'flex',
        flexWrap: 'wrap'
    },
    songInteractions: {
        flexDirection: "row",
        alignSelf: "flex-end",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 'auto',
        paddingTop: 20
    },
    likeSongBtn: {
        backgroundColor: "#F8EEDF",
        padding: 4,
        borderRadius: 10
    },
    addToPlaylistBtn: {
        backgroundColor: "#93CE89",
        padding: 4,
        borderRadius: 10
    },
    otherCurrentlyListeningHeader: {
        alignSelf: "flex-start",
        fontSize: 18,
        fontWeight: "600",
        color: "#F8EEDF",
        paddingBottom: 15
    },
    otherCurrentlyListeningSection: {
        flexDirection: "row",
        gap: 8
    },
    otherCurrentlyListeningAlbumCover: {
        alignSelf: "center",
        width: 100,
        height: 100,
        borderRadius: 10,
        resizeMode: 'contain',
    },
    otherCurrentlyListeningSectionText: {
        flexDirection: "column",
        justifyContent: "center",
        width: 300
    },
    otherSongName: {
        width: 170,
        color: "#F8EEDF",
        fontSize: 20,
        fontWeight: 600,
        display: 'flex',
        flexWrap: 'wrap'
    },
    otherArtistName: {
        width: 170,
        color: "#202020",
        fontSize: 18,
        display: 'flex',
        flexWrap: 'wrap'
    },
    topSection: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#EAC255',
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        zIndex: 9,
    },
    profileButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePicButton: {
        width: 45,
        height: 45,
        borderRadius: 50
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10,
    },
    menuContainer: {
        position: 'absolute',
        width: '80%',
        backgroundColor: '#EAC255',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        justifyContent: 'space-between',
        zIndex: 10,
    },
    closeMenuButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 20,
        flexWrap: 'wrap'
    },
    menuItemContainer: {
        gap: 6
    },
    menuItem: {
        backgroundColor: '#F8EEDF',
        alignItems: 'center',
        padding: 10,
        borderWidth: 6,
        borderColor: '#CA5038',
        borderRadius: 12,
        gap: 8
    },
    menuText: {
        color: '#F8EEDF',
        backgroundColor: '#CA5038',
        textAlign: "center",
        fontSize: 16,
        fontWeight: '600',
        padding: 5,
        borderRadius: 12
    },
    menuTitleContainer: {
        marginTop: 25,
        padding: 10,
        alignSelf: 'center',
        backgroundColor: '#CA5038',
        borderRadius: 12
    },
    menuTitle: {
        color: '#F8EEDF',
        fontSize: 24,
        fontWeight: '800',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});