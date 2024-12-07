import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import * as Crypto from 'expo-crypto';
import bcrypt from 'react-native-bcrypt';
import { getCurrentlyPlaying } from './spotify';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

bcrypt.setRandomFallback((len) => {
  const randomBytes = Crypto.getRandomBytes(len);
  return Array.from(randomBytes).map((byte) => String.fromCharCode(byte)).join('');
});

/**
 * Creates a new account in Firebase and stores user data in AsyncStorage.
 * @param {Object} userProfile - The user's profile data.
 * @returns {Promise<Object>} - The newly created user data.
 */
export const createAccount = async (userProfile) => {
  try {
    let profilePicUrl = userProfile.profilePicUri;

    if (profilePicUrl && !profilePicUrl.startsWith("http")) {
      const fileInfo = await FileSystem.getInfoAsync(profilePicUrl);
      if (!fileInfo.exists) {
        throw new Error("Selected file does not exist.");
      }

      const fileName = `${userProfile.id}_profilePic.jpg`;
      const storageRef = ref(storage, `profilePictures/${fileName}`);

      const response = await fetch(profilePicUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the file.");
      }

      const blob = await response.blob();
      const uploadResult = await uploadBytes(storageRef, blob);

      profilePicUrl = await getDownloadURL(uploadResult.ref);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userProfile.password, salt);

    const userData = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      password: hashedPassword,
      profilePic: profilePicUrl || null,
      createdAt: new Date().toISOString(),
      isGhostMode: userProfile.isGhostMode ?? false,
      isGridView: userProfile.isGridView ?? false,
      likedSongs: [],
      currentlyPlaying: null,
      location: null,
    };

    await setDoc(doc(db, 'users', userProfile.id), userData);

    await AsyncStorage.setItem('userData', JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("Error creating account:", error.message);
    throw error;
  }
};

/**
 * Checks if an account exists for a given Spotify ID in the Firebase database.
 * @param {string} spotifyId - The Spotify ID of the user.
 * @returns {Promise<boolean>} - Whether the account exists.
 */
export const checkExistingAccountBySpotifyId = async (spotifyId) => {
  try {
    const userDocRef = doc(db, 'users', spotifyId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking existing account by Spotify ID:', error.message);
    throw error;
  }
};

/**
 * Validates the user's password by checking against the stored password in Firebase.
 * @param {string} spotifyId - The Spotify ID of the user.
 * @param {string} enteredPassword - The password entered by the user.
 * @returns {Promise<boolean>} - Returns `true` if the password is valid, `false` otherwise.
 */
export const validatePassword = async (spotifyId, enteredPassword) => {
  try {
    if (!spotifyId) throw new Error("Spotify ID is required to validate password.");

    const userDocRef = doc(db, "users", spotifyId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error(`User with ID ${spotifyId} does not exist.`);
      return false;
    }

    const userData = userDoc.data();
    if (!userData?.password) {
      console.error("Password field is missing for the user.");
      return false;
    }

    console.log("Entered Password:", enteredPassword);
    console.log("Stored Hash:", userData.password);

    const isMatch = bcrypt.compareSync(enteredPassword, userData.password);
    console.log("Password Match:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error validating password:", error.message);
    return false;
  }
};

/**
 * Fetches a user's profile details from Firestore based on Spotify user ID.
 * @param {string} userId - The Spotify user ID.
 * @returns {Promise<Object>} - The essential user's profile data.
 */
export const fetchUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error(`No user found with Spotify ID: ${userId}`);
    }

    const userData = userDoc.data();

    const userProfile = {
      username: userData.username || 'Anonymous User',
      profilePic: userData.profilePic || null,
      currentlyPlaying: {
        albumCover: userData.currentlyPlaying?.albumCover || null,
        artistName: userData.currentlyPlaying?.artistName || 'Unknown Artist',
        trackName: userData.currentlyPlaying?.trackName || 'No track playing',
        uri: userData.currentlyPlaying?.uri || '',
      },
      location: {
        latitude: userData.location?.latitude || 0,
        longitude: userData.location?.longitude || 0,
      },
      isGhostMode: userData.isGhostMode ?? false,
      isGridView: userData.isGridView ?? false,
      likedSongs: userData.likedSongs || [],
      lastUpdated: userData.lastUpdated || new Date().toISOString(),
    };

    await AsyncStorage.setItem('userData', JSON.stringify(userProfile));

    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    throw error;
  }
};

/**
 * Signs the user out by clearing the session data in AsyncStorage.
 * @returns {Promise<void>} Resolves when the user is signed out successfully.
 */
