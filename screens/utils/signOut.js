import AsyncStorage from '@react-native-async-storage/async-storage';

const signOut = async () => {
  try {
    console.log('Signing out...');
    await AsyncStorage.removeItem('spotifyAccessToken');
    await AsyncStorage.removeItem('spotifyRefreshToken');
    await AsyncStorage.removeItem('spotifyCodeVerifier'); 
    await AsyncStorage.removeItem('spotifyUserProfile');
    console.log('User session cleared successfully.');
  } catch (error) {
    console.error('Error during sign-out:', error);
  }
};

export default signOut;
