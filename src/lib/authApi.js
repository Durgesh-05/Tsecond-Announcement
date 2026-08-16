import { apiClient } from './apiClient';

export async function fetchCurrentUser() {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

export async function logoutApi() {
  const res = await apiClient.post('/auth/logout');
  return res.data;
}
