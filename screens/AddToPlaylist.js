import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { getUserPlaylists } from './utils/spotify';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddToPlaylist({ navigation, route }) {
    const { songInfo } = route.params;
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPlaylists = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('spotifyAccessToken');
            const userPlaylists = await getUserPlaylists(accessToken);
            setPlaylists(userPlaylists);
            setFilteredPlaylists(userPlaylists);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = playlists.filter((playlist) =>
            playlist.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPlaylists(filtered);
    };

    const addSongToPlaylist = async (playlistId) => {
        if (!songInfo?.uri) {
            Alert.alert('Error', 'No valid URI for the currently playing track.');
            return;
        }

        try {
            const accessToken = await AsyncStorage.getItem('spotifyAccessToken');
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uris: [songInfo.uri],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to add song to playlist: ${await response.text()}`);
            }

            // handling where to return the user based on gridView preference
            const isGridView = await AsyncStorage.getItem('userData');
            const userData = isGridView ? JSON.parse(isGridView) : {};
            console.log('Verification of the user\'s isGridView status: ', userData.isGridView)
            
            let screen = userData.isGridView ? 'Grid' : 'Map';

            navigation.navigate(screen, {
                successMessage: 'The song you selected was added to your playlist of choice.',
            });
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            Alert.alert('Error', 'Failed to add the song to the playlist. Please try again.');
        }
    };

    const handleSelectPlaylist = (playlist) => {
        addSongToPlaylist(playlist.id);
    };

    useEffect(() => {
        fetchPlaylists();
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
                <Text style={styles.header}>Which Playlist would you like to add this song to?</Text>
            </View>
            <TextInput
                style={styles.searchBar}
                placeholder="Search playlists by name..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredPlaylists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.playlistContainer}
                        onPress={() => handleSelectPlaylist(item)}
                    >
                        <Image
                            source={{
                                uri: item.images[0]?.url || require('../assets/logo/album.png'),
                            }}
                            style={styles.playlistImage}
                        />
                        <Text style={styles.playlistName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No playlists found.</Text>}
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
    searchBar: {
        backgroundColor: '#F8EEDF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    playlistContainer: {
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
    playlistImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        marginRight: 16,
    },
    playlistName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    successText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#CA5038',
        padding: 10,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
