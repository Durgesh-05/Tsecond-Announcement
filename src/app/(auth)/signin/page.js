'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Megaphone, Camera, CheckCircle2 } from 'lucide-react';
import { microsoftLoginApi } from '@/lib/authApi';
import { useUser } from '@/lib/useUser';
import { getApiErrorMessage } from '@/lib/apiClient';
import { getMsalInstance, clearMsalInteraction } from '@/lib/msal';

const TIPS = [
  {
    icon: Megaphone,
    text: 'See every company announcement in one place.',
  },
  {
    icon: Camera,
    text: 'Acknowledge with a quick selfie - no forms, no typing.',
  },
  {
    icon: CheckCircle2,
    text: 'Takes about 10 seconds per announcement.',
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { mutate } = useUser();
  const [msLoading, setMsLoading] = useState(false);
  const msInitialized = useRef(false);

  useEffect(() => {
    if (msInitialized.current) return;
    msInitialized.current = true;

    (async () => {
      const msal = getMsalInstance();
      if (!msal) return;

      try {
        await msal.initialize();
        await msal.handleRedirectPromise();
      } catch (err) {
        console.error('[MSAL] redirect handling error', err);
      }

      const accounts = msal.getAllAccounts();
      if (accounts.length === 0) return;

      setMsLoading(true);
      try {
        const tokenResult = await msal.acquireTokenSilent({
          account: accounts[0],
          scopes: ['openid', 'profile', 'email'],
        });

        const result = await toast.promise(
          microsoftLoginApi({ idToken: tokenResult.idToken }),
          {
            loading: 'Verifying with Microsoft…',
            success: (res) => {
              if (!res.success) throw res;
              return res.message || 'Signed in';
            },
            error: (err) => getApiErrorMessage(err, 'Microsoft login failed'),
          },
        );

        if (result?.success && result.data) {
          await mutate(result.data, { revalidate: false });
          router.replace('/');
        }
      } catch (err) {
        console.error('[MSAL] post-redirect login failed', err);
      } finally {
        setMsLoading(false);
      }
    })();
  }, [router, mutate]);

  const handleMicrosoftLogin = async () => {
    setMsLoading(true);
    try {
      const msal = getMsalInstance();
      if (!msal) throw new Error('MSAL not available');
      await msal.initialize();
      clearMsalInteraction();
      await msal.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      });
    } catch (err) {
      console.error('[MSAL] loginRedirect error', err);
      setMsLoading(false);
      toast.error('Could not start Microsoft sign-in');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Sign in to Acknowledge
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Stay in the loop, in seconds.</p>
        </div>

        {/* <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <ul className="flex flex-col gap-3.5">
            {TIPS.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="pt-0.5 text-sm leading-snug text-zinc-700">{text}</span>
              </li>
            ))}
          </ul>
        </div> */}

        <button
          type="button"
          id="ms-login-btn"
          onClick={handleMicrosoftLogin}
          disabled={msLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 21 21"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          {msLoading ? 'Signing in…' : 'Continue with Microsoft'}
        </button>
      </div>
    </div>
  );
}
