'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { logoutApi } from '@/lib/authApi';
import { useUser } from '@/lib/useUser';
import { redirectToLogout } from '@/lib/authConfig';
import { getApiErrorMessage } from '@/lib/apiClient';

export default function Header({ title, backHref }) {
  const router = useRouter();
  const { user, mutate } = useUser();

  const handleLogout = async () => {
    try {
      await logoutApi();
      await mutate(null, { revalidate: false });
      redirectToLogout();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Logout failed'));
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-1">
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              className="-ml-1 cursor-pointer rounded-full p-1 transition hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </button>
          )}
          <div className="flex min-w-0 items-center gap-2 font-semibold text-black">
            {!backHref && <Megaphone className="h-5 w-5 shrink-0" />}
            <span className="truncate">{title ?? 'Announcements'}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden max-w-[140px] truncate text-sm text-gray-500 sm:inline">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            {/* <LogOut className="h-3.5 w-3.5" /> */}
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
