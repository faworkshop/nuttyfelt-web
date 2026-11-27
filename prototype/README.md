# nuttyfelt UI prototype

Static HTML + Tailwind CSS (Vite) prototype for the public site. Default language is Traditional Chinese (Hong Kong); toggle to English in the header.

## Run

```bash
cd prototype
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — brand-first full-bleed hero |
| `works.html` | Works gallery shell |
| `halo.html` | The halo |
| `process.html` | 落單需知 / Process |
| `about.html` | About |
| `faq.html` | FAQ |
| `commission.html` | Commission form (upload simulated) |

## Design tokens

Locked to logo-aligned **Wool & gold**: ink `#482818`, gold `#C8A048`, light paper header, transparent logo at `public/brand/nuttyfelt-logo.png`. Full direction in [`../ui-ux.md`](../ui-ux.md).

## Screenshots

```bash
npm run screenshots
```

Output lands in `screenshots/wool-brass/` (home mobile/desktop, commission mobile, works desktop).

Photography is placeholder CSS (halo ring + wool mass) until studio finished-work photos are supplied.
