'use client';

import axios from 'axios';
import { redirectToLogin } from './authConfig';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({ baseURL, withCredentials: true });

const refreshClient = axios.create({ baseURL, withCredentials: true });

let refreshPromise = null;

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then(() => true)
      .catch(() => false)
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
      !originalConfig?.url?.includes('/auth/me')
    ) {
      originalConfig._retry = true;

      if (await refreshSession()) {
        return apiClient(originalConfig);
      }

      redirectToLogin();
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
