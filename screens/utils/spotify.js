import * as Crypto from 'expo-crypto';
import { encode as btoa } from 'base-64';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const CLIENT_ID = '6418fb58c7fe4f60bddd2d5a5a970888';
const REDIRECT_URI = makeRedirectUri({ scheme: 'soundscout' });
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Utility Functions
const generateRandomString = async (length) => {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(randomBytes)
    .map((byte) => possibleChars[byte % possibleChars.length])
    .join('');
};

const sha256 = async (plain) => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, plain);
};

const base64EncodeUrlSafe = (input) => {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// Authentication Functions
const initiateSpotifyAuth = async () => {
  const codeVerifier = await generateRandomString(64);
  const hashedVerifier = await sha256(codeVerifier);
  const codeChallenge = base64EncodeUrlSafe(hashedVerifier);

  const scope = 'user-read-private user-read-email user-read-playback-state';
  const authUrl = new URL(SPOTIFY_AUTH_URL);

  authUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    code_challenge_method: 'S256',
    code_challenge,
    redirect_uri: REDIRECT_URI,
    show_dialog: true,
  }).toString();

  return { url: authUrl.toString(), codeVerifier };
};

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
    throw new Error(`Token exchange failed: ${await response.text()}`);
  }

  const tokenData = await response.json();
  await AsyncStorage.setItem('spotifyAccessToken', tokenData.access_token);
  await AsyncStorage.setItem('spotifyRefreshToken', tokenData.refresh_token);

  return tokenData;
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('spotifyRefreshToken');

  if (!refreshToken) throw new Error('Nfo refresh token available.');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${await response.text()}`);
  }

  const tokenData = await response.json();
  await AsyncStorage.setItem('spotifyAccessToken', tokenData.access_token);

  return tokenData.access_token;
};

// Callback & User Data Functions
const parseCallbackUrl = (callbackUrl) => {
  const urlParams = new URLSearchParams(new URL(callbackUrl).search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) throw new Error(`Authorization failed: ${error}`);
  if (!code) throw new Error('Authorization code not found.');

  return code;
};

const handleAuthCallback = async (code, codeVerifier) => {
  const tokenData = await exchangeToken(code, codeVerifier);
  if (!tokenData.scope.includes('user-read-playback-state')) {
    throw new Error('Required scope missing. Reauthorize with proper permissions.');
  }
  return tokenData;
};

const getUserProfile = async (accessToken) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${await response.text()}`);
  }

  return response.json();
};

const getCurrentlyPlaying = async (accessToken) => {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // If no content (204), return null
  if (response.status === 204) {
    return null;
  }

  // If response is not ok, log the error and return null
  if (!response.ok) {
    console.error(`Failed to fetch currently playing track: ${await response.text()}`);
    return null;
  }

  // Parse and return JSON safely
  try {
    const data = await response.json();
    return {
      trackName: data.item?.name || null,
      artistName: data.item?.artists.map((artist) => artist.name).join(', ') || null,
      albumCover: data.item?.album?.images?.[0]?.url || null,
    };
  } catch (error) {
    console.error('Error parsing currently playing response:', error);
    return null;
  }
};

// Export Functions
export {
  initiateSpotifyAuth,
  exchangeToken,
  refreshAccessToken,
  parseCallbackUrl,
  handleAuthCallback,
  getUserProfile,
  getCurrentlyPlaying,
};
