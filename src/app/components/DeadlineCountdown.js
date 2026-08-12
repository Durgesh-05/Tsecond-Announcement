'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/formatDate';

function remainingMs(closesAt) {
  const target = new Date(closesAt).getTime();
  return Number.isNaN(target) ? null : target - Date.now();
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function DeadlineCountdown({ closesAt, onExpire }) {
  const [ms, setMs] = useState(() => remainingMs(closesAt));
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const target = new Date(closesAt).getTime();
    if (Number.isNaN(target)) return;

    let fired = false;
    const timer = setInterval(() => {
      const next = target - Date.now();
      setMs(next);
      if (next > 0 || fired) return;
      fired = true;
      clearInterval(timer);
      onExpireRef.current?.();
    }, 1000);

    return () => clearInterval(timer);
  }, [closesAt]);

  if (ms === null) return null;

  if (ms <= 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="h-3.5 w-3.5" />
        Deadline reached — checking status…
      </span>
    );
  }

  const urgent = ms < 3600000;

  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${urgent ? 'font-medium text-black' : 'text-gray-500'}`}
    >
      <Clock className="h-3.5 w-3.5" />
      Closes in {formatRemaining(ms)}
      <span className="text-gray-400">· {formatDateTime(closesAt)}</span>
    </span>
  );
}
