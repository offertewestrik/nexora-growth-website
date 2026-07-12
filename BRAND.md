# NEXT GROWTH V2 — Merkspecificatie "SYSTEM"

> Dit document is de wet. Iedere pagina volgt dit systeem exact.
> Meetlat: linear.app, vercel.com, resend.com, raycast.com. De site moet
> daarnaast kunnen liggen zonder af te vallen. V1 (serif/warm/kunstzinnig)
> is afgekeurd en volledig verwijderd — niets daarvan mag terugkomen.

## 1. Concept

Next Growth bouwt complete digitale bedrijfssystemen: software, websites,
marketing, AI — als één product-suite (NG/OS). De site oogt als de website
van een gefinancierd software-product: donker, technisch, precies.
Toon: kort, concreet, zelfverzekerd. Nederlands. Geen poëzie, geen
metaforen, geen aktes. Kop = uitkomst, subkop = hoe.

## 2. Kleur (tokens in assets/core.css — gebruik ALTIJD tokens)

| Token            | Waarde                      | Gebruik |
|------------------|-----------------------------|---------|
| `--bg`           | `#0A0A0B`                   | paginachtergrond |
| `--bg-raise`     | `#101013`                   | panelen, app-frames |
| `--bg-raise-2`   | `#16161A`                   | hover, tweede laag |
| `--line`         | `rgba(255,255,255,.08)`     | 1px borders, sectiescheiding |
| `--line-strong`  | `rgba(255,255,255,.14)`     | borders op hover/nadruk |
| `--text`         | `#F5F6F7`                   | koppen |
| `--text-2`       | `rgba(245,246,247,.68)`     | body |
| `--text-3`       | `rgba(245,246,247,.42)`     | meta, labels |
| `--accent`       | `#34D399`                   | emerald — links, CTA's, grafieken, focus |
| `--accent-strong`| `#10B981`                   | knop-achtergrond, actieve staat |
| `--accent-dim`   | `rgba(52,211,153,.14)`      | accent-vlakken, badge-bg |
| `--glow`         | `rgba(52,211,153,.35)`      | glows |
| `--warn`         | `#FBBF24`                   | status "wacht/opvolgen" |
| `--danger`       | `#F87171`                   | status "verlopen/fout" |

Eén accent (emerald), overal consequent. Nooit bruin/beige/olijf/serif.
Statuskleuren alleen in UI-mockups.

## 3. Typografie

Self-hosted via `assets/fonts.css` (staat klaar — NIET vervangen door
Google Fonts-links): Inter 400/500/600/700/800 + IBM Plex Mono 400/500.

- **Koppen**: Inter 700/800, letterspacing -0.02em à -0.035em.
  H1: `clamp(2.6rem, 6vw, 4.6rem)`, line-height 1.05. H2: `clamp(1.9rem,
  3.6vw, 2.9rem)`. Kort houden (max ~8 woorden).
- **Body**: Inter 400/500, 15–16px, `--text-2`, line-height 1.65,
  max-width ~36em.
- **Mono** (`.mono`): IBM Plex Mono, 11–12.5px, voor data, labels,
  timecodes, code. `font-variant-numeric: tabular-nums` op alle cijfers.
- `.eyebrow`: 12px, semibold, uppercase, letterspacing .08em, `--accent`.

## 4. Layout

- `.wrap`: max-width 1200px, gecentreerd, padding-inline clamp(1.25–2.5rem).
- Secties: `padding-block: clamp(4.5rem, 10vh, 7.5rem)`; gescheiden door
  `border-top: 1px solid var(--line)`.
- Gecentreerde hero's zijn prima. Feature-secties: UI-mockup en copy
  afgewisseld links/rechts (60/40).
- Radius: 10–14px op kaarten/app-frames, 8px op inputs, 999px op pills.
- Diepte via glow en lagen, niet via zware drop-shadows.

## 5. Kerncomponenten (in core.css — gebruik ze, herbouw ze niet)

- `.btn` (primary: emerald bg, donkere tekst, glow op hover) en
  `.btn--ghost` (border `--line-strong`, hover lift).
