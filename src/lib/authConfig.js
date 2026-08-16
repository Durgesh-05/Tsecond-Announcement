'use client';

export const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';

export const TOOL_PERMISSION = 'announcement:access';
export const TOOL_NAME = 'Announcements';

export function redirectToLogin() {
  if (typeof window === 'undefined') return;

  if (window.__tsecondRedirecting) return;
  window.__tsecondRedirecting = true;

  const returnTo = encodeURIComponent(window.location.href);
  window.location.replace(`${AUTH_URL}/signin?redirect_uri=${returnTo}`);
}

export function redirectToLogout() {
  if (typeof window === 'undefined') return;
  const returnTo = encodeURIComponent(window.location.origin);
  window.location.replace(`${AUTH_URL}/signin?redirect_uri=${returnTo}`);
}
