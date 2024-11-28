import * as Crypto from 'expo-crypto';
import { encode as btoa } from 'base-64';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '6418fb58c7fe4f60bddd2d5a5a970888';
const REDIRECT_URI = makeRedirectUri({ scheme: 'soundscout' });
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

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

const handleAuthCallback = async (code, codeVerifier) => {
  const tokenData = await exchangeToken(code, codeVerifier);
  if (!tokenData.scope.includes('user-read-playback-state')) {
    throw new Error('Required scope missing. Reauthorize with proper permissions.');
  }
  console.log('Authorization code:', code);
  console.log('Code verifier:', codeVerifier);
  return tokenData;
};

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

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('spotifyRefreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available. User needs to log in again.');
  }

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
    const errorText = await response.text();
    console.error('Failed to refresh token:', errorText);
    throw new Error('Failed to refresh token. Please log in again.');
  }

  const tokenData = await response.json();
  await AsyncStorage.setItem('spotifyAccessToken', tokenData.access_token);

  return tokenData.access_token;
};

const ensureValidAccessToken = async () => {
  let accessToken = await AsyncStorage.getItem('spotifyAccessToken');

  if (!accessToken) {
    console.warn('Access token is missing. Attempting to refresh...');
    accessToken = await refreshAccessToken();
  }

  return accessToken;
};

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