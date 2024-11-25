import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import ProfileIcon from '../assets/logo/profile.svg';
import HeartIcon from '../assets/logo/heart.svg';
import PlusIcon from '../assets/logo/plus.svg';
import CloseIcon from '../assets/logo/close.svg';
import MenuIcon from '../assets/logo/menu.svg';
import SettingsIcon from '../assets/logo/settings.svg';
import RecommendIcon from '../assets/logo/recommend.svg';
import { getUserProfile, getCurrentlyPlaying, refreshAccessToken } from './utils/spotify';


export default function Map({ navigation }) {
    const INITIAL_REGION = {
        latitude: 43.074921,
        longitude: -89.403938,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    };

    const [userData, setUserData] = useState({
        profile: {
            displayName: 'Loading...',
            profilePic: null,
        },
        currentlyPlaying: {
            trackName: 'No track playing',
            artistName: '',
            albumCover: null,
        },
    });

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const handleMarkerPress = () => {
        setIsOverlayVisible(true); // Show overlay immediately
        fetchUserData(); // Fetch data without blocking
    };

    const fetchUserData = async () => {
        try {
            let accessToken = await AsyncStorage.getItem('spotifyAccessToken');

            // Fetch user profile data
            let profile = await getUserProfile(accessToken);

            // If token expired, refresh and retry profile fetch
            if (!profile) {
                console.log('Access token expired, refreshing...');
                accessToken = await refreshAccessToken();
                profile = await getUserProfile(accessToken);
            }

            // Fetch currently playing track
            const currentlyPlayingResponse = await getCurrentlyPlaying(accessToken);

            // Handle cases where currentlyPlayingResponse is null
            const currentlyPlaying = currentlyPlayingResponse || {};

            setUserData({
                profile: {
                    displayName: profile?.display_name || 'Unknown User',
                    profilePic: profile?.images?.[0]?.url || null,
                },
                currentlyPlaying: {
                    trackName: currentlyPlaying.trackName || 'No track playing',
                    artistName: currentlyPlaying.artistName || '',
                    albumCover: currentlyPlaying.albumCover || null,
                },
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        // Fetch user data on component mount
        fetchUserData();

        // Optional: Poll every 30 seconds for currently playing track
        const interval = setInterval(() => {
            fetchUserData();
        }, 30000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={INITIAL_REGION}
                minZoomLevel={15} //deprecated, but this is what forces the zoom in
            >
                {/* Custom Marker */}
                <Marker
                    coordinate={{
                        latitude: INITIAL_REGION.latitude,
                        longitude: INITIAL_REGION.longitude,
                    }}
                    onPress={handleMarkerPress}
                >
                    {/* Custom Image for Marker */}
                    <Image
                        source={require('../assets/logo/userMarker.png')}
                        style={styles.markerImage}
                    />
                </Marker>
            </MapView>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setIsMenuVisible(true)}
            >
                <MenuIcon width={45} height={45} />
            </TouchableOpacity>
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
                                <TouchableOpacity style={styles.menuItem}>
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
                            <View style={styles.menuItemContainer}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Recommendations')}>
                                    <RecommendIcon width={50} height={50} />
                                </TouchableOpacity>
                                <Text style={styles.menuText}>You'll Like</Text>
                            </View>
                        </View>
                        <View style={styles.menuTitleContainer}>
                            <Text style={styles.menuTitle}>MAIN MENU</Text>
                        </View>
                    </View>
                </View>
            )
            }
            {
                isOverlayVisible && (
                    <View style={[styles.overlayContainer]}>
                        <View style={styles.overlayContent}>
                            <TouchableOpacity
                                style={styles.closeOverlayBtn}
                                onPress={() => { setIsOverlayVisible(false) }}
                            >
                                <CloseIcon width={20} height={20} />
                            </TouchableOpacity>

                            <View style={styles.userSummary}>
                                {userData.profile.profilePic ? (
                                    <Image
                                        source={{ uri: userData.profile.profilePic }}
                                        style={styles.profilePic}
                                    />
                                ) : (
                                    <ProfileIcon width={60} height={60} style={styles.profilePic} />
                                )}
                                <View style={styles.userSummaryText}>
                                    <Text style={styles.userName}>{userData.profile.displayName}</Text>
                                    <Text style={styles.userDistance}>• This is you</Text>
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
                                <TouchableOpacity style={styles.likeSongBtn}>
                                    <HeartIcon width={30} height={30} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addToPlaylistBtn}>
                                    <PlusIcon width={30} height={30} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }
            {/* SoundScout logo in the bottom corner */}
            <View style={styles.overlayImageContainer}>
                <Image
                    source={require('../assets/logo/SoundScoutBttm.png')}
                    style={styles.overlayImage}
                />
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    overlayImageContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        bottom: -100
    },
    overlayImage: {
        width: 275,
        height: 275,
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
        fontSize: 16,
        fontWeight: 600,
        whiteSpace: 'nowrap',
    },
    userDistance: {
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
    menuButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 9,
        backgroundColor: '#EAC255',
        borderRadius: 8
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
        top: '20%',
        left: '10%',
        right: '10%',
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
});
