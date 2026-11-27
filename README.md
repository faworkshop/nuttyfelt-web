# nuttyfelt-web

Public site and commission intake for nuttyfelt (Hong Kong handmade needle-felted cat portraits).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS (Wool & gold tokens; no UI kit)
- next-intl — default `zh-Hant` at `/`, English at `/en`
- Hosting: **Railway** (see `railway.toml`)
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

### Pending upload cleanup (B9)

On submit, files are copied from `commissions/pending/…` to `commissions/{requestId}/…` and the pending objects are deleted.

Abandoned pending uploads (never submitted) should expire after ~48 hours:

1. R2 → bucket → **Settings** → **Object lifecycle rules**
2. Use `scripts/r2-lifecycle.json` (expire `commissions/pending/` after 2 days)
3. Or run periodically: `npm run r2:cleanup-pending` (add `-- --dry-run` first)

## Commission submit

`POST /api/commission` verifies uploaded R2 objects, promotes them out of `pending/`, inserts `commission_requests` + `commission_files`, then emails:

- Studio (`NOTIFY_EMAIL`) — answers + 7-day signed photo links
- Client — confirmation with short `NF-` reference (no private living-status)

Requires `RESEND_API_KEY`, `NOTIFY_EMAIL`, and `EMAIL_FROM`. After the domain shows **Verified** in Resend, set `EMAIL_FROM=hello@nuttyfelt.com`. Until then use `onboarding@resend.dev` (test sender only reaches your Resend account email; other client addresses are redirected there). Restart `next dev` after changing `.env.local`.

## GEO / SEO

- Per-page `generateMetadata` with canonical + `hreflang` (`zh-Hant` / `en` / `x-default`)
- JSON-LD: Organization, Service/Offer, FAQPage, BreadcrumbList
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`
- Set `NEXT_PUBLIC_SITE_URL` to the public origin (Railway URL or custom domain)

## Deploy (Railway)

```bash
railway up -y
```

Set these variables on the Railway service (same names as `.env.example`):

`DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`

After the first public URL exists, add that origin to R2 CORS (`scripts/r2-cors.json`).

## CI / CD

GitHub Actions:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | PR + push to `main` / `develop` | `lint` → `typecheck` → `build` → Playwright e2e |
| `.github/workflows/deploy.yml` | Push to `develop` (or manual) | `railway up` to production |

### One-time GitHub secrets

Create a Railway account token, then add repository secrets:

| Secret | Value |
| --- | --- |
| `RAILWAY_TOKEN` | Railway account token ([tokens](https://railway.com/account/tokens)) |
| `RAILWAY_PROJECT_ID` | `02a656e4-4286-4a4d-8016-6e477f6f2e2b` |
| `RAILWAY_SERVICE_ID` | `4708331d-3658-40fa-9e82-8536c7c51672` |
| `RAILWAY_ENVIRONMENT_ID` | `c2b6630e-bba3-4e66-8f41-cf346d24a548` |

Optional: create a GitHub Environment named `production` (used by the deploy workflow) and restrict who can approve deploys.

### Flow

1. Open a PR → CI must pass (lint, types, build, e2e).
2. Merge to `develop` → CI runs again, then Deploy ships to Railway.
3. Manual redeploy: Actions → **Deploy** → **Run workflow**.

Local parity:

```bash
npm run lint && npm run typecheck && npm run build && npm run test:e2e
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js (port 3001) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run test:e2e` | Playwright commission form submit tests (builds + `next start` if needed) |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run r2:cors` | Apply R2 CORS for local uploads |
| `npm run r2:cleanup-pending` | Delete abandoned pending uploads older than 48h |
