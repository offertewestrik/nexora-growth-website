# Nexora Growth

Premium, multilingual marketing & sales growth website for ambitious businesses.
Standalone single-page app — independent from any CRM, configurator or other site.

- **Stack:** Vite 6 · React 19 · TypeScript · Tailwind CSS v4 · `motion` (Framer Motion)
- **Languages:** Dutch (nl), English (en), Arabic (ar — full right-to-left)
- **Design:** glassmorphism, animated gradients, scroll reveals, mouse-follow glow,
  animated counters, parallax, accordion FAQ, glass contact form.

## Development

```bash
npm install      # install dependencies
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build to /dist
npm run preview  # preview the production build
npm run lint     # type-check with tsc
```

## Languages

The active language auto-detects from the browser on first visit (falls back to
English) and can be switched via the **NL · EN · العربية** buttons in the header.
The choice is remembered in `localStorage`. Arabic renders right-to-left with the
Cairo webfont.

## Deployment

This is a fully static site after `npm run build` — the output in `/dist` can be
hosted on any static host (Firebase Hosting, Netlify, Vercel, Cloudflare Pages,
GitHub Pages, etc.). The contact form currently shows a success state on submit
and is not yet wired to a backend.

## Editing content

All copy lives in the `CONTENT` object near the top of `src/App.tsx`, grouped per
language (`nl` / `en` / `ar`). Brand name and colours are the `BRAND` and
`PALETTE` constants just above it.
