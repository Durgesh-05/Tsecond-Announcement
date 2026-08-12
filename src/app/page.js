'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { CheckCircle2, Megaphone, Plus } from 'lucide-react';
import AuthGuard from '@/app/components/AuthGuard';
import Header from '@/app/components/Header';
import CreateAnnouncementModal from '@/app/components/CreateAnnouncementModal';
import StatusBadge from '@/app/components/StatusBadge';
import { useUser } from '@/lib/useUser';
import { fetchAnnouncements } from '@/lib/announcementsApi';
import { formatDateTime, timeAgo } from '@/lib/formatDate';

function useAnnouncements() {
  const { data, error, isLoading, mutate } = useSWR('/announcements', async () => {
    const res = await fetchAnnouncements();
    return res.data ?? [];
  });
  return { announcements: data ?? [], isLoading, isError: error, mutate };
}

export default function HomePage() {
  return (
    <AuthGuard>
      <Header />
      <AnnouncementBoard />
    </AuthGuard>
  );
}

function AnnouncementBoard() {
  const { isAdmin } = useUser();
  const { announcements, isLoading, mutate } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </main>
    );
  }

  if (announcements.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Megaphone className="h-6 w-6 text-black" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-black">No announcements yet</h1>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          {isAdmin
            ? 'Publish your first announcement so your team can acknowledge it.'
            : 'Check back soon — nothing has been posted yet.'}
        </p>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 flex items-center gap-1.5 cursor-pointer rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create announcement
          </button>
        )}

        <CreateAnnouncementModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={mutate}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black">Announcements</h1>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <div
            key={a._id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition hover:border-gray-400 sm:flex-row sm:items-center sm:justify-between sm:p-4"
          >
            <Link href={`/announcements/${a._id}`} className="min-w-0 flex-1 cursor-pointer">
              <p className="truncate font-medium text-black">{a.title}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {timeAgo(a.createdAt)}
                {!a.isClosed && a.closesAt && ` · Closes ${formatDateTime(a.closesAt)}`}
              </p>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              {a.isAcknowledgedByMe && (
                <span className="flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Acknowledged
                </span>
              )}
              <StatusBadge isClosed={a.isClosed} />
            </div>
          </div>
        ))}
      </div>

      <CreateAnnouncementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={mutate}
      />
    </main>
  );
}
