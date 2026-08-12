'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Lock, Unlock, X } from 'lucide-react';
import { updateAnnouncementStatusApi } from '@/lib/announcementsApi';
import { getApiErrorMessage } from '@/lib/apiClient';
import { formatDateTime, toDateTimeLocalValue } from '@/lib/formatDate';

export default function AnnouncementStatusControl({ announcement, onUpdated, showDeadline = false }) {
  const [pending, setPending] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [deadline, setDeadline] = useState(() => toDateTimeLocalValue(announcement.closesAt));

  const patch = async (payload, loading) => {
    setPending(true);
    try {
      const res = await updateAnnouncementStatusApi(announcement._id, payload);
      toast.success(res.message || loading);
      onUpdated?.(res.data);
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update announcement'));
      return false;
    } finally {
      setPending(false);
    }
  };

  const toggleClosed = () =>
    patch({ status: announcement.isClosed ? 'open' : 'closed' }, 'Status updated');

  const saveDeadline = async () => {
    if (!deadline) return;
    const iso = new Date(deadline).toISOString();
    if (await patch({ closesAt: iso }, 'Deadline set')) setDeadlineOpen(false);
  };

  const clearDeadline = async () => {
    if (await patch({ closesAt: null }, 'Deadline cleared')) setDeadlineOpen(false);
  };

  const openPicker = (event) => {
    try {
      event.currentTarget.showPicker();
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleClosed}
          disabled={pending}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {announcement.isClosed ? (
            <>
              <Unlock className="h-3.5 w-3.5" />
              {pending ? 'Reopening…' : 'Reopen'}
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              {pending ? 'Closing…' : 'Close'}
            </>
          )}
        </button>

        {showDeadline && !deadlineOpen && (
          <button
            type="button"
            onClick={() => setDeadlineOpen(true)}
            disabled={pending}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {announcement.closesAt ? 'Change deadline' : 'Set deadline'}
          </button>
        )}
      </div>

      {showDeadline && deadlineOpen && (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <label htmlFor="closesAt" className="text-xs font-medium text-gray-700">
              Auto-close at
            </label>
            <button
              type="button"
              onClick={() => setDeadlineOpen(false)}
              className="cursor-pointer rounded-full p-1 text-gray-400 transition hover:bg-gray-200 hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Cancel</span>
            </button>
          </div>

          <input
            id="closesAt"
            type="datetime-local"
            value={deadline}
            min={toDateTimeLocalValue()}
            onChange={(e) => setDeadline(e.target.value)}
            onClick={openPicker}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-black outline-none focus:border-black"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveDeadline}
              disabled={pending || !deadline}
              className="cursor-pointer rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save deadline'}
            </button>
            {announcement.closesAt && (
              <button
                type="button"
                onClick={clearDeadline}
                disabled={pending}
                className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear deadline
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-400">
            Must be in the future. To close it right now, use Close instead.
          </p>
        </div>
      )}

      {showDeadline && !deadlineOpen && announcement.closesAt && (
        <p className="text-xs text-gray-500">Closes {formatDateTime(announcement.closesAt)}</p>
      )}

      {showDeadline && announcement.isClosed && announcement.closedAt && (
        <p className="text-xs text-gray-500">
          Closed {formatDateTime(announcement.closedAt)}
          {announcement.closedBy?.name && ` by ${announcement.closedBy.name}`}
        </p>
      )}
    </div>
  );
}
