'use client';

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({ baseURL, withCredentials: true });

const refreshClient = axios.create({ baseURL, withCredentials: true });

let refreshPromise = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((res) => res.data?.data?.accessToken ?? null)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalConfig = error.config;

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

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    return msg || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
