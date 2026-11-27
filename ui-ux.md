# UI / UX design

Design direction for the nuttyfelt public site (v1) and light notes for the phase 2 admin portal. This follows [core functions](core-functions.md), [architecture](architecture.md), and [tech stack](tech-stack.md). It is the brief for visual UI and interaction — not implementation yet.

Brand differentiator: a realistic needle-felted cat half-bust fixed on a hand-polished brass/gold **halo**, with an easel stand. The site should feel like a quiet craft gallery for that object, not a pet shop, memorial storefront, or generic commission form.

## Design principles

1. **Brand first** — On branded pages, `nuttyfelt` is a hero-level signal. No headline should overpower the name.
2. **One composition** — The first viewport reads as one scene, not a dashboard.
3. **Photography is the craft** — Finished-work photos are the visual anchor. Decorative gradients alone do not count.
4. **Mobile-first** — One clear column on small screens; widen carefully on desktop. Commission form must be comfortable on a phone.
5. **Bilingual parity** — Traditional Chinese (Hong Kong wording) is default; English is a full equivalent. Layout must absorb longer EN and denser ZH without breaking hierarchy.
6. **Facts over hype** — Price, sizes, lead time, and what is not offered stay plain and consistent (GEO-friendly).
7. **Privacy by design** — Living-status, WhatsApp, and private stories never appear on public surfaces or in UI chrome that could leak into sharing.
8. **Few jobs per section** — One purpose, one headline, usually one short supporting line.
9. **Cards sparingly** — Default: no cards. Cards only when they contain a real interaction (form steps, upload groups, admin controls).
10. **Motion with intent** — Presence and hierarchy, not decoration noise. Ship 2–3 deliberate motions on the public site.

## Visual direction: “Wool & brass”

Quiet, tactile, intimate. Soft wool fields meet a warm metal accent taken from the halo. Calm gallery light — not dark-mode drama, not purple gradients, not cream-and-terracotta editorial cliché, not newspaper broadsheet.

### Atmosphere

- Soft, slightly warm paper field with subtle fibre/noise texture (very low contrast), or a gentle vertical wash from soft wool-ivory into cool mist — never a flat single fill as the only idea.
- Full-bleed photography on Home and Works; the halo edge and wool texture should be readable in hero crops.
- Brass used as a thin accent (rules, focus rings, key CTA underline or fill), not large gold blocks.

### Color tokens

Aligned to the official logo (nut brown + gold circle + black banner). Prototype values sampled from `prototype/public/brand/nuttyfelt-logo.jpg`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper` | `#F5F0E6` | Page background (warm wool paper) |
| `--color-mist` | `#E8E0D2` | Soft bands, form section breaks |
| `--color-ink` | `#482818` | Primary text / logo brown |
| `--color-ink-muted` | `#6B5344` | Supporting copy |
| `--color-brass` | `#C8A048` | Logo gold — accent, key CTAs, focus |
| `--color-brass-deep` | `#A88430` | Hover / pressed gold |
| `--color-wool` | `#FAF7F1` | Raised surfaces (form panels) |
| `--color-line` | `#D9D0C2` | Hairlines, input borders |
| `--color-danger` | `#8B3A2F` | Errors only (restrained) |
| `--color-success` | `#3F5D4A` | Success states only |

**Brand mark:** use the transparent logo (`nuttyfelt-logo.png`) on the light paper header and Home hero. The export’s black field was for the logo file only — it is not a site chrome color. Do not replace the wordmark with a different type treatment in chrome.

Do **not** introduce purple, neon glow, or multi-layer drop shadows as brand language.

### Typography

Expressive, bilingual-capable. Avoid Inter, Roboto, Arial, and system UI stacks as the brand voice.

| Role | Latin | Chinese (zh-Hant) | Notes |
| --- | --- | --- | --- |
| Brand / display | **Fraunces** (soft optical size) | **Noto Serif HK** or Source Han Serif TC | Brand wordmark and page titles. Fraunces soft axis for warmth. |
| Body | **Source Serif 4** | **Noto Serif HK** (text size) | Long reading on Process / FAQ / About. |
| UI / form | **Figtree** | **Noto Sans TC** | Labels, buttons, inputs, nav. Clean without looking like a SaaS default. |

Type scale (mobile → desktop): brand 2.5–4rem; page title 1.75–2.5rem; section title 1.25–1.5rem; body 1–1.125rem; fine print 0.875rem. Line length ~40–65 characters for body; ZH can sit slightly denser.

### Spacing and layout

- Base unit 4px; common rhythm 8 / 16 / 24 / 40 / 64.
- Content measure ~36–40rem for text pages; Works and Home may go full bleed for imagery.
- Safe padding 20–24px mobile; 40–64px desktop gutters.
- Corner radius: 0 for gallery frames and hero; 4–8px only on inputs and buttons (no pill clusters).

