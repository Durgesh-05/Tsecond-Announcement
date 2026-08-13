'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/lib/useUser';
import { redirectToLogin } from '@/lib/authConfig';

export default function AuthGuard({ children }) {
  const { user, isLoading } = useUser();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (isLoading || user || didRedirect.current) return;
    didRedirect.current = true;
    redirectToLogin();
  }, [user, isLoading]);

  if (isLoading || !user) {
    return <AuthSkeleton />;
  }

  return children;
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
    </div>
  );
}
