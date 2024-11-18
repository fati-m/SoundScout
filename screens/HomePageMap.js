import React from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';

export default function Map() {
    const INITIAL_REGION = {
        latitude: 43.074921,
        longitude: -89.403938,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    };

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
                >
                    {/* Custom Image for Marker */}
                    <Image
                        source={require('../assets/logo/soundScoutLogoNoBkgrd.png')}
                        style={styles.markerImage}
                    />

                    {/* Custom Callout */}
                    <Callout tooltip>
                        <View style={styles.calloutContainer}>
                            <Text style={styles.calloutText1}>
                                userName
                            </Text>
                            <Text style={styles.calloutText2}>
                                userDistance
                            </Text>
                            <Image
                                source={require('../assets/logo/profile.png')}
                                style={styles.calloutProfileImage}
                            />
                            <Text style={styles.calloutText3}>
                                Currently listening to...
                            </Text>
                            <Image
                                source={require('../assets/logo/album.png')}
                                style={styles.calloutAlbumImage}
                            />
                            <Text style={styles.calloutText4}>
                                artistName
                            </Text>
                            <Text style={styles.calloutText5}>
                                songName
                            </Text>
                            <TouchableOpacity style={styles.heartButton}>
                                <Image
                                    source={require('../assets/logo/heart.png')}
                                    style={styles.calloutHeartImage}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.plusButton}>
                                <Image
                                    source={require('../assets/logo/plus.png')}
                                    style={styles.calloutPlusImage}
                                />
                            </TouchableOpacity>
                            
                        </View>
                    </Callout>
                </Marker>

                {/* SoundScout logo in the bottom corner */ }
                <Image
                source={require('../assets/logo/SoundScoutBttm.png')}
                style={styles.overlayImage}
                />

            </MapView>
        </View>
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
        width: 50, // Set width here
        height: 50, // Set height here
        resizeMode: 'contain', // Optional: Maintains aspect ratio
    },
    overlayImage: {
        position: 'absolute', // Ensures the image is on top
        bottom: -95, // Distance from the bottom of the screen
        right: 20, // Distance from the right of the screen
        width: 275, // Image width
        height: 275, // Image height
        resizeMode: 'contain', // Optional: Maintains aspect ratio
    },
    calloutContainer: {
        backgroundColor: '#CA5038',
        borderColor: '#F8EEDF',
        borderWidth: 10,
        borderRadius: 18,
        padding: 10,
        maxWidth: 300,
        width: 220,
        height: 235,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    calloutProfileImage: {
        position: 'absolute',
        width: 45,
        height: 45,
        resizeMode: 'contain',
        left: 3,
        top: 3,
        marginBottom: 5,
    },
    calloutAlbumImage: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 15,
        resizeMode: 'contain',
        left: 15,
        top: 90,
        marginBottom: 5,
    },
    heartButton: {
        position: 'absolute',
        backgroundColor: '#F8EEDF',
        width: 40,
        height: 40,
        borderRadius: 12,
        resizeMode: 'contain',
        left: 110,
        top: 170,
        marginBottom: 5,
    },
    calloutHeartImage: {
        position: 'absolute',
        width: 60,
        height: 60,
        top: -8,
        left: -10,
        resizeMode: 'contain',
        marginBottom: 5,
    },
    plusButton: {
        position: 'absolute',
        backgroundColor: '#93CE89',
        width: 40,
        height: 40,
        borderRadius: 12,
        resizeMode: 'contain',
        left: 155,
        top: 170,
        marginBottom: 5,
    },
    calloutPlusImage: {
        position: 'absolute',
        width: 35,
        height: 35,
        borderRadius: 15,
        resizeMode: 'contain',
        right: 2.5,
        top: 2,
        marginBottom: 5,
    },
    calloutText1: {
        position: 'absolute',
        top: 7,
        left: 52,
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    calloutText2: {
        position: 'absolute',
        top: 30,
        left: 57,
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    calloutText3: {
        position: 'absolute',
        top: 55,
        left: 9,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    calloutText4: {
        position: 'absolute',
        top: 100,
        left: 95,
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    calloutText5: {
        position: 'absolute',
        top: 120,
        left: 98,
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },

});