### Imagery rules

- **Studio finished-work photos** on Home, Works, The halo — web-optimized, honest light, show the halo and stand when possible.
- **No inset hero cards** on landing: hero image is edge-to-edge (or full-bleed background plane), not a rounded floating thumbnail.
- **No overlays** on hero media: no floating badges, promo stickers, or info chips on the photo.
- Client reference uploads never appear on marketing pages.
- Alt text bilingual-capable; describe the piece and presentation, not private client stories.

### Iconography and chrome

- Minimal icons. Prefer text. If needed: simple line icons for upload, language, external social.
- Language switch: clear `中文` / `EN` control in the header on every page — not buried.
- Social: Instagram and Threads as text or quiet marks in footer; site complements them, does not embed noisy feeds in the first viewport.

## Information architecture

### Primary nav (public)

Order (ZH labels as source; EN in parallel):

| zh-Hant | EN | Path idea |
| --- | --- | --- |
| 主頁 | Home | `/` · `/en` |
| 作品 | Works | `/works` · `/en/works` |
| 光環 | The halo | `/halo` · `/en/halo` |
| 落單需知 | Process | `/process` · `/en/process` |
| 關於 | About | `/about` · `/en/about` |
| 常見問題 | FAQ | `/faq` · `/en/faq` |
| 訂製 | Commission | `/commission` · `/en/commission` |

- **訂製 / Commission** is the primary CTA in header (brass-accent button or strong text link).
- Mobile: compact header + full-screen or sheet menu; CTA remains visible.
- Admin portal is **not** in public nav (phase 2).

### Footer

Brand name, short factual line (Hong Kong · handmade custom cat portraits), nav repeat, language switch, Instagram / Threads, link to Process terms, privacy note when available. No living-status, no client contact fields.

## Page compositions

### Home

**Job:** Introduce nuttyfelt and the halo presentation; path to Works or Commission.

**First viewport (hero budget — only these):**

1. Brand: `nuttyfelt` (hero-level)
2. One headline (subordinate to brand)
3. One short supporting sentence
4. One CTA group: primary **開始訂製 / Start a commission**, secondary **瀏覽作品 / View works**
5. One dominant full-bleed finished-work photograph (halo visible)

Do **not** put in the first viewport: price stats, schedule, address, “this week”, FAQ chips, or multi-card grids.

**Below the fold (one job each):**

1. **The halo** — short explanation + link to The halo page; optional second photo showing stand / wax context without card clutter.
2. **Selected works** — 2–3 featured pieces as a calm horizontal or stacked photo sequence (titles only); link to Works. Phase 2: artist chooses featured set.
3. **How it works** — three plain beats (photos → deposit → handmade portrait), link to Process. No icon row of six.
4. **Capacity line** — one factual sentence (~1 commission / month; ~3–4 weeks) + Commission CTA.

**Motion (Home):**

1. Soft fade/rise of brand + copy after photo paints in.
2. Slow, subtle ken-burns or parallax on hero photo (very restrained; respect `prefers-reduced-motion`).
3. Featured works: gentle stagger fade on scroll.

### Works

**Job:** Showcase finished portraits so visitors understand the style.

- Title + one short line.
- Gallery of finished pieces (e.g. Chestnut / 栗子, Yat Yat / 壹壹). Large photos first; name and short bilingual context under or beside — not card chrome.
- State clearly these are handmade custom portraits, not off-the-shelf stock.
- Phase 2: artist adds / reorders / hides entries and photos.

### The halo

**Job:** Explain the signature presentation.

- Lead with a full-bleed or near full-bleed photo of the halo piece.
- Copy: realistic half-bust on hand-polished brass/gold halo, easel stand (not a picture frame), protective wax included.
- Sizes: short-hair 13 cm, long-hair 15 cm — as facts, not a product grid of fake SKUs.
- CTA to Commission.

### Process (落單需知)

**Job:** Accurate commission rules before the form.

Sections in reading order (one job each):

1. What’s included and price (incl. early-bird only if confirmed still open)
2. Capacity and timing
3. Making, review, revisions (what counts as minor)
4. Cancellation
5. Payment and handover
6. Sharing and publicity consent
7. CTA: go to Commission form

Use clear headings and short paragraphs; optional simple table for price / sizes. Match [core functions](core-functions.md). FAQ can repeat short answers; Process is the canonical long form.

### About

**Job:** Studio, Hong Kong base, origin of the work — no private client details.

One calm photo + short narrative. Link to Works / Commission.

### FAQ

**Job:** Short factual answers for people and GEO.

