'use client';

import { ShieldOff } from 'lucide-react';
import { AUTH_URL, TOOL_NAME } from '@/lib/authConfig';
import { useUser } from '@/lib/useUser';

export default function NoAccess() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <ShieldOff className="h-6 w-6 text-gray-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900">
          You don&apos;t have access to {TOOL_NAME}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account doesn&apos;t include permission for this tool. Ask an administrator to
          grant access.
        </p>

        {user && (
          <p className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
            Signed in as <span className="font-medium text-gray-700">{user.email}</span>
            <span className="text-gray-400"> · </span>
            Role <span className="font-medium capitalize text-gray-700">{user.role}</span>
          </p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <a
            href={AUTH_URL}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
