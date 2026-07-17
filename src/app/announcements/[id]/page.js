'use client';

import { use, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import AuthGuard from '@/app/components/AuthGuard';
import Header from '@/app/components/Header';
import LiveSelfieCapture from '@/app/components/LiveSelfieCapture';
import { fetchAnnouncementById, acknowledgeAnnouncementApi } from '@/lib/announcementsApi';
import { getApiErrorMessage } from '@/lib/apiClient';

export default function AnnouncementPage({ params }) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <Header title="Announcement" backHref="/" />
      <AnnouncementDetail id={id} />
    </AuthGuard>
  );
}

function AnnouncementDetail({ id }) {
  const { data, error, isLoading, mutate } = useSWR(`/announcements/${id}`, async () => {
    const res = await fetchAnnouncementById(id);
    return res.data;
  });

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 text-center text-gray-400 sm:px-4 sm:py-6">
        Announcement not found.
      </main>
    );
  }

  const handleConfirm = async (selfieBlob) => {
    setSubmitting(true);
    try {
      await toast.promise(acknowledgeAnnouncementApi(id, { selfie: selfieBlob }), {
        loading: 'Submitting acknowledgement…',
        success: 'Acknowledged!',
        error: (err) => getApiErrorMessage(err, 'Failed to acknowledge'),
      });

      await mutate();
    } catch {
      // toast already surfaced the error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h1 className="text-lg font-semibold text-black">{data.title}</h1>
        {data.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {data.description}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        {data.isAcknowledgedByMe ? (
          <div className="flex items-center gap-2.5 text-black">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">You&apos;ve acknowledged this announcement.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <label className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-black"
              />
              I agree to share my live selfie with this organization to acknowledge this
              announcement.
            </label>

            <LiveSelfieCapture disabled={!agreed} submitting={submitting} onConfirm={handleConfirm} />
          </div>
        )}
      </div>
    </main>
  );
}
