import * as Crypto from 'expo-crypto';
import { encode as btoa } from 'base-64';
import { makeRedirectUri } from 'expo-auth-session';

const generateRandomString = async (length) => {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(randomBytes)
    .map((byte) => possible[byte % possible.length])
    .join('');
};

const sha256 = async (plain) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    plain
  );
  return digest;
};

const base64encode = (input) => {
  return btoa(input)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const initiateSpotifyAuth = async () => {
  const codeVerifier = await generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const clientId = '6418fb58c7fe4f60bddd2d5a5a970888';
  const redirectUri = makeRedirectUri({ scheme: 'soundscout' });
  const scope = 'user-read-private user-read-email';
  const authUrl = new URL('https://accounts.spotify.com/authorize');

  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();

  return { url: authUrl.toString(), codeVerifier };
};

const exchangeToken = async (code, codeVerifier) => {
  const clientId = '6418fb58c7fe4f60bddd2d5a5a970888';
  const redirectUri = makeRedirectUri({ scheme: 'soundscout' });
  const tokenUrl = 'https://accounts.spotify.com/api/token';

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  console.log('Token Exchange Body:', body.toString()); // Debugging output

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Token Exchange Error Details:', errorDetails);
    throw new Error(`Token exchange failed with status ${response.status}`);
  }

  return response.json();
};

const parseCallbackUrl = (callbackUrl) => {
  try {
    const urlParams = new URLSearchParams(new URL(callbackUrl).search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    if (!code) {
      throw new Error('Authorization code not found.');
    }

    return code;
  } catch (error) {
    console.error('Failed to parse callback URL:', error.message);
    throw error;
  }
};

const handleAuthCallback = async (code, codeVerifier) => {
  try {
    // Directly pass the authorization code to exchangeToken
    const tokenResponse = await exchangeToken(code, codeVerifier);
    return tokenResponse;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    throw error;
  }
};

// New Function: Fetch User Profile
const getUserProfile = async (accessToken) => {
  const url = 'https://api.spotify.com/v1/me';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Error fetching user profile:', errorDetails);
    throw new Error(`Failed to fetch user profile with status ${response.status}`);
  }

  return response.json();
};

const getUserPlaylists = async (accessToken) => {
  //implement
};

export { initiateSpotifyAuth, exchangeToken, handleAuthCallback, getUserProfile, getUserPlaylists };
