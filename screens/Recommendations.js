// I'm leaving this code here JIC we want to do something similar and need the functionality
// but as of 12/01/2024 the SPotifyAPI removed access to third party applications to getting recommendations (sad face emoji)

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    Modal,
    ActivityIndicator,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeartIcon from '../assets/logo/heart.svg';
import PlusIcon from '../assets/logo/plus.svg';
import { ensureValidAccessToken } from './utils/spotify';
import { removeSongFromLikes, fetchUserProfile } from './utils/backendUtils';

export default function Recommendations({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLikedSongs, setFilteredLikedSongs] = useState([]);

    const fetchRecommendations = async (seedTrackUri) => {
        const accessToken = await ensureValidAccessToken(); 
        const trackId = seedTrackUri.split(':')[2]; // Extract the track ID from the URI
        console.log('Seed Track URI:', seedTrackUri);
        console.log('Extracted Track ID:', trackId);

        //const recommendationsUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=10`;

        const response = await fetch('https://api.spotify.com/v1/recommendations', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },    
        });

        if (response.status === 204) {
            return null;
        }

        // THIS IS WHERE IM HAVING ISSUES IN GETTING RECOMMENDATIONS
        if (!response.ok) {
            console.error(`Failed to fetch recommended tracks: ${await response.text()}`);
            return null;
        }
            
        try {
            const data = await response.json();
            return data.tracks; // Returns an array of recommended tracks

        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return [];
        }
    };

    const fetchLikedSongsAndRecommendations = async () => {
        try {
            setLoading(true);
            const userId = await AsyncStorage.getItem('spotifyUserId');
            console.log('Fetched User ID:', userId);
    
            if (!userId) {
                throw new Error('User ID not found in AsyncStorage.');
            }
    
            const userDataString = await AsyncStorage.getItem('userData');
            console.log('User Data in AsyncStorage:', JSON.parse(userDataString));
    
            const userProfile = await fetchUserProfile(userId);
            console.log('Fetched User Profile from Firestore:', userProfile);
    
            if (userProfile?.likedSongs) {
                const uniqueSongs = userProfile.likedSongs.filter(
                    (song, index, self) =>
                        song && song.uri && self.findIndex((s) => s.uri === song.uri) === index
                );
    
                console.log('Unique Songs:', uniqueSongs);
    
                setLikedSongs(uniqueSongs);
                setFilteredLikedSongs(uniqueSongs);
    
                await AsyncStorage.setItem(
                    'userData',
                    JSON.stringify({ ...userProfile, likedSongs: uniqueSongs })
                );
                
                // All of the code above is the same as in Likes.js
                // Here fetch recommendations based on the first liked song
                if (uniqueSongs.length > 0) {
                    const recommendations = await fetchRecommendations(uniqueSongs[0].uri);
                    console.log('Recommendations based on first liked song:', recommendations);
                }
            } else {
                setLikedSongs([]);
            }
        } catch (error) {
            console.error('Error fetching liked songs and coupled recommendations:', error);
            Alert.alert('Error', 'Failed to load liked songs and coupled recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = likedSongs.filter((song) =>
            song.trackName.toLowerCase().includes(query.toLowerCase()) ||
            song.artistName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredLikedSongs(filtered);
    };

    useEffect(() => {
        fetchLikedSongsAndRecommendations();
    }, []);

    

    return (
        <View style={styles.container}>
            <Modal visible={loading} transparent={true} animationType="fade">
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
                <Text style={styles.header}>Recommendations</Text>
            </View>
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search your recommended songs..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList
                data={filteredLikedSongs}
                keyExtractor={(item) => item.uri}
                renderItem={({ item }) => (
                    <View style={styles.songContainer}>
                        <Image
                            source={{ uri: item.albumCover || require('../assets/logo/album.png') }}
                            style={styles.songImage}
                        />
                        <View style={styles.songDetails}>
                            <Text style={styles.songName} numberOfLines={1}>
                                {item.trackName || 'Unknown Song'}
                            </Text>
                            <Text style={styles.artistName} numberOfLines={1}>
                                {item.artistName || 'Unknown Artist'}
                            </Text>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.likeButton}
                                onPress={() => handleUnlike(item)}
                            >
                                <HeartIcon width={24} height={24} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() =>
                                    navigation.navigate('AddToPlaylist', { songInfo: item })
                                }
                            >
                                <PlusIcon width={24} height={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>You haven't liked any songs yet.</Text>
                }
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAC255',
        padding: 16,
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 10,
    },
    backButton: {
        marginTop: 40,
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
        marginBottom: 20,
        width: 250,
    },
    header: {
        textAlign: 'center',
        color: '#F8EEDF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    songContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#93CE89',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        borderWidth: 6,
        borderColor: '#CA5038',
    },
    songImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        marginRight: 16,
    },
    songDetails: {
        flex: 1,
    },
    songName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#202020',
    },
    artistName: {
        fontSize: 14,
        color: '#404040',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    likeButton: {
        backgroundColor: '#F8EEDF',
        padding: 4,
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#CA5038',
        padding: 4,
        borderRadius: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarContainer: {
        marginBottom: 16,
    },
    searchBar: {
        backgroundColor: '#F8EEDF',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
});