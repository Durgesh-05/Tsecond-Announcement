'use client';

import axios from 'axios';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setTokens,
  clearTokens,
} from './tokenStore';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({ baseURL, withCredentials: true });

const refreshClient = axios.create({ baseURL, withCredentials: true });

let refreshPromise = null;

function withAuthHeaders(config) {
  const token = getStoredAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

apiClient.interceptors.request.use(withAuthHeaders);

function captureRotatedTokens(response) {
  const accessToken = response?.headers?.['x-tsecond-token'];
  const refreshToken = response?.headers?.['x-tsecond-refresh-token'];
  if (accessToken || refreshToken) setTokens({ accessToken, refreshToken });
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    const storedRefresh = getStoredRefreshToken();

    refreshPromise = refreshClient
      .post('/auth/refresh', {}, storedRefresh ? { headers: { 'X-Refresh-Token': storedRefresh } } : undefined)
      .then((res) => {
        const { accessToken, refreshToken } = res.data?.data ?? {};
        if (accessToken || refreshToken) setTokens({ accessToken, refreshToken });
        return accessToken ?? null;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => {
    captureRotatedTokens(response);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalConfig = error.config;

    captureRotatedTokens(error.response);

    if (
      status === 401 &&
      !originalConfig?._retry &&
      !originalConfig?.url?.includes('/auth/refresh') &&
      !originalConfig?.url?.includes('/auth/microsoft/login')
    ) {
      originalConfig._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalConfig);
      }
    }

    return Promise.reject(error);
  },
);

function firstDetailMessage(details) {
  if (!details || typeof details !== 'object') return null;
  for (const value of Object.values(details)) {
    if (typeof value === 'string' && value.trim()) return value;
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0];
  }
  return null;
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return firstDetailMessage(data?.error?.details) || data?.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