export const signOut = async () => {
  try {
    console.log("Signing out...");

    await AsyncStorage.clear();

    console.log("User session cleared successfully.");
  } catch (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};

/**
 * Deletes a user's account from Firestore by their Spotify ID.
 * @param {string} id - The Spotify ID of the user to delete.
 * @returns {Promise<void>} - Resolves when the account is deleted successfully.
 */
export const deleteAccount = async (id) => {
  // TODO
  // Step 1: Validate that the `id` parameter is provided. Throw an error if it's missing.

  // Step 2: Use Firestore's `deleteDoc` function to remove the user document associated with the given ID.

  // Step 3: Clear all cached user data in `AsyncStorage` to ensure local consistency.

  // Step 4: Log the success or any errors that occur during the deletion process for debugging.
};

/**
 * Updates a user's display name.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} newDisplayName - The new display name for the user.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updateDisplayName = async (userId, newDisplayName) => {
  // TODO
  // Step 1: Validate that both `userId` and `newDisplayName` are provided. Throw an error if either is missing.

  // Step 2: Use Firestore's `updateDoc` method to update the `username` field for the specified `userId`.

  // Step 3: Update the cached user data in `AsyncStorage` to ensure consistency across sessions.

  // Step 4: Log the success or any errors during the update process.
};

/**
 * Updates a user's profile picture.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} profilePicUri - The local URI or URL of the new profile picture.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updateProfilePicture = async (userId, profilePicUri) => {
  // Step 1: Validate that both `userId` and `profilePicUri` are provided. Throw an error if either is missing.

  // Step 2: Check if the file at `profilePicUri` exists locally. Throw an error if it does not.

  // Step 3: Upload the file to Firebase Storage under a unique name associated with the user.

  // Step 4: Retrieve the file's download URL from Firebase Storage after upload.

  // Step 5: Use Firestore's `updateDoc` method to update the `profilePic` field for the specified `userId`.

  // Step 6: Update the cached user data in `AsyncStorage` to reflect the new profile picture.

  // Step 7: Log the success or any errors during the update process.
};

/**
 * Updates a user's password.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} newPassword - The new password for the user.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updatePassword = async (userId, newPassword) => {
  // Step 1: Validate that both `userId` and `newPassword` are provided. Throw an error if either is missing.

  // Step 2: Generate a new hashed password using `bcrypt`.

  // Step 3: Use Firestore's `updateDoc` method to update the `password` field for the specified `userId`.

  // Step 4: Update the cached user data in `AsyncStorage` to ensure the updated password is reflected locally.

  // Step 5: Log the success or any errors during the update process.
};

/**
 * Checks if Ghost Mode is enabled for the current user.
 * @returns {Promise<boolean>} - Returns `true` if Ghost Mode is enabled, `false` otherwise.
 */
export const isGhostMode = async () => {
  try {
    const cachedData = JSON.parse(await AsyncStorage.getItem('userData'));

    if (cachedData?.isGhostMode !== undefined) {
      return cachedData.isGhostMode;
    }

    const userId = await AsyncStorage.getItem('spotifyUserId');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return false;
    }

    const firestoreData = userDoc.data();
    return firestoreData?.isGhostMode ?? false;
  } catch (error) {
    console.error('Error checking Ghost Mode:', error.message);
    throw error;
  }
};

/**
 * Toggles the user's Ghost Mode setting.
 * @param {boolean} enabled - Whether to enable or disable Ghost Mode.
 * @returns {Promise<boolean>} - Returns `true` if the update was successful, `false` otherwise.
 */
export const toggleGhostMode = async (enabled) => {
  try {
    const userId = await AsyncStorage.getItem('spotifyUserId');

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isGhostMode: enabled });

    const cachedData = JSON.parse(await AsyncStorage.getItem('userData'));
    const updatedData = { ...cachedData, isGhostMode: enabled };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));

    console.log("Ghost Mode updated successfully.");
    return true;

  } catch (error) {
    console.error("Error toggling Ghost Mode:", error.message);
    return false;
  }
};

/**
 * Checks if Grid View is enabled for the current user.
 * @returns {Promise<boolean>} - Returns `true` if Grid View is enabled, `false` otherwise.
 */
export const isGridView = async () => {
  try {
    const cachedData = JSON.parse(await AsyncStorage.getItem('userData'));

    if (cachedData?.isGridView !== undefined) {
      return cachedData.isGridView;
    }

    const userId = await AsyncStorage.getItem('spotifyUserId');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return false;
    }

    const firestoreData = userDoc.data();
    return firestoreData?.isGridView ?? false;
  } catch (error) {
    console.error('Error checking for Grid View:', error.message);
    throw error;
  }
};

