'use client';

const ACCESS_KEY = 'tsecond.announcements.accessToken';
const REFRESH_KEY = 'tsecond.announcements.refreshToken';

let accessToken = null;
let refreshToken = null;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    accessToken = window.localStorage.getItem(ACCESS_KEY);
    refreshToken = window.localStorage.getItem(REFRESH_KEY);
  } catch {
  }
}

function persist(key, value) {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
  }
}

export function getStoredAccessToken() {
  hydrate();
  return accessToken;
}

export function getStoredRefreshToken() {
  hydrate();
  return refreshToken;
}

export function setTokens({ accessToken: nextAccess, refreshToken: nextRefresh } = {}) {
  hydrate();
  if (typeof nextAccess === 'string' && nextAccess) {
    accessToken = nextAccess;
    persist(ACCESS_KEY, nextAccess);
  }
  if (typeof nextRefresh === 'string' && nextRefresh) {
    refreshToken = nextRefresh;
    persist(REFRESH_KEY, nextRefresh);
  }
}

export function clearTokens() {
  hydrate();
  accessToken = null;
  refreshToken = null;
  persist(ACCESS_KEY, null);
  persist(REFRESH_KEY, null);
}
