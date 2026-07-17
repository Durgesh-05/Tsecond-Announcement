'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import AuthGuard from '@/app/components/AuthGuard';

export default function AdminGuard({ children }) {
  return (
    <AuthGuard>
      <RequireAdmin>{children}</RequireAdmin>
    </AuthGuard>
  );
}

function RequireAdmin({ children }) {
  const router = useRouter();
  const { isAdmin, isLoading } = useUser();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (isLoading || didRedirect.current) return;
    if (!isAdmin) {
      didRedirect.current = true;
      router.replace('/');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) return null;

  return children;
}
