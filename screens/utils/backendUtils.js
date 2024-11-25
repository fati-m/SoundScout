import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Boilerplate for interacting with the Firebase backend or server-side API.
 * Backend team should implement corresponding endpoints in the server or Firebase functions.
 */

/**
 * Checks if an account exists for a given email in the Firebase database.
 * @param {string} email - The email address of the user.
 * @returns {Promise<boolean>} - Whether the account exists.
 */
export const checkExistingAccountByEmail = async (email) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/check-account', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email }), // Send the email to the backend
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to check account. Status: ${response.status}`);
  //   }

  //   const data = await response.json();
  //   return data.exists; // Backend should return { exists: true/false }
  // } catch (error) {
  //   console.error('Error checking existing account:', error);
  //   throw error;
  // }

  // BACKEND TEAM TODO: uncomment the above when implementing it
  return false;
};

/**
 * Authenticates a user using email and password.
 * Backend should:
 * - Validate the email and password.
 * - Return a valid access token and refresh token if authentication succeeds.
 * - Return appropriate error codes/messages if authentication fails.
 *
 * Expected Backend API Request:
 * - Endpoint: POST /sign-in
 * - Body: { email: string, password: string }
 *
 * Expected Backend API Response:
 * - On success: { accessToken: string, refreshToken: string }
 * - On failure: { error: string }
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - Object containing `accessToken` and `refreshToken`.
 * @throws Will throw an error if the authentication fails or if the response is not OK.
 */
export const signInWithEmail = async (email, password) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/sign-in', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!response.ok) {
  //     // Handle server-side error messages for better debugging
  //     const errorData = await response.json();
  //     throw new Error(errorData.error || `Failed to sign in. Status: ${response.status}`);
  //   }

  //   // Return accessToken and refreshToken from backend response
  //   return await response.json(); // Example response: { accessToken, refreshToken }
  // } catch (error) {
  //   console.error('Error during sign-in:', error);
  //   throw error; // Re-throw to handle in the calling function
  // }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'mockAccessToken12345',
        refreshToken: 'mockRefreshToken67890',
      });
    }, 500); // Simulate network delay
  });
};

/**
 * Creates a new account in Firebase.
 * Handles profile picture upload (if needed) and stores all account details.
 * @param {Object} userProfile - Object containing user details.
 * @param {string} userProfile.username - The username for the account.
 * @param {string} userProfile.email - The user's email address.
 * @param {string} userProfile.password - The user's password.
 * @param {string|null} userProfile.profilePicUri - The local URI of the profile picture (if uploading a new one).
 * @returns {Promise<Object>} - The created user data.
 */
export const createAccount = async (userProfile) => {
  // try {
  //   let profilePicUrl = userProfile.profilePicUri;

  //   // Check if the profile picture needs to be uploaded
  //   if (userProfile.profilePicUri && !userProfile.profilePicUri.startsWith('http')) {
  //     // Upload the profile picture to Firebase Storage
  //     const response = await fetch(userProfile.profilePicUri);
  //     const blob = await response.blob();

  //     const fileName = `${userProfile.email.replace(/[^a-zA-Z0-9]/g, '')}_profilePic.jpg`;
  //     const storage = getStorage();
  //     const storageRef = ref(storage, `profilePictures/${fileName}`);

  //     await uploadBytes(storageRef, blob);
  //     profilePicUrl = await getDownloadURL(storageRef); // Get the uploaded image URL
  //   }

  //   // Prepare user data for storage
  //   const userData = {
  //     username: userProfile.username,
  //     email: userProfile.email,
  //     profilePic: profilePicUrl, // Use the new or existing profile picture URL
  //     password: userProfile.password, // Ensure passwords are securely hashed by the backend
  //   };

  //   // Send user data to the backend to create the account in Firebase
  //   const response = await fetch('https://your-backend-api.com/create-account', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(userData),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to create account. Status: ${response.status}`);
  //   }

  //   return await response.json(); // Return the created account details
  // } catch (error) {
  //   console.error('Error creating account:', error);
  //   throw error;
  // }
};

/**
 * Deletes a user's account from the backend.
 * @param {string} userId - The SoundScout user ID.
 * @returns {Promise<void>} - No return data; resolves when successful.
 */
export const deleteAccount = async (userId) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/delete-account', {
  //     method: 'DELETE',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
  //     },
  //     body: JSON.stringify({ userId }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to delete account. Status: ${response.status}`);
  //   }
  // } catch (error) {
  //   console.error('Error deleting account:', error);
  //   throw error;
  // }
};

/**
 * Fetches a user's profile details from the backend.
 * @param {string} userId - The SoundScout user ID.
 * @returns {Promise<Object>} - User profile details.
 */
export const fetchUserProfile = async (userId) => {
  // try {
  //   const response = await fetch(`https://your-backend-api.com/user-profile/${userId}`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
  //   }

  //   return await response.json();
  // } catch (error) {
  //   console.error('Error fetching user profile:', error);
  //   throw error;
  // }
};

/**
 * Updates a user's location data in the backend.
 * @param {string} userId - The SoundScout user ID.
 * @param {Object} locationData - The user's location data (latitude and longitude).
 * @returns {Promise<void>} - No return data; resolves when successful.
 */
export const updateUserLocation = async (userId, locationData) => {
  try {
    const response = await fetch('https://your-backend-api.com/update-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
      },
      body: JSON.stringify({ userId, ...locationData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update location. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

/**
 * Fetches nearby users based on current location.
 * @param {Object} locationData - Current location data (latitude and longitude).
 * @returns {Promise<Array>} - List of nearby users and their details.
 */
export const fetchNearbyUsers = async (locationData) => {
  try {
    const response = await fetch('https://your-backend-api.com/nearby-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
      },
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nearby users. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    throw error;
  }
};

/**
 * Updates a user's display name.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} newDisplayName - The new display name for the user.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updateDisplayName = async (userId, newDisplayName) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/update-display-name', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
  //     },
  //     body: JSON.stringify({ userId, newDisplayName }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to update display name. Status: ${response.status}`);
  //   }
  // } catch (error) {
  //   console.error('Error updating display name:', error);
  //   throw error;
  // }
};

/**
 * Updates a user's profile picture.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} profilePicUri - The local URI or URL of the new profile picture.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updateProfilePicture = async (userId, profilePicUri) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/update-profile-picture', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
  //     },
  //     body: JSON.stringify({ userId, profilePicUri }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to update profile picture. Status: ${response.status}`);
  //   }
  // } catch (error) {
  //   console.error('Error updating profile picture:', error);
  //   throw error;
  // }
};

/**
 * Updates a user's password.
 * @param {string} userId - The SoundScout user ID.
 * @param {string} newPassword - The new password for the user.
 * @returns {Promise<void>} - Resolves when the update is successful.
 */
export const updatePassword = async (userId, newPassword) => {
  // try {
  //   const response = await fetch('https://your-backend-api.com/update-password', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${await AsyncStorage.getItem('spotifyAccessToken')}`,
  //     },
  //     body: JSON.stringify({ userId, newPassword }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to update password. Status: ${response.status}`);
  //   }
  // } catch (error) {
  //   console.error('Error updating password:', error);
  //   throw error;
  // }
};



