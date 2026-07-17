@AGENTS.md

# Tsecond Announcements

Internal tool: employees sign in with Microsoft, view announcements, and acknowledge each one with
a device selfie + geolocation. Admins publish announcements and view who acknowledged them.

- Frontend only — backend lives in `../Tsecond-Backend` (`/api/announcements`, `/api/auth`).
  Model/route/controller changes for announcements belong there, not here.
- Plain JS (no TypeScript), App Router, Tailwind v4.
- Auth is Microsoft-only. `src/lib/msal.js` + `src/lib/authApi.js` mirror the pattern in
  `../Tsecond-Newsletter` — reuse that repo as reference before inventing a new auth approach.
- `src/lib/useUser.js` derives `isAdmin` from the backend's `role` field (`admin`/`superadmin`).
  Client-side admin gating (`AdminGuard`) is UX only — the backend is the actual authority.
- Selfie capture is a plain `<input type="file" accept="image/*" capture="user">`, not a custom
  camera component — keep it that way unless there's a concrete reason to build a live camera view.
- Dev server runs on port 3001 (`npm run dev`) so it doesn't collide with Tsecond-Newsletter on 3000.
