// src/lib/spotify.js
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-currently-playing',
  'user-read-playback-state'
].join(' ');

const K = {
  ACCESS: "spotify_access_token",
  REFRESH: "spotify_refresh_token",
  EXPIRES_AT: "spotify_expires_at",
  TOKEN_TYPE: "spotify_token_type",
  STATE: "spotify_state",
  VERIFIER: "spotify_code_verifier",
  POST_LOGIN: "spotify_post_login_redirect",
  ERROR: "spotify_error"
};
const isBrowser = () => typeof window !== "undefined";

const b64url = a =>
  btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n = 64) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = isBrowser() ? crypto.getRandomValues(new Uint8Array(n)) : new Uint8Array(n);
  return [...arr].map(x => chars[x % chars.length]).join("");
};
const sha256 = async (s) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));

export function hasToken() {
  if (!isBrowser()) return false;
  const t = localStorage.getItem(K.ACCESS);
  const exp = +(localStorage.getItem(K.EXPIRES_AT) || 0);
  return !!t && Date.now() < exp - 5000;
}

export function logout() {
  if (!isBrowser()) return;
  Object.values(K).forEach(k => localStorage.removeItem(k));
}

export async function login() {
  if (!isBrowser()) return;
  const state = rand(16);
  const verifier = rand(64);
  const challenge = b64url(await sha256(verifier));

  localStorage.setItem(K.STATE, state);
  localStorage.setItem(K.VERIFIER, verifier);
  localStorage.setItem(K.POST_LOGIN, window.location.pathname || "/");

  const q = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${q.toString()}`);
}

/** Handle redirect callback: exchange code -> tokens */
export async function handleCallback() {
  if (!isBrowser()) return false;
  const p = new URLSearchParams(window.location.search);
  const code = p.get("code");
  const err = p.get("error");
  if (!code && !err) return false;

  if (err) {
    localStorage.setItem(K.ERROR, err);
    return true;
  }

  const expected = localStorage.getItem(K.STATE);
  if (expected && p.get("state") !== expected) {
    localStorage.setItem(K.ERROR, "state_mismatch");
    return true;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: localStorage.getItem(K.VERIFIER) || ""
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const j = await res.json();
  if (!res.ok) {
    localStorage.setItem(K.ERROR, j.error || "token_exchange_failed");
    return true;
  }

  const exp = Date.now() + (j.expires_in || 3600) * 1000;
  if (j.access_token) localStorage.setItem(K.ACCESS, j.access_token);
  if (j.refresh_token) localStorage.setItem(K.REFRESH, j.refresh_token);
  localStorage.setItem(K.TOKEN_TYPE, j.token_type || "Bearer");
  localStorage.setItem(K.EXPIRES_AT, String(exp));
  localStorage.removeItem(K.ERROR);

  if (history?.replaceState) history.replaceState({}, document.title, location.pathname);
  return true;
}

async function refresh() {
  if (!isBrowser()) return false;
  const rt = localStorage.getItem(K.REFRESH);
  if (!rt) return false;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: rt
  });

  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const j = await r.json();
  if (!r.ok) return false;

  const exp = Date.now() + (j.expires_in || 3600) * 1000;
  if (j.access_token) localStorage.setItem(K.ACCESS, j.access_token);
  if (j.refresh_token) localStorage.setItem(K.REFRESH, j.refresh_token);
  localStorage.setItem(K.TOKEN_TYPE, j.token_type || "Bearer");
  localStorage.setItem(K.EXPIRES_AT, String(exp));
  return true;
}

/** Minimal API helper: refresh token if needed, call Spotify API */
export async function api(path) {
  if (!isBrowser()) throw new Error("Browser only");
  if (!hasToken()) {
    const ok = await refresh();
    if (!ok) throw new Error("Not authenticated");
  }
  const t = localStorage.getItem(K.ACCESS);
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    let payload;
    try { payload = await res.json(); }
    catch { payload = { error: { status: res.status, message: res.statusText } }; }
    throw new Error(JSON.stringify(payload));
  }
  return res.json();
}

export const getMe = () => api("/me");
export const getCurrentlyPlaying = () => api("/me/player/currently-playing");

// s