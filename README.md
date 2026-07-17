# Tsecond Announcements

A minimal internal tool for acknowledging company announcements. An employee signs in with their
Microsoft work account, sees the list of announcements, and acknowledges each one by agreeing to a
consent checkbox and taking a live selfie through the browser's camera — no gallery upload, no
location tracking. Admins publish announcements inline from the board and can see who has
acknowledged what.

This is the frontend only — it talks to the existing [Tsecond-Backend](../Tsecond-Backend) API
(`/api/announcements`, `/api/auth`).

## Stack

- Next.js (App Router) + React, plain JS (no TypeScript)
- Tailwind CSS v4
- `@azure/msal-browser` — Microsoft sign-in (same Azure AD app registration as Tsecond-Newsletter)
- `axios` + `swr` — data fetching, with automatic access-token refresh on 401
- `react-hot-toast`, `lucide-react`

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_MS_CLIENT_ID=<same MS_CLIENT_ID the backend validates>
   ```
3. Run the dev server (port `3001`, since `Tsecond-Newsletter` already uses `3000`):
   ```bash
   npm run dev
   ```
4. Open http://localhost:3001

### Backend prerequisites

- `Tsecond-Backend`'s `ALLOWED_ORIGINS` must include this app's origin (e.g. `http://localhost:3001`)
  for CORS + cookies to work.
- The Azure AD app registration must have this app's `/signin` URL (e.g.
  `http://localhost:3001/signin`) added as a redirect URI.
- Sign-in is Microsoft-only, restricted to the tenants configured in the backend's
  `MS_ALLOWED_TENANT_IDS`.
- **HTTPS or localhost only.** Live camera capture uses `getUserMedia`, which browsers refuse to
  grant on plain HTTP. `http://localhost:3001` works fine for local dev; testing from a phone
  against your machine's LAN IP over HTTP will not prompt for camera permission — use a tunnel
  (e.g. ngrok) or deploy behind HTTPS to test on a real device.

## Project structure

```
src/lib/
  msal.js              MSAL instance (Microsoft login/redirect handling)
  apiClient.js         axios instance with cookie auth + refresh-on-401
  authApi.js           /auth/microsoft/login, /auth/logout, /auth/me
  useUser.js           SWR hook for the current user + isAdmin flag
  announcementsApi.js  announcement + acknowledgement API calls

src/app/
  (auth)/signin/                          Microsoft-only sign-in page with a tips card
  page.js                                 Announcement board (Acknowledged / Pending),
                                           inline "New" create modal for admins
  announcements/[id]/                     Announcement detail: consent checkbox + live
                                           selfie capture & acknowledge flow
  announcements/[id]/acknowledgements/     Admin-only: who acknowledged, with selfie + time
  components/
    AuthGuard.js              Redirects signed-out users to /signin
    AdminGuard.js             AuthGuard + redirects non-admins away from admin routes
    Header.js                 Sticky header, contextual back button, logout badge
    CreateAnnouncementModal.js  Admin-only announcement creation, opened from the board
    LiveSelfieCapture.js      getUserMedia camera capture (no file upload)
    ToasterProvider.js
```

## Notes

- **No file upload for selfies.** `LiveSelfieCapture.js` opens the device camera via
  `getUserMedia`, shows a live mirrored preview, and captures a frame to a `<canvas>` on tap — like
  a bank/government KYC flow. Users cannot submit a photo from their gallery.
- **Consent required.** The acknowledge page shows a checkbox ("I agree to share my live selfie
  with this organization…") that must be checked before the camera can start. The backend also
  independently rejects the request unless `consent=true` is sent.
- **No location is collected or stored.** Acknowledgement is selfie + explicit consent only.
- Admin/non-admin authorization is enforced server-side by the backend; the client-side `AdminGuard`
  is only there to avoid flashing admin UI at the wrong users.
- There's no standalone `/admin` list page — admins create announcements via a modal on the board
  itself and reach the acknowledgement log per-announcement from a small icon on each card.
