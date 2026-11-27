# nuttyfelt-web

Public site and commission intake for nuttyfelt (Hong Kong handmade needle-felted cat portraits).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS (Wool & gold tokens; no UI kit)
- next-intl — default `zh-Hant` at `/`, English at `/en`
- Neon Postgres + Drizzle, Cloudflare R2, Resend (Umami + Sentry later)

Product docs: `core-functions.md`, `architecture.md`, `tech-stack.md`, `ui-ux.md`.  
Static HTML prototype (reference): `prototype/`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Env

Copy `.env.example` to `.env.local` and fill Neon / R2 / Resend values. Never commit `.env.local`.

## Database (Drizzle + Neon)

```bash
npm run db:generate   # after schema changes
npm run db:migrate    # apply SQL in drizzle/ to Neon
npm run db:studio     # optional browser UI
```

Tables: `commission_requests`, `commission_files`.

## R2 uploads

`POST /api/commission/upload-url` returns a short-lived PUT URL for one image.

Browser uploads need bucket CORS. Object Read & Write tokens cannot set CORS via API, so configure it in the Cloudflare dashboard:

1. R2 → your bucket → **Settings** → **CORS policy**
2. Use the JSON in `scripts/r2-cors.json` (localhost:3001 for now)
3. Add the production origin before launch

Optional (needs an Admin R2 token): `npm run r2:cors`

## Commission submit

`POST /api/commission` verifies uploaded R2 objects, inserts `commission_requests` + `commission_files`, then emails:

- Studio (`NOTIFY_EMAIL`) — answers + 7-day signed photo links
- Client — confirmation (no private living-status)

Requires `RESEND_API_KEY`, `NOTIFY_EMAIL`, and `EMAIL_FROM`. Until `nuttyfelt.com` is verified in Resend, set `EMAIL_FROM=onboarding@resend.dev`. That test sender can only deliver to your Resend account email (`NOTIFY_EMAIL`); client confirmations to other addresses are redirected there with a test-mode note. Restart `next dev` after changing `.env.local`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js (port 3001) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright commission form submit tests (builds + `next start` if needed) |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run r2:cors` | Apply R2 CORS for local uploads |
