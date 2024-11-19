import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { initiateSpotifyAuth, handleAuthCallback, getUserProfile } from '../api/spotify';

const LoginScreen = ({ navigation }) => {
  const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  };

  const clientId = '6418fb58c7fe4f60bddd2d5a5a970888';
  const redirectUri = makeRedirectUri({ scheme: 'soundscout' });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: ['user-read-private', 'user-read-email'],
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      const { code } = response.params;

      console.log('Authorization Code:', code);

      handleAuthCallback(code, request.codeVerifier)
        .then(async (tokenResponse) => {
          console.log('Access Token:', tokenResponse.access_token);

          // Fetch and log user profile
          const userProfile = await getUserProfile(tokenResponse.access_token);
          console.log('User Profile:', userProfile);

          navigation.navigate('Home', { token: tokenResponse.access_token });
        })
        .catch((error) => {
          console.error('Error during token exchange:', error);
        });
    }
  }, [response]);

  const handleSpotifySignUp = async () => {
    try {
      const { url, codeVerifier } = await initiateSpotifyAuth();
      console.log('Auth URL:', url);
      promptAsync({ url });
    } catch (error) {
      console.error('Error initiating Spotify authentication:', error.message);
    }
  };

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
          <Text style={styles.buttonText}>Sign Up with Spotify</Text>
        </TouchableOpacity>
        <Text style={styles.subText}>Already have an account?</Text>

        <TouchableOpacity>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#93CE89',
    justifyContent: 'center',
  },
  flatListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.6, // Adjust height for proper placement
  },
  carouselItem: {
    width,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subText1: {
    marginTop: 10,
    fontSize: 16,
    width: width * 0.8,
    color: '#555',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: '#CA5038',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  subText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 10,
  },
  signInText: {
    color: '#CA5038',
    fontSize: 14,
  },
});