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
import { removeSongFromLikes, fetchUserProfile } from './utils/backendUtils';

export default function Likes({ navigation, route }) {
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLikedSongs, setFilteredLikedSongs] = useState([]);

    const fetchLikedSongs = async () => {
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
            } else {
                setLikedSongs([]);
            }
        } catch (error) {
            console.error('Error fetching liked songs:', error);
            Alert.alert('Error', 'Failed to load liked songs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { updateLikedSongsState } = route.params || {};

    const handleUnlike = async (song) => {
        try {
            setLoading(true);

            const userId = await AsyncStorage.getItem('spotifyUserId');
            if (!userId) {
                throw new Error('User ID not found in AsyncStorage.');
            }

            const success = await removeSongFromLikes(userId, song.uri);
            if (success) {
                const updatedSongs = likedSongs.filter((s) => s.uri !== song.uri);
                setLikedSongs(updatedSongs);
                setFilteredLikedSongs(updatedSongs);

                const userDataString = await AsyncStorage.getItem('userData');
                const userData = userDataString ? JSON.parse(userDataString) : {};
                await AsyncStorage.setItem(
                    'userData',
                    JSON.stringify({ ...userData, likedSongs: updatedSongs })
                );

                if (updateLikedSongsState) {
                    console.log('Updating parent liked songs state...');
                    updateLikedSongsState([{ uri: song.uri, liked: false }]);
                }
            }
        } catch (error) {
            console.error('Error unliking song:', error);
            Alert.alert('Error', 'Failed to unlike the song. Please try again.');
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
        fetchLikedSongs();
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
                <Text style={styles.header}>Your Liked Songs</Text>
            </View>
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search your liked songs..."
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
        width: 200,
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