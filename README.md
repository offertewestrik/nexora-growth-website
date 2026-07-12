# Next Growth — V2 "SYSTEM"

Donker, technisch, precies. Meetlat: linear.app, vercel.com, resend.com,
raycast.com. Eén accentkleur (emerald), Inter + IBM Plex Mono, en de eigen
NG/OS-productsuite (Atlas, Vector, Pulse, Flow, Sage, Ledger, Portal, Plan)
volledig als fotorealistische app-mockups in HTML/CSS — geen screenshots,
geen templates, geen build-stap.

## Structuur

| Pagina | Inhoud |
|---|---|
| `index.html` | Product-hero met Pulse-dashboard (tilt+glow), features, metrics, cases |
| `software.html` | De suite: 8 modules met productschermen, werkwijze, eigendom |
| `websites.html` | Websites als onderdeel van het systeem, Core Web Vitals |
| `marketing.html` | Campagne-dashboard, attributie, elke euro herleidbaar |
| `ai.html` | Sage: agent-werkscherm, guardrails, uitlegbaarheid |
| `crm.html` | Atlas: pipeline-kanban, klantkaart, weg uit Excel |
| `cases.html` | Drie cases met gemeten voor/na-cijfers |
| `contact.html` | Demo-formulier in glaskaart |

- `BRAND.md` — de merkspecificatie (tokens, componenten, regels).
- `assets/core.css` — designsysteem + NG/OS app-componenten.
- `assets/core.js` — reveals, tellers, hero-tilt, nav (snappy, 60fps).
- `assets/fonts.css` + `assets/fonts/` — self-hosted Inter & IBM Plex Mono.

## Lokaal bekijken

```bash
cd next-growth
python3 -m http.server 8080
# open http://localhost:8080
```

0 console-errors, 0px horizontale overflow (360–1600px), werkt zonder
JavaScript, `prefers-reduced-motion` gerespecteerd.
