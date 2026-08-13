'use client';

export const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';

export function redirectToLogin() {
  if (typeof window === 'undefined') return;

  if (window.__tsecondRedirecting) return;
  window.__tsecondRedirecting = true;

  const returnTo = encodeURIComponent(window.location.href);
  window.location.replace(`${AUTH_URL}/signin?redirect_uri=${returnTo}`);
}

export function redirectToLogout() {
  if (typeof window === 'undefined') return;
  window.location.replace(`${AUTH_URL}/signin`);
}
