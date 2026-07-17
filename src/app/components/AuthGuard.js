'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (isLoading || didRedirect.current) return;

    if (!user) {
      didRedirect.current = true;
      router.replace('/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return null;
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
