'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAnnouncementApi } from '@/lib/announcementsApi';
import { getApiErrorMessage } from '@/lib/apiClient';

export default function CreateAnnouncementModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await toast.promise(createAnnouncementApi({ title, description }), {
        loading: 'Publishing…',
        success: 'Announcement published',
        error: (err) => getApiErrorMessage(err, 'Failed to create announcement'),
      });
      reset();
      onCreated?.();
      onClose();
    } catch {
      // toast already surfaced the error
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-black">New announcement</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={200}
            className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-black"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={2000}
            rows={3}
            className="resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-black"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="mt-1 cursor-pointer rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
}
