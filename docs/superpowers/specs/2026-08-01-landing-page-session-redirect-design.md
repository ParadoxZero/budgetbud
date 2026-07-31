# Landing page session redirect

## Problem

`ui/home.tsx` renders the marketing landing page bundled into `index.html`.
The backend's `RedirectToLoginMiddleware` already redirects authenticated
users away from `/` and `/index.html` to `/app.html` server-side. This
doesn't cover cases where the static page is shown without a fresh request
hitting that middleware (browser back/forward cache, a cached PWA shell).
This spec adds a client-side backup check.

## Design

**Session check** — add `IsAuthenticated(): Promise<boolean>` to
`ui/services/ping_service.ts`. It calls `GET /api/ping/user` (existing
endpoint: 200 + `user_id` when authenticated, 401 otherwise) and resolves
`true`/`false`. Fetch/network errors resolve to `false` — failure defaults
to showing the landing page, not to blocking on a spinner forever.

**`home.tsx`** — the `App` component gets a `checkingSession` boolean state,
initialized `true`. A `useEffect` on mount calls `IsAuthenticated()`:
- `true` → `window.location.href = "/app.html"` (same redirect pattern used
  in `network_service.ts` and `header.tsx`).
- `false` → `setCheckingSession(false)`.

While `checkingSession` is `true`, render a centered antd `Spin` in place of
the `Layout`. Once resolved `false`, render the existing landing page
unchanged.

No backend or `App.tsx` changes.

## Out of scope

- No changes to `RedirectToLoginMiddleware` or any API endpoint.
- No loading state changes to `App.tsx` (the authenticated app shell).
