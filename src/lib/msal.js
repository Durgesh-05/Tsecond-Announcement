'use client';

import { PublicClientApplication } from '@azure/msal-browser';

let _msalInstance = null;

export function getMsalInstance() {
  if (typeof window === 'undefined') return null;
  if (!_msalInstance) {
    _msalInstance = new PublicClientApplication({
      auth: {
        clientId: process.env.NEXT_PUBLIC_MS_CLIENT_ID,
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: `${window.location.origin}/signin`,
      },
      cache: {
        cacheLocation: 'sessionStorage',
      },
    });
  }
  return _msalInstance;
}

export function clearMsalInteraction() {
  if (typeof window === 'undefined') return;
  Object.keys(sessionStorage).forEach((key) => {
    if (key.includes('interaction.status')) {
      sessionStorage.removeItem(key);
    }
  });
}
