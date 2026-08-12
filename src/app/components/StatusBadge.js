'use client';

import { Lock, Unlock } from 'lucide-react';

export default function StatusBadge({ isClosed }) {
  if (isClosed) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        <Lock className="h-3.5 w-3.5" />
        Closed
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
      <Unlock className="h-3.5 w-3.5" />
      Open
    </span>
  );
}
