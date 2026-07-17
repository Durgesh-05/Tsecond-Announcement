'use client';

import useSWR from 'swr';
import { fetchCurrentUser } from './authApi';

const ADMIN_ROLES = ['admin', 'superadmin'];

const fetcher = async () => {
  try {
    const res = await fetchCurrentUser();
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // not signed in
  }
  return null;
};

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR('/auth/me', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  return {
    user: data,
    isAdmin: !!data?.role && ADMIN_ROLES.includes(data.role),
    isLoading,
    isError: error,
    mutate,
  };
}
