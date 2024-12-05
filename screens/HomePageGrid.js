import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Image, Text, TouchableOpacity, Alert, Animated, FlatList, Dimensions } from 'react-native';
import ProfileIcon from '../assets/logo/profile.svg';
import HeartIcon from '../assets/logo/heart.svg';
import OutlineHeartIcon from '../assets/logo/heartOutline.svg';
import PlusIcon from '../assets/logo/plus.svg';
import CloseIcon from '../assets/logo/close.svg';
import MenuIcon from '../assets/logo/menu.svg';
import SettingsIcon from '../assets/logo/settings.svg';
import {
    fetchUserProfile,
    syncUserDataPeriodically,
    isGhostMode,
    isSongLiked,
    addSongToLikes,
    removeSongFromLikes,
} from './utils/backendUtils';
import * as Location from 'expo-location';

export default function Grid({ navigation, route }) {
    const [isLoading, setIsLoading] = useState(true);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [isGhostModeEnabled, setIsGhostModeEnabled] = useState(false);
    const [isGridViewEnabled, setIsGridViewEnabled] = useState(true);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [userData, setUserData] = useState({
        username: 'Loading...',
        profilePic: null,
        currentlyPlaying: { trackName: 'No track playing', artistName: '', albumCover: '', uri: '' },
        isGhostMode: false,
        location: { latitude: 0, longitude: 0 },
    });
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [successMessage, setSuccessMessage] = useState(route.params?.successMessage || '');
    const [nearbyProfiles, setNearbyProfiles] = useState([]);
    const [distantProfiles, setDistantProfiles] = useState([]);

    const fetchProfiles = async () => {/*
        This is a method that needs to be developed by back-end because it relies on other user profile access
        which has not been implemented nor do I know how that implementation would look like. 
        Im assuming it would be implemented similarly to fetching the liked songs in Likes.js but just profiles from firebase
        */
    }

    useEffect(() => {
            fetchProfiles();
    }, []);

    useEffect(() => {
        const initializeGrid = async () => {
            try {
                const ghostMode = await isGhostMode();
                console.log("Initial Ghost Mode state:", ghostMode);
                setIsGhostModeEnabled(ghostMode);

                const userId = await AsyncStorage.getItem('spotifyUserId');
                const userProfile = await fetchUserProfile(userId);
                setUserData(userProfile);

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
            } catch (error) {
                console.error('Error syncing user data periodically:', error.message);
            }
        }, 30000);
    };

    // Location Tracking
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
                setIsGhostModeEnabled(userData.isGhostMode || false);
                console.log("Ghost Mode state updated:", userData.isGhostMode);
            } catch (error) {
                console.error("Error syncing Ghost Mode state:", error.message);
            }
        };

        const interval = setInterval(syncGhostModeState, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const syncGridModeState = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                const userData = userDataString ? JSON.parse(userDataString) : {};
                setIsGridViewEnabled(userData.isGridView || false);
                console.log("Grid View state updated:", userData.isGridView);

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

            if (isLiked) {
                const success = await removeSongFromLikes(userId, song.uri);
                if (success) setIsLiked(false);
            } else {
                const success = await addSongToLikes(userId, song);
                if (success) setIsLiked(true);
            }
        } catch (error) {
            console.error('Error handling like button:', error.message);
            Alert.alert('Error', 'Failed to update like status.');
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
                duration: 8000,
                useNativeDriver: true,
            }).start(() => {
                setSuccessMessage('');
            });
        }
    }, [successMessage]);

    // TEMP STUFF BEGINS FOR FORMATTING HERE
    // DATA USED FOR TESTING AND FORMATTING, WILL ACTUALLY COME FROM fetchProfiles() method developed by Backend
    const profileItems = [
        {
          id: '1',
          name: 'Jane Doe',
          distance: '0.3 km away',
          curr: 'Currently Listening To...',
          albumName: '{PLACEHOLDER}',
          artist: '{PLACEHOLDER}',
          album: require('../assets/logo/album.png'),
          albumStyle: {
            position: 'absolute',
            borderRadius: 15,
            left: 10,
            top: 120,
            width: 80,
            height: 80,
            objectFit: 'contain',
            resizeMode: 'cover',
          },
          profile: require('../assets/logo/profile.png'),
          profilePicStyle: {
            position: 'absolute',
            left: 10,
            top: 17,
            width: 60,
            height: 60,
            borderRadius: 50
          },
        },
        {
            id: '2',
            name: 'John Smith',
            distance: '0.7 km away',
            curr: 'Currently Listening To...',
            albumName: '{PLACEHOLDER}',
            artist: '{PLACEHOLDER}',
            album: require('../assets/logo/album.png'),
            albumStyle: {
                position: 'absolute',
                borderRadius: 15,
                left: 10,
                top: 120,
                width: 80,
                height: 80,
                objectFit: 'contain',
                resizeMode: 'cover',
            },
            profile: require('../assets/logo/profile.png'),
            profilePicStyle: {
                position: 'absolute',
                left: 10,
                top: 17,
                width: 60,
                height: 60,
                borderRadius: 50
            },
        },
        {
            id: '3',
            name: 'Lemon Lime',
            distance: '1 km away',
            curr: 'Currently Listening To...',
            albumName: '{PLACEHOLDER}',
            artist: '{PLACEHOLDER}',
            album: require('../assets/logo/album.png'),
            albumStyle: {
              position: 'absolute',
              borderRadius: 15,
              left: 10,
              top: 120,
              width: 80,
              height: 80,
              objectFit: 'contain',
              resizeMode: 'cover',
            },
            profile: require('../assets/logo/profile.png'),
            profilePicStyle: {
              position: 'absolute',
              left: 10,
              top: 17,
              width: 60,
              height: 60,
              borderRadius: 50
            },
          },
      ];
    
    const renderItem = ({ item }) => (
    <View style={styles.carouselItem}>
        
        <Image source={item.profile} style={item.profilePicStyle} />
        <Image source={item.album} style={item.albumStyle} />
        <Text style={styles.otherUserName}>{item.name}</Text>
        <Text style={styles.otherUserDistance}>{item.distance}</Text>
        <Text style={styles.otherSongName}>{item.albumName}</Text>
        <Text style={styles.otherArtistName}>{item.artist}</Text>
        <Text style={styles.otherCurrentlyListeningHeader}>{item.curr}</Text>

        <View style={styles.songInteractions}>
            <TouchableOpacity style={[
                styles.otherLikeSongBtn,
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
                    styles.otherAddToPlaylistBtn,
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
    );

    return(
        <View style={styles.container}>
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
            {/* SoundScout logo at the top of the page in line with the menu button */}
            <View style={styles.overlayImageContainer}>
                <Image
                    source={require('../assets/logo/SoundScoutBttm.png')}
                    style={styles.overlayImage}
                />
            </View>

            <View style={styles.overlayImageContainer1}>
                <Image
                    source={require('../assets/logo/SSNearMe.png')}
                    style={styles.overlayImage}
                />
            </View>

            <FlatList
                data={profileItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer1}
            />

            <View style={styles.overlayImageContainer2}>
                <Image
                    source={require('../assets/logo/SSDistance.png')}
                    style={styles.overlayImage}
                />
            </View>

            <FlatList
                data={profileItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer2}
            />

            {/* The menu */}
            <View style={styles.menuRecenterContainer}>
                <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
                    <MenuIcon width={45} height={45} />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    style={styles.recenterButton}
                    onPress={() => {
                        setIsOverlayVisible(true)
                    }}
                >
                    <ProfileIcon width={45} height={45} opacity={0.65} />
                </TouchableOpacity>
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
                                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Likes')}>
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
                            {/* <View style={styles.menuItemContainer}> This should remain commented out and not deleted in case of Recommendation changes
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Recommendations')}>
                                    <RecommendIcon width={50} height={50} />
                                </TouchableOpacity>
                                <Text style={styles.menuText}>You'll Like</Text>
                            </View> */}
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
                            onPress={() => { setIsOverlayVisible(false) }}
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

        </View >
    );   
}

const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#93CE89',
        },
        flatListContainer1: {
            position: 'relative',
            bottom: -55,
            justifyContent: 'center',
            alignItems: 'center',
        },
        flatListContainer2: {
            position: 'relative',
            top: 35,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 20,
        },
        carouselItem: {
        width: 275,
        height: 275,
        borderColor: '#F8EEDF',
        borderWidth: 10,
        borderRadius: 15,
        backgroundColor: '#CA5038',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Dimensions.get('window').width * 0.1,
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
        emptyText: {
            fontSize: 16,
            color: '#888888',
            textAlign: 'center',
            marginTop: 20,
            backgroundColor: 'pink'
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
        errorText: {
            flex: 1,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize: 16,
            color: 'red',
        },
        overlayImageContainer: {
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            left: 35,
            bottom: 30
        },
        overlayImageContainer1: {
            flex: 1,
            position: 'absolute',
            left: 55,
            top: 65,
            justifyContent: "center",
            alignItems: "center",
        },
        overlayImageContainer2: {
            flex: 1,
            position: 'absolute',
            left: 45,
            top: 430,
            justifyContent: "center",
            alignItems: "center",
        },
        overlayImage: {
            width: 325,
            height: 300,
            resizeMode: "contain",
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
        closeBtn: {
            alignSelf: "flex-end"
        },
        userSummary: {
            alignSelf: "flex-start",
            flexDirection: "row",
            gap: 8,
            marginBottom: 10,
        },
        userSummaryText: {
            flexDirection: "column",
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
        otherUserName: {
            position: 'absolute',
            top: 20,
            left: 80,
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: 600,
            whiteSpace: 'nowrap',
        },
        userDistance: {
            fontSize: "20",
            color: "#202020"
        },
        otherUserDistance: {
            position: 'absolute',
            top: 45,
            left: 80,
            fontSize: "20",
            color: "#202020"
        },
        currentlyListeningHeader: {
            alignSelf: "flex-start",
            fontSize: 22,
            fontWeight: "600",
            color: "#F8EEDF",
            paddingBottom: 15
        },
        otherCurrentlyListeningHeader: {
            position: 'absolute',
            top: 80,
            left: 10,
            fontSize: 18,
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
        otherSongName: {
            position: 'absolute',
            left: 100,
            top: 135,
            color: "#F8EEDF",
            fontSize: 18,
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
        otherArtistName: {
            position: 'absolute',
            left: 100,
            top: 160,
            color: "#202020",
            fontSize: 16,
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
        otherLikeSongBtn: {
            position: 'absolute',
            right: 50,
            bottom: 5,
            backgroundColor: "#F8EEDF",
            padding: 4,
            borderRadius: 10
        },
        addToPlaylistBtn: {
            backgroundColor: "#93CE89",
            padding: 4,
            borderRadius: 10
        },
        otherAddToPlaylistBtn: {
            position: 'absolute',
            right: 5,
            bottom: 5,
            backgroundColor: "#93CE89",
            padding: 4,
            borderRadius: 10
        },
        menuRecenterContainer: {
            position: 'absolute',
            top: 50,
            left: 20,
            alignItems: 'center',
            zIndex: 9,
            backgroundColor: '#EAC255',
            borderRadius: 8,
            padding: 5
        },
        menuButton: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        divider: {
            width: '80%',
            height: 1,
            backgroundColor: '#CA5038',
            marginVertical: 5
        },
        recenterButton: {
            alignItems: 'center',
            justifyContent: 'center',
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