Accordion or stacked Q&A (not a card maze). Topics: price, sizes, lead time, what is not offered, delivery, revisions, photo requirements. Align copy with Process. Provide FAQPage JSON-LD.

### Commission (form)

**Job:** Mobile-first intake without Google sign-in; upload originals; capture consents.

**Overall UX:**

- Single continuous flow on one page (sections), not a multi-wizard that loses context — unless usability testing shows a short 3-step stepper helps (Contact → Cat & photos → Consents). Prefer sections with a sticky “Submit” on mobile if long.
- Progress indication if stepped; otherwise clear section headings.
- Validate inline; block submit until required fields and uploads meet rules.
- Success: calm confirmation screen + “check your email”; no private status echoed back.

**Section order:**

1. Intro — link to Process; note ~1/month and reply within ~3 days
2. Contact — email, 稱呼, Instagram, WhatsApp (`/` ok overseas), location
3. Cat — name, coat length (13 / 15 cm), features to preserve; optional sex/breed, hoped date, stories, how-found
4. Photos — two upload groups (up to 10 each, 100 MB/file); guidance for angles and natural light; encourage 8–10 clear photos over max size
5. Private status — optional “貓貓現在…” with explicit copy that this is never published
6. Consents — terms (落單需知), handmade-likeness acknowledgement, publicity (tag / do not tag)
7. Submit

**Upload UX:**

- Direct-to-storage; show per-file progress, size, and errors.
- Accept images only; reject clearly if type/size fails.
- Allow remove/replace before submit.
- On verification failure after submit attempt: keep answers, ask to retry missing files.

**Trust and privacy copy near the form:** photos stay private for studio use; living-status never published; payment happens later off-site after confirmation.

## Language UX

- Default locale `zh-Hant` at `/`; English at `/en…`.
- Switching language keeps the equivalent page.
- Form: submit in the UI language; store which language was used.
- Dates and sizes: use formats familiar to HK readers in ZH; clear EN equivalents.
- Do not mix languages inside a single sentence except brand `nuttyfelt`.

## Motion summary (public v1)

| Where | Motion | Purpose |
| --- | --- | --- |
| Home hero | Photo settle + copy fade/rise | Presence |
| Home featured works | Stagger fade on scroll | Hierarchy |
| Global | Brass CTA hover / focus transition | Affordances |
| Form | Upload progress; gentle success transition | Feedback |

Honor `prefers-reduced-motion`: replace with simple opacity fades or none.

## Empty, error, and edge states

- Works with no entries yet: short line + CTA to Commission / Instagram — no fake placeholders pretending to be real cats.
- Form network / upload failure: actionable retry; do not claim “received” unless stored.
- Email failure after store: user still sees success if request is saved; studio must get a visible failure path (per architecture) — not a client-facing dump of errors.
- Rate limit: calm “please try again later.”

## Accessibility

- Contrast: ink on paper and brass buttons with sufficient contrast (verify brass CTA text color — use `--color-wool` or white on `--color-brass-deep` if needed).
- Focus visible on all controls (brass ring).
- Form labels always visible (not placeholder-only).
- Language switch and nav operable by keyboard.
- Images have meaningful alt; decorative texture may be empty alt.

## Phase 2 admin portal (UX sketch only)

Not designed in visual detail for v1 launch. When built:

- Private URL, no public nav link; simple auth gate.
- **Commissions:** table/list + detail view; status control; photo gallery with signed access; notes fields. Dense and functional — clarity over gallery branding.
- **Works / Home content:** edit finished-work entries, upload studio images, reorder, toggle visibility, pick Home featured slots.
- Keep “Wool & brass” tokens for cohesion, but prioritize operable forms and status over marketing layout.
- Never offer a control that publishes living-status or WhatsApp to the public site.

## Open design decisions

Confirm with the studio before locking UI copy and comps:

1. Real hero and Works photography set (who supplies; which pieces are public).
2. Exact brand wordmark treatment (lettercase: `nuttyfelt` vs Nuttyfelt; any mark besides type).
3. Whether early-bird appears on Process / Home / FAQ.
4. Commission form: single long page vs 3 sections/steps.
5. Tone of ZH copy (written Hong Kong Chinese register) — who reviews.
6. Privacy policy page: include in v1 nav/footer or not.

## Deliverables checklist (this design phase)

- [x] Direction, tokens, type, IA (this document)
- [x] Coded HTML/Tailwind prototype in [`prototype/`](prototype/) (Home, Commission, and the other public pages)
- [ ] Replace photography placeholders with studio finished-work photos
- [ ] Refine bilingual copy with studio review
- [ ] Handoff to implementation (Next.js + Tailwind tokens from this doc)

## Prototype

```bash
cd prototype && npm install && npm run dev
```

Default locale is zh-Hant; use the header control for English. Commission uploads are simulated only.
