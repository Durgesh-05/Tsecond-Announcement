'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { CheckCircle2, Lock, Users } from 'lucide-react';
import AuthGuard from '@/app/components/AuthGuard';
import Header from '@/app/components/Header';
import LiveSelfieCapture from '@/app/components/LiveSelfieCapture';
import StatusBadge from '@/app/components/StatusBadge';
import AnnouncementStatusControl from '@/app/components/AnnouncementStatusControl';
import DeadlineCountdown from '@/app/components/DeadlineCountdown';
import {
  fetchAnnouncementById,
  acknowledgeAnnouncementApi,
  mergeAnnouncementUpdate,
} from '@/lib/announcementsApi';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useUser } from '@/lib/useUser';
import { formatDateTime } from '@/lib/formatDate';

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
  const { isAdmin } = useUser();
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
    const toastId = toast.loading('Submitting acknowledgement…');
    try {
      await acknowledgeAnnouncementApi(id, { selfie: selfieBlob, consent: agreed });
      toast.success('Acknowledged!', { id: toastId });
      await mutate().catch(() => {});
    } catch (err) {
      const status = err?.response?.status;
      toast.error(getApiErrorMessage(err, 'Failed to acknowledge'), { id: toastId });

      if (status === 409 || status === 404) await mutate().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-semibold text-black">{data.title}</h1>
          <div className="shrink-0">
            <StatusBadge isClosed={data.isClosed} />
          </div>
        </div>
        {data.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {data.description}
          </p>
        )}
        {!data.isClosed && data.closesAt && (
          <div className="mt-3">
            <DeadlineCountdown
              closesAt={data.closesAt}
              onExpire={() => mutate().catch(() => {})}
            />
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-black">Admin controls</p>
            <Link
              href={`/announcements/${id}/acknowledgements`}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black"
            >
              <Users className="h-3.5 w-3.5" />
              Responses
            </Link>
          </div>
          <AnnouncementStatusControl
            announcement={data}
            showDeadline
            onUpdated={(updated) =>
              mutate((prev) => mergeAnnouncementUpdate(prev ?? {}, updated), { revalidate: false })
            }
          />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        {data.isAcknowledgedByMe ? (
          <div className="flex items-center gap-2.5 text-black">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">You&apos;ve acknowledged this announcement.</p>
          </div>
        ) : data.isClosed ? (
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-black">
                Closed! No longer accepting responses.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {data.closedAt
                  ? `Closed on ${formatDateTime(data.closedAt)}${
                      data.closedBy?.name ? ` by ${data.closedBy.name}` : ''
                    }.`
                  : 'The deadline for acknowledging this announcement has passed.'}
              </p>
            </div>
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
