import { apiClient } from './apiClient';
import { setTokens, clearTokens } from './tokenStore';

export async function microsoftLoginApi(payload) {
  const res = await apiClient.post('/auth/microsoft/login', payload);
  const { accessToken, refreshToken } = res.data?.data ?? {};
  if (accessToken || refreshToken) setTokens({ accessToken, refreshToken });
  return res.data;
}

export async function logoutApi() {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  } finally {
    clearTokens();
  }
}

export async function fetchCurrentUser() {
  const res = await apiClient.get('/auth/me');
  return res.data;
}