/**
 * Toggles the user's Grid View setting.
 * @param {boolean} enabled - Whether to enable or disable Grid View.
 * @returns {Promise<boolean>} - Returns `true` if the update was successful, `false` otherwise.
 */
export const toggleGridView = async (enabled, {navigation}) => {
  try {
    const userId = await AsyncStorage.getItem('spotifyUserId');

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isGridView: enabled });

    const cachedData = JSON.parse(await AsyncStorage.getItem('userData'));
    const updatedData = { ...cachedData, isGridView: enabled };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));

    if (enabled) {
      navigation.navigate('Grid')

    } else {
      navigation.navigate('Map')
    }

    console.log("Grid View updated successfully.");
    return true;

  } catch (error) {
    console.error("Error toggling Grid View:", error.message);
    return false;
  }
};

/**
 * Periodically fetch Spotify data and update Firestore with the current activity.
 * @param {string} userId - The Spotify user ID.
 */
export const syncUserDataPeriodically = async (userId) => {
  try {
    const accessToken = await AsyncStorage.getItem('spotifyAccessToken');
    if (!accessToken) throw new Error('Spotify access token is missing.');

    const currentlyPlaying = await getCurrentlyPlaying(accessToken);

    const location = await Location.getCurrentPositionAsync();

    await updateUserActivity(userId, currentlyPlaying, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log('User activity synced.');
  } catch (error) {
    console.error('Error syncing user data:', error.message);
  }
};

/**
 * Updates a user's activity in Firestore, including their currently playing track and location.
 * @param {string} userId - The Spotify user ID.
 * @param {Object} currentlyPlaying - The user's currently playing track data.
 * @param {Object} location - The user's current location data.
 * @returns {Promise<void>} - Resolves when the user's activity has been successfully updated.
 */

export const updateUserActivity = async (userId, currentlyPlaying, location) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    // Update Firestore with `currentlyPlaying` and `location`
    await updateDoc(userDocRef, {
      currentlyPlaying: {
        trackName: currentlyPlaying?.trackName || 'No track playing',
        artistName: currentlyPlaying?.artistName || '',
        albumCover: currentlyPlaying?.albumCover || '',
        uri: currentlyPlaying?.uri || '',
      },
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      lastUpdated: new Date().toISOString(),
    });

    console.log(`Updated activity for user ${userId}.`);
  } catch (error) {
    console.error('Error updating user activity:', error.message);
    throw error;
  }
};

/**
 * Checks if a song is in the user's liked songs.
 * @param {string} userId - The user ID.
 * @param {string} songUri - The URI of the song to check.
 * @returns {Promise<boolean>} - Returns `true` if the song is liked, `false` otherwise.
 */
export const isSongLiked = async (userId, songUri) => {
  try {
    const cachedUserDataString = await AsyncStorage.getItem('userData');
    const cachedUserData = cachedUserDataString ? JSON.parse(cachedUserDataString) : {};

    if (cachedUserData.likedSongs && cachedUserData.likedSongs.includes(songUri)) {
      return true;
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    const userData = userDoc.data();
    return (userData.likedSongs || []).includes(songUri);
  } catch (error) {
    console.error('Error checking if song is liked:', error.message);
    return false;
  }
};

/**
 * Adds a song to the user's liked songs.
 * @param {string} userId - The user ID.
 * @param {Object} song - The song data.
 * @returns {Promise<boolean>} - Returns `true` if the song was successfully added, `false` otherwise.
 */
export const addSongToLikes = async (userId, song) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    const userData = userDoc.data();
    const likedSongs = userData.likedSongs || [];

    const songExists = likedSongs.some((likedSong) => likedSong.uri === song.uri);
    if (songExists) {
      console.log('Song already exists in liked songs.');
      return false;
    }

    const updatedLikedSongs = [...likedSongs, song];

    await updateDoc(userDocRef, { likedSongs: updatedLikedSongs });

    console.log('Song added to liked songs successfully.');
    return true;
  } catch (error) {
    console.error('Error adding song to liked songs:', error.message);
    return false;
  }
};

/**
 * Removes a song from the user's liked songs.
 * @param {string} userId - The user ID.
 * @param {string} songUri - The URI of the song to remove.
 * @returns {Promise<boolean>} - Returns `true` if the song was successfully removed, `false` otherwise.
 */
export const removeSongFromLikes = async (userId, songUri) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    const userData = userDoc.data();
    const updatedLikedSongs = (userData.likedSongs || []).filter((song) => song.uri !== songUri);

    await updateDoc(userDocRef, { likedSongs: updatedLikedSongs });

    return true;
  } catch (error) {
    console.error('Error removing song from liked songs:', error.message);
    return false;
  }
};
