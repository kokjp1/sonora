const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI 

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-currently-playing',
  'user-read-playback-state'
].join(' ');

const STORAGE_KEYS = {
  ACCESS: 'spotify_access_token',
  VERIFIER: 'spotify_code_verifier'
};

// SPOTIFY API TUTORIAL - 
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem(STORAGE_KEYS.VERIFIER, verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

// SPOTIFY API TUTORIAL 
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
function generateCodeVerifier(length = 128) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// SPOTIFY API TUTORIAL 
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// SPOTIFY API TUTORIAL 
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
export async function handleCallback() {
  const url = new URL(window.location.href);
  const authorizationCode = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (!authorizationCode && !error) return false; // not a callback visit

  if (error) {
    history.replaceState({}, document.title, location.pathname);
    return true;
  }

  const verifier = localStorage.getItem(STORAGE_KEYS.VERIFIER) || '';

  const body = new URLSearchParams();
  body.append('client_id', CLIENT_ID);
  body.append('grant_type', 'authorization_code');
  body.append('code', authorizationCode);
  body.append('redirect_uri', REDIRECT_URI);
  body.append('code_verifier', verifier);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const json = await response.json();
  if (response.ok && json.access_token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS, json.access_token);
  }

  history.replaceState({}, document.title, location.pathname);
  return true;
}

// Minimal helpers used by your Svelte page
export function hasToken() {
  return !!localStorage.getItem(STORAGE_KEYS.ACCESS);
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS);
  localStorage.removeItem(STORAGE_KEYS.VERIFIER);
}

export async function api(path) {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS);
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (response.status === 204) return null;
  if (!response.ok) {
    if (response.status === 401) localStorage.removeItem(STORAGE_KEYS.ACCESS);
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

// API ENDPOINT CALLS AKA FETCH REQUESTS 
export const getMe = () => api('/me');
export const getCurrentlyPlaying = () => api('/me/player/currently-playing');