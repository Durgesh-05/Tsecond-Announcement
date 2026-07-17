'use client';

import { use, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Search } from 'lucide-react';
import AdminGuard from '@/app/components/AdminGuard';
import Header from '@/app/components/Header';
import { fetchAnnouncementById, fetchAcknowledgements } from '@/lib/announcementsApi';

export default function AdminAnnouncementPage({ params }) {
  const { id } = use(params);

  return (
    <AdminGuard>
      <Header title="Acknowledgements" backHref={`/announcements/${id}`} />
      <AdminAnnouncementDetail id={id} />
    </AdminGuard>
  );
}

function AdminAnnouncementDetail({ id }) {
  const { data: announcement } = useSWR(`/announcements/${id}`, async () => {
    const res = await fetchAnnouncementById(id);
    return res.data;
  });

  const { data: acknowledgements, isLoading } = useSWR(
    `/announcements/${id}/acknowledgements`,
    async () => {
      const res = await fetchAcknowledgements(id);
      return res.data ?? [];
    },
  );

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return acknowledgements ?? [];
    return (acknowledgements ?? []).filter(
      (ack) =>
        ack.user?.name?.toLowerCase().includes(term) ||
        ack.user?.email?.toLowerCase().includes(term),
    );
  }, [acknowledgements, search]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="mb-1 text-lg font-semibold text-black">{announcement?.title}</h1>
      <p className="mb-4 text-sm text-gray-500">
        {acknowledgements?.length ?? 0} acknowledgement{acknowledgements?.length === 1 ? '' : 's'}
      </p>

      {!isLoading && (acknowledgements?.length ?? 0) > 0 && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-gray-300 py-2.5 pr-3.5 pl-9 text-sm text-black outline-none transition focus:border-black"
          />
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {!isLoading && acknowledgements?.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-400">No one has acknowledged this yet.</p>
      )}

      {!isLoading && acknowledgements?.length > 0 && filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-400">
          No results for &ldquo;{search}&rdquo;.
        </p>
      )}

      <div className="flex max-h-[65vh] flex-col gap-2.5 overflow-y-auto pr-1">
        {filtered.map((ack) => (
          <div
            key={ack._id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={ack.imageUrl}
                alt={ack.user?.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-black">{ack.user?.name}</p>
                <p className="truncate text-xs text-gray-400">{ack.user?.email}</p>
              </div>
            </div>
            <span className="shrink-0 pl-1 text-xs text-gray-400 sm:ml-auto sm:pl-0 sm:text-right">
              {new Date(ack.acknowledgedAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
