# Tech stack

Recommended starting stack for nuttyfelt-web. The aim is one small application a single studio can run, with excellent crawlable pages and a safe path for large photo uploads. Alternatives are listed where a later choice would still be reasonable.

## Recommendation

| Layer | Choice | Why |
| --- | --- | --- |
| Application | Next.js (App Router) and TypeScript | One repo can serve pre-rendered marketing pages, the form API, and a later admin area. Strong metadata, i18n, and structured-data support. |
| UI styling | Tailwind CSS (when UI is implemented) | Fast to build a mobile-first, one-column layout. Not needed for this documentation pass. |
| Internationalization | next-intl | First-class App Router support. Default locale `zh-Hant` (Hong Kong wording in copy), English at `/en`. |
| Hosting | Vercel | Natural host for Next.js previews and production. Marketing pages can be statically generated. |
| Database | PostgreSQL on Neon | Ordinary relational data, a generous free tier, and a good fit for low volume. |
| Data access | Drizzle ORM | Lightweight, typed SQL that stays close to the database. Prisma is a fine alternative. |
| File storage | Cloudflare R2 | S3-compatible, no egress fees, and suitable for private originals up to 100 MB each. |
| Uploads | Direct browser uploads with short-lived signed URLs | Avoids serverless/request body size limits on the app host (those limits are far below 100 MB). |
| Email | Resend | Simple transactional email for the artist notification and client confirmation. |
| Structured data | JSON-LD in page metadata | `Organization`, service/offer, `FAQPage`, breadcrumbs, plus `hreflang`, sitemap, and `llms.txt`. |
| Payments | None in v1 | Deposit and balance stay on FPS, PayMe, and PayPal after confirmation, as they do today. |

This is a hypothesis for review, not a locked decision. If the team already prefers Cloudflare for the whole stack, or already uses Supabase, those alternatives below are still compatible with the [architecture](architecture.md).

## Why Next.js rather than a purely static site

A form that accepts many large images, stores a request, and sends email needs a backend. Putting that backend in the same Next.js app avoids a second service for v1.

**Astro** is a strong alternative if the priority is the thinnest possible marketing site. It is excellent for GEO and default-zero JavaScript, but the form, email, and later admin would likely mean a second runtime (or a more custom server setup). For one small team, one Next.js app is simpler.

**A static host plus a third-party form (Google Forms, Formspree, Tally)** does not meet the brief. The current Google Form requires a Google sign-in, and typical form SaaS tools are a poor fit for 10–20 original files at up to 100 MB each.

**WordPress or a general CMS** would slow down bilingual, factual, design-led pages and still need a custom upload path. It is not recommended here.

**SvelteKit or Remix** could also host this architecture. They are not recommended only because the ecosystem around Next.js (i18n, hosting, examples for signed uploads) is broader for this kind of site.

## Hosting and the upload constraint

Vercel (and most serverless hosts) cannot reliably receive 100 MB files through a server action or API route. That is why the browser must upload directly to R2 (or S3). The Next.js route only mints a short-lived credential and, after submit, records the object keys.

If hosting moves to Cloudflare Workers / Pages, the same pattern still applies: direct uploads to R2, with the Worker issuing credentials. That is a reasonable alternative if the studio wants one vendor for host and storage.

## Storage details

- Private bucket, no public listing.
- Object keys should not be guessable (include a request id and a random component).
- Separate buckets or prefixes for production and staging.
- Lifecycle rules to delete abandoned uploads after a short period (for example 24–48 hours if they were never attached to a completed request).
- Keep originals. If previews are generated later for admin, store them as additional objects.

**Amazon S3** is the obvious alternative to R2 and is equally capable. R2 is preferred for a small studio because egress is free when the artist downloads large originals.

**Cloudflare Images or a public image CDN** is not a good primary store here: the artist needs unfiltered originals, and the files are private client data.

## Database and email

Neon Postgres can scale to zero between the rare requests and still be available when a form is submitted. **Supabase** is a good alternative if the team wants a dashboard, auth for later admin, and Postgres in one product. Even then, use R2 (or S3) for the large originals rather than Supabase Storage as the only plan, and confirm size limits before choosing otherwise.

Resend is the default email choice because it is simple and works well from a Next.js route. **Postmark** or **Amazon SES** are alternatives. The studio’s destination inbox is an open decision (whichever address nuttyfelt already uses for clients).

## Auth

- **v1 public site:** no user accounts.
- **Phase 2 admin portal:** add authentication then, not now. The portal manages commission details and status, plus the Works showcase and Home page content. Reasonable later options include Auth.js, Clerk, or Supabase Auth, with the artist as the only user (or a very small set). This remains an open decision.

## Payments

Leave payment off the website in v1. FPS and PayMe are typically confirmed by the artist, and overseas PayPal already works as a manual step. A later PayPal integration could be added if the studio wants invoices recorded automatically; it is not required to launch.

## Frontend and content

- React via Next.js, with most marketing routes statically generated.
- Copy in message files or MDX so Chinese and English can be reviewed together.
- Default locale at `/` (zh-Hant), English at `/en`.
- `next/image` for *studio* photographs on Works and Home. Do not run 100 MB *client* originals through the image optimizer.
- A small amount of client JavaScript on the commission form for validation and direct uploads; the rest of the site should stay mostly static.

## GEO tooling

- Next.js Metadata API for titles, descriptions, canonical URLs, and Open Graph.
- JSON-LD components on the relevant pages.
- `sitemap.ts` and `robots.txt`.
- `hreflang` for `zh-Hant` and `en` on every public page.
- A static `/llms.txt` that summarizes the studio, offering, prices, lead time, and policies in plain text, with links to the canonical pages.

No extra “GEO platform” is required.

## Analytics and errors (optional)

If analytics are added, use a privacy-friendly, cookie-light tool such as [Plausible](https://plausible.io) or [Umami](https://umami.is), and exclude form field values. **Sentry** (or similar) can watch for form and upload failures in production. Both are optional for v1 and should be decided before launch, not assumed.

## What we are not choosing now

- A visual component library or design tokens — that belongs to the UI/UX step.
- A full CMS for every page. v1 copy can live in the repo. Phase 2 adds artist-managed content only for the Works showcase and Home page components, not a general page builder.
- Mobile native apps.
- A separate microservices platform.

## Open decisions

These do not block agreeing the overall stack, but should be settled before or during implementation:

1. Production domain and DNS.
2. Studio notification email address, and the from-address / domain used to send mail.
3. Whether early-bird pricing (first 3 clients at HK$4,250) is still offered when the site launches.
4. Vercel + R2 as the default, versus hosting the app on Cloudflare as well.
5. Neon versus Supabase for Postgres (and later admin auth).
6. Whether v1 should include a minimal password-protected request list, or stay email-only until phase 2.
7. Analytics and error monitoring, if any.

## Suggested implementation order (after UI/UX is agreed)

See [ui-ux.md](ui-ux.md) for visual direction, tokens, and page compositions.

1. App skeleton: Next.js, TypeScript, next-intl, static pages with bilingual copy and JSON-LD.
2. Direct-upload form, Postgres request records, and transactional email.
3. Privacy review: no public leakage of private fields; signed, expiring photo links.
4. Phase 2 admin portal for commissions plus Works / Home content management.
