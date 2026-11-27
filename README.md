# nuttyfelt-web

Public site and commission intake for nuttyfelt (Hong Kong handmade needle-felted cat portraits).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS (Wool & gold tokens; no UI kit)
- next-intl — default `zh-Hant` at `/`, English at `/en`
- Planned: Neon Postgres, Cloudflare R2, Resend, Umami, Sentry

Product docs: `core-functions.md`, `architecture.md`, `tech-stack.md`, `ui-ux.md`.  
Static HTML prototype (reference): `prototype/`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Env

Copy `.env.example` when wiring email, storage, and analytics.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
