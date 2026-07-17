'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';

export default function AuthLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  return <>{children}</>;
}