- `.pill` — badge-pill met dot (bv. "NG/OS 4.0 — nu live").
- `.kbd` — keyboard-chip (⌘K).
- `.card` — paneel: bg `--bg-raise`, 1px `--line`, radius 12px,
  top-highlight (inset 1px lichtlijn boven).
- `.g-border` — gradient-border wrapper voor belangrijke kaarten.
- `.glow-field` — radiale accent-glow achter hero's (position:absolute).
- `.kpi` — groot tabular cijfer + label. `[data-count]` telt op.
- `.logo-row` — grijze tekst-logo's van klanten.
- Sectiekop-patroon: `.eyebrow` + h2 + één regel `--text-2`.

## 6. NG/OS app-mockups (het hart — fotorealistisch niveau)

Alle productschermen worden in HTML/CSS gebouwd met de `.app-*` componenten
uit core.css. Kwaliteitsniveau = echt Linear/Stripe-dashboard-screenshot:

- `.app` — venster: bg `--bg-raise`, border `--line`, radius 12px,
  overflow hidden, optioneel `.app--tilt` (perspectief-tilt voor hero's).
- `.app-chrome` — vensterbalk: drie dots + titel + adres/route (mono).
- `.app-body` — grid: `.app-side` + rechts (`.app-top` + `.app-main`).
- `.app-side` — sidebar: logo-regel, `.side-item`s met 16px inline-SVG
  icoon (stroke currentColor), actieve staat (accent-dim bg + accent-tekst),
  sectielabels, onderin user-regel met `.avatar`.
- `.app-top` — topbar: zoekveld met ⌘K `.kbd`, rechts `.avatar-stack`.
- `.tbl` — datatabel: mono uppercase kopregel (`--text-3`), rijen met
  hairline, hover-state, cellen met `.badge`s en `.avatar`s.
- `.badge` — status: `--ok` (emerald) `--warn` (amber) `--muted` (grijs)
  `--danger` (rood). Teksten: Getekend, Verstuurd, Opvolgen, Concept,
  Ingepland, Betaald, Verlopen.
- `.chart` — SVG-area-chart met emerald gradient-fill (defs linearGradient
  van `--glow` naar transparant) + lijnstroke `--accent`; gridlijnen
  `--line`. `.bars` — mini-staafdiagram met `--v` hoogtes.
- `.avatar` — 24px cirkel met initialen op accent-dim; `.avatar-stack`.

Data is altijd geloofwaardig Nederlands: bedrijfsnamen (Van Dijk
Installaties, De Wit Bouwgroep, Peeters Techniek, Hofman & Zn, Vermeer
Interieurs), €-bedragen met punten (€ 84.200), datums, percentages.

Vaste productnamen: **Atlas** (CRM) · **Vector** (offertes) · **Pulse**
(dashboards) · **Flow** (automatiseringen) · **Sage** (AI-agents) ·
**Ledger** (facturatie) · **Portal** (klantportaal) · **Plan** (planning).

## 7. Motion (core.js staat klaar)

- `[data-reveal]` (+`--i` stagger): 300ms fade/translate(12px), ease-out.
- `[data-count]`: tellende cijfers (tabular).
- `.app--tilt`: staat scheef (perspective) en richt zich subtiel op bij
  scroll — verder GEEN parallax, GEEN cursor-aura, GEEN 1s+ fades.
- Hover: lift 2px, border → `--line-strong`, 150–250ms.
- `prefers-reduced-motion` volledig gerespecteerd; zonder JS is alles
  zichtbaar (reveals alleen verborgen onder `html.js`).

## 8. Navigatie & footer (verbatim overnemen op elke pagina)

Direct na `<body>`:

```html
<a class="skip" href="#main">Direct naar inhoud</a>
<header class="nav" id="nav">
  <div class="nav__in wrap">
    <a class="nav__logo" href="./index.html" aria-label="Next Growth — home">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect width="18" height="18" rx="4" fill="#10B981"/><path d="M5 13V5l8 8V5" stroke="#0A0A0B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Next Growth
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Hoofdmenu">
      <a href="./software.html">Software</a>
      <a href="./websites.html">Websites</a>
      <a href="./marketing.html">Marketing</a>
      <a href="./ai.html">AI</a>
      <a href="./crm.html">CRM</a>
      <a href="./cases.html">Cases</a>
    </nav>
    <div class="nav__cta">
      <a class="btn btn--ghost btn--sm" href="./contact.html">Contact</a>
      <a class="btn btn--sm nav__demo" href="./contact.html">Plan een demo</a>
    </div>
    <button class="nav__burger" id="navBurger" aria-expanded="false" aria-controls="navLinks" aria-label="Menu"><i></i><i></i></button>
  </div>
</header>
```

Zet `aria-current="page"` op de actieve link. Footer (voor `</body>`,
gevolgd door `<script src="./assets/core.js" defer></script>`):

```html
<footer class="foot">
  <div class="wrap foot__cta">
    <h2>Klaar om het systeem te zien?</h2>
    <p>Een demo van 30 minuten. Uw cijfers, onze software.</p>
    <div class="foot__actions">
      <a class="btn" href="./contact.html">Plan een demo</a>
      <a class="btn btn--ghost" href="./cases.html">Bekijk resultaten</a>
    </div>
  </div>
  <div class="wrap foot__grid">
    <div>
      <p class="foot__brand">Next Growth</p>
      <p class="mono foot__meta">Digitale bedrijfssystemen<br>hallo@nextgrowth.nl</p>
    </div>
    <nav aria-label="Product"><h3 class="mono">Product</h3>
      <a href="./software.html">Software</a><a href="./crm.html">CRM</a><a href="./ai.html">AI</a>
    </nav>
    <nav aria-label="Diensten"><h3 class="mono">Diensten</h3>
      <a href="./websites.html">Websites</a><a href="./marketing.html">Marketing</a>
    </nav>
    <nav aria-label="Bedrijf"><h3 class="mono">Bedrijf</h3>
      <a href="./cases.html">Cases</a><a href="./contact.html">Contact</a>
    </nav>
  </div>
  <div class="wrap foot__base mono">© MMXXVI Next Growth — Alle systemen operationeel <span class="dot dot--ok" aria-hidden="true"></span></div>
</footer>
```

Head-patroon (identiek aan index.html): favicon-datauri, dan
`<link rel="stylesheet" href="./assets/fonts.css">` en `core.css`, dan
eigen `<style>`. `<title>`: `Onderwerp — Next Growth`.

## 9. Pagina's (zelfde systeem, eigen hero + eigen product-UI)

1. **index** — pill "NG/OS 4.0" · H1 "Eén systeem voor je hele bedrijf." ·
   CTA's · groot Pulse-dashboard met tilt+glow · logo-rij · 3 afgewisselde
   feature-secties (Atlas, Flow, Sage met eigen UI) · metrics-band ·
   cases-teaser · footer-CTA.
2. **software** — de suite: 8 modules, elk met echt productscherm;
   integraties/stack-band; beveiliging & eigendom.
3. **websites** — browser-frame mockups, Core Web Vitals/Lighthouse-scores,
   performance-cijfers, proces in 4 stappen.
4. **marketing** — campagne-dashboard (ROAS-chart, attributietabel,
   funnel-cijfers), meetbaarheid, geen vage beloften.
5. **ai** — Sage: agent/chat-UI met stappenlog, use-cases, guardrails
   (menselijke goedkeuring, audit-log).
6. **crm** — Atlas diep: pipeline-kanban, klantkaart met tijdlijn,
   datatabel; migratie vanuit Excel.
7. **cases** — 3 klantcases met grote voor/na-cijfers, staafvergelijking,
   citaat; alles meetbaar.
8. **contact** — kort glaskaart-formulier (bedrijf, naam, e-mail, telefoon,
   bericht, radio-pills voor timing), antwoord binnen 1 werkdag.

## 10. Kwaliteitseisen

- 0 console-errors; 0px horizontale overflow 360–1600px.
- Werkt zonder JavaScript; semantiek: één h1, labels, focus-visible.
- Alleen transform/opacity animeren; 60fps.
- Alles self-hosted; geen externe requests behalve niets.
- Naast linear.app gelegd mag het niet afvallen.
