import React, { useRef, useState, useEffect, route } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { handleAuthCallback, getUserProfile } from './utils/spotify';
import { checkExistingAccountBySpotifyId, fetchUserProfile, isGridView } from './utils/backendUtils';
import SpotifyLogo from '../assets/2024-spotify-logo-icon/Primary_Logo_White_CMYK.svg';

export default function LoginScreen({ navigation }) {
  const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  };

  const clientId = '6418fb58c7fe4f60bddd2d5a5a970888';
  const redirectUri = makeRedirectUri({ scheme: 'soundscout' });
  console.log(redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'playlist-modify-public',
        'playlist-modify-private',
      ],
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  console.log('Generated codeVerifier:', request?.codeVerifier);


  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success' && response.params.code) {
        const { code } = response.params;

        try {
          const tokenResponse = await handleAuthCallback(code, request.codeVerifier);
          const { access_token, refresh_token } = tokenResponse;

          await AsyncStorage.setItem('spotifyAccessToken', access_token);
          await AsyncStorage.setItem('spotifyRefreshToken', refresh_token);

          const userProfile = await getUserProfile(access_token);

          await AsyncStorage.setItem('spotifyUserId', userProfile.id);

          const isExistingAccount = await checkExistingAccountBySpotifyId(userProfile.id);

          if (isExistingAccount) {
            const userData = await fetchUserProfile(userProfile.id);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            const gridViewEnabled = await isGridView();

            if (gridViewEnabled) {
              navigation.navigate('Grid');
            } else {
              navigation.navigate('Map');
            }
          } else {
            navigation.navigate('SignUp', { userProfile });
          }
        } catch (error) {
          console.error('Error during Spotify authentication:', error.message);
          Alert.alert('Error', 'An error occurred during authentication. Please try again.');
        }
      }
    };

    handleResponse();
  }, [response]);

  const carouselItems = [
    {
      id: '1',
      title: 'Welcome to SoundScout!',
      subText: 'Step into a world where music is more than just sound—it\'s a journey. Explore fresh tracks from your local scene and beyond, handpicked for your unique taste. Whether it\'s indie vibes from a nearby café or the latest club beats, we\'ve got your next favorite song waiting.',
      image: require('../assets/logo/SoundScout.gif'),
      imageStyle: {
        width: 300,
        height: 200,
        objectFit: 'contain',
        resizeMode: 'cover',
      },
    },
    {
      id: '2',
      title: 'Discover, Like, Share!',
      subText: 'Dive into genres you know and uncover sounds you\'ve never imagined. Like what you hear? Show some love by liking tracks and creating a playlist of your new discoveries. Music is just the beginning—connect with fellow listeners and share the vibe.',
      image: require('../assets/logo/together3.jpg'),
      imageStyle: {
        width: 300,
        height: 200,
        objectFit: 'contain',
        borderRadius: 20,
        resizeMode: 'cover',
      },
    },
    {
      id: '3',
      title: 'Let’s Get Started',
      subText: 'Ready to discover your next favorite track? Let\'s dive in and explore the sounds around you. Join a world of music, connect with others, and make every beat count.',
      image: require('../assets/logo/together4.jpg'),
      imageStyle: {
        width: 300,
        height: 200,
        objectFit: 'contain',
        borderRadius: 20,
        resizeMode: 'cover',
      },
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewRef = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselItems.length;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <Image source={item.image} style={item.imageStyle} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subText1}>{item.subText}</Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        ref={flatListRef}
        data={carouselItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        contentContainerStyle={styles.flatListContainer}
      />

      <View style={styles.dotsContainer}>
        {carouselItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#CA5038' : '#ddd' },
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.signUpButton}
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        >
          <Text style={styles.signUpButtonText}>Sign up/in with Spotify</Text>
          <SpotifyLogo width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#93CE89',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  flatListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  carouselItem: {
    width: Dimensions.get('window').width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Dimensions.get('window').width * 0.1,
  },
  title: {
    marginTop: 25,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 30,
  },
  subText1: {
    marginVertical: 10,
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 45,
  },
  signUpButton: {
    width: '80%',
    backgroundColor: '#CA5038',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#F8EEDF',
    fontWeight: 600,
    fontSize: 24,
    marginRight: 8,
  },
});