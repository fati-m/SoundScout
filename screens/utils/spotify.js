import * as Crypto from 'expo-crypto';
import { encode as btoa } from 'base-64';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '6418fb58c7fe4f60bddd2d5a5a970888';
const REDIRECT_URI = makeRedirectUri({ scheme: 'soundscout' });
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Generates a cryptographically secure random string of the specified length.
 * @param {number} length - The length of the random string to generate.
 * @returns {Promise<string>} A promise that resolves to the random string.
 */
const generateRandomString = async (length) => {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(randomBytes)
    .map((byte) => possibleChars[byte % possibleChars.length])
    .join('');
};

/**
 * Computes the SHA-256 hash of the given plain text.
 * @param {string} plain - The input string to hash.
 * @returns {Promise<string>} A promise that resolves to the hash as a string.
 */
const sha256 = async (plain) => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, plain);
};

/**
 * Encodes a string in base64 URL-safe format.
 * @param {string} input - The string to encode.
 * @returns {string} The URL-safe base64 encoded string.
 */
const base64EncodeUrlSafe = (input) => {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

/**
 * Handles the Spotify authorization callback by exchanging the code for tokens and validating scopes.
 * @param {string} code - The authorization code from Spotify.
 * @param {string} codeVerifier - The original code verifier used during authorization.
 * @returns {Promise<Object>} A promise that resolves to the token data.
 */
const handleAuthCallback = async (code, codeVerifier) => {
  const tokenData = await exchangeToken(code, codeVerifier);
  if (!tokenData.scope.includes('user-read-playback-state')) {
    throw new Error('Required scope missing. Reauthorize with proper permissions.');
  }
  console.log('Authorization code:', code);
  console.log('Code verifier:', codeVerifier);
  return tokenData;
};

// /**
//  * Initiates the Spotify authorization process by constructing an authorization URL and generating a code verifier.
//  * @returns {Promise<Object>} A promise that resolves to an object containing the auth URL and code verifier.
//  */
// const initiateSpotifyAuth = async () => {
//   const codeVerifier = await generateRandomString(64);
//   const hashedVerifier = await sha256(codeVerifier);
//   const codeChallenge = base64EncodeUrlSafe(hashedVerifier);

//   const scope = 'user-read-private user-read-email user-read-playback-state';
//   const authUrl = new URL(SPOTIFY_AUTH_URL);

//   authUrl.search = new URLSearchParams({
//     response_type: 'code',
//     client_id: CLIENT_ID,
//     scope,
//     code_challenge_method: 'S256',
//     code_challenge,
//     redirect_uri: REDIRECT_URI,
//     show_dialog: true,
//   }).toString();

//   return { url: authUrl.toString(), codeVerifier };
// };

/**
 * Exchanges an authorization code for access and refresh tokens from Spotify.
 * @param {string} code - The authorization code received from Spotify.
 * @param {string} codeVerifier - The original code verifier used during authorization.
 * @returns {Promise<Object>} A promise that resolves to the token data.
 */
const exchangeToken = async (code, codeVerifier) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    console.error('Error in exchangeToken:', errorResponse);
    throw new Error(`Token exchange failed: ${JSON.stringify(errorResponse)}`);
  }

  const tokenData = await response.json();
  await AsyncStorage.setItem('spotifyAccessToken', tokenData.access_token);
  if (tokenData.refresh_token) {
    await AsyncStorage.setItem('spotifyRefreshToken', tokenData.refresh_token);
  }

  return tokenData;
};

/**
 * Ensures the current Spotify access token is valid, refreshing it if necessary.
 * @returns {Promise<string>} A promise that resolves to the valid access token.
 */
const ensureValidAccessToken = async () => {
  let accessToken = await AsyncStorage.getItem('spotifyAccessToken');

  if (!accessToken) {
    console.warn('Access token is missing. Attempting to refresh...');
    accessToken = await refreshAccessToken();
  }

  return accessToken;
};

/**
 * Fetches the current user's Spotify profile information.
 * @returns {Promise<Object>} A promise that resolves to the user's profile data.
 */
const getUserProfile = async () => {
  const accessToken = await ensureValidAccessToken();
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${await response.text()}`);
  }

  return response.json();
};

/**
 * Retrieves the current user's Spotify playlists.
 * @param {string} accessToken - The access token to authenticate the request.
 * @returns {Promise<Array>} A promise that resolves to an array of playlist objects.
 */
const getUserPlaylists = async (accessToken) => {
  const url = 'https://api.spotify.com/v1/me/playlists';
  const playlists = [];
  let nextUrl = url;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlists: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('Fetched page data:', data.items);

      playlists.push(...data.items.filter((item) => item !== null));
      nextUrl = data.next;
    }

    const mappedPlaylists = playlists
      .filter((playlist) => playlist?.id)
      .map((playlist) => ({
        id: playlist.id,
        name: playlist.name || 'Unnamed Playlist',
        images: playlist.images || [],
        tracksCount: playlist.tracks?.total || 0,
      }));

    console.log('Mapped Playlists:', mappedPlaylists);
    return mappedPlaylists;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

/**
 * Fetches the currently playing track information from Spotify.
 * @returns {Promise<Object|null>} A promise that resolves to the track data or null if no track is playing.
 */
const getCurrentlyPlaying = async () => {
  const accessToken = await ensureValidAccessToken();
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    console.error(`Failed to fetch currently playing track: ${await response.text()}`);
    return null;
  }

  try {
    const data = await response.json();
    return {
      trackName: data.item?.name || null,
      artistName: data.item?.artists.map((artist) => artist.name).join(', ') || null,
      albumCover: data.item?.album?.images?.[0]?.url || null,
      uri: data.item?.uri || null,
    };
  } catch (error) {
    console.error('Error parsing currently playing response:', error);
    return null;
  }
};

export {
  exchangeToken,
  handleAuthCallback,
  getUserProfile,
  getUserPlaylists,
  getCurrentlyPlaying,
  ensureValidAccessToken
};