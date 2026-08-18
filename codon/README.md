# CODON — Biotech Animated Landing Page

A premium, animation-driven landing page for **CODON**, a fictional computational
biology platform that turns raw sequencing reads into validated genetic designs.
Built for the Round 1 Creative Frontend Developer take-home assignment.

**Live site:** _add your deployed URL here after publishing (see Deployment below)_
**Repo:** _add your GitHub repo URL here_

---

## 1. What's in the box

```
codon/
├── index.html          # all markup, one page, semantic sections
├── css/
│   └── style.css        # design tokens + every component + responsive rules
├── js/
│   └── main.js           # animations & interactions, no build step required
├── assets/
│   └── favicon.svg
└── README.md
```

No build tooling, no `node_modules`, no bundler. It's a static site — open it,
or drop the folder on any static host, and it works.

## 2. Running it locally

You can just double-click `index.html`, but a few browsers restrict
`fetch`/canvas features on the `file://` protocol, so a tiny local server is
more reliable:

```bash
# from inside the codon/ folder
python3 -m http.server 8000
# then open http://localhost:8000
```

or, with Node installed:

```bash
npx serve .
```

## 3. Deployment

The site is three static files plus assets, so any static host works:

**Netlify / Vercel (recommended, ~1 minute):**
1. Push this folder to a new GitHub repository.
2. On Netlify or Vercel, "Import Project" → pick the repo → framework preset
   "Other/Static" → build command: *none* → publish directory: `/`.
3. Deploy. You'll get a live URL immediately.

**GitHub Pages:**
1. Push this folder to a GitHub repository.
2. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## 4. Design approach

**The subject drove the concept.** The brief asked for a biotech landing page,
not a generic SaaS template with a DNA graphic bolted on, so I built the
company itself: CODON, a platform for computational biologists. Everything
else — palette, structure, copy, the signature interaction — follows from
what that company actually does: reads genetic sequences, three bases (one
**codon**) at a time, and translates them into meaning.

**Signature element — the reading frame.** A codon is the literal unit the
company is named after, so I made it the page's structural spine instead of
decoration. Every section is labelled with a real DNA codon and the amino
acid it encodes, using the actual genetic code table:

| Section | Codon | Amino acid |
|---|---|---|
| Hero | `ATG` | Met — **start codon** |
| Platform / About | `CAT` | His |
| Research | `GCA` | Ala |
| Capabilities | `TGG` | Trp |
| Impact | `AAG` | Lys |
| Final CTA | `TAA` | **stop codon** |

The page literally reads as one open reading frame from start to stop. A
fixed "reading-frame rail" on the right edge of the viewport (desktop only)
acts as both a wayfinding nav and a live progress indicator — it highlights
the current codon as you scroll, echoing a genome-browser's location track.
The hero visual takes the idea further: an animated four-colour sequencing
trace (the four channels a real Sanger chromatogram uses) scrolls past a
highlighted reading-frame window that steps forward and appends translated
amino acids to a live readout beneath it.

**Colour.** A cool, clinical paper background (`#F6F7F3`) instead of a warm
cream, so the page reads more like an instrument panel than a coffee-table
book. A cobalt accent (`#2447E8`) stands in for a fluorescence/protein-stain
blue and carries every interactive and data element. A warm red
(`#E24B3E`) is reserved *only* for stop-codon moments — the live-read
indicator dot and the final CTA section — mirroring how stop codons are
conventionally flagged in genetics diagrams. It never appears anywhere else,
so it keeps its meaning.

**Type.** Instrument Serif (display, used with restraint — headlines and
big numbers) paired with IBM Plex Sans (body/UI) and IBM Plex Mono (codon
labels, stats, anything that reads as data). The mono face is doing real
work, not decoration: it's the only typeface used for anything that is
literally sequence-like — codon tags, capability codes, stat figures.

**Layout.** The final CTA and footer invert to a dark "night mode" close —
the sequence has hit its stop codon, so the lights go down. Everything
before it stays on the light paper background.

## 5. Animation approach

**Progressive enhancement, not a hard dependency.** Every animation has a
working baseline in plain CSS/JS; GSAP, ScrollTrigger and Lenis (loaded from
CDN) are layered on top for extra polish but the page is fully functional,
readable and animated without them (open DevTools → block the three CDN
requests → reload, and the site still reveals content on scroll, still
counts up its stats, still highlights the reading rail).

- **Scroll reveals** — every content block carries `data-reveal` (or
  `data-reveal-line` for the hero headline). On load, `main.js` groups these
  by section and assigns a staggered delay in DOM order. If GSAP +
  ScrollTrigger are available, each element gets a `fromTo` tween triggered
  at 88% viewport height. If not, an `IntersectionObserver` toggles a
  `.is-visible` class and CSS transitions do the rest — same visual result,
  zero dependency.
- **Reading-frame rail** — an `IntersectionObserver` per section (with a
  ±45% root margin) tracks which section is centred in the viewport and
  updates the active rail marker and `aria-current`.
- **Hero chromatogram** — a `<canvas>` loop draws four layered noise curves
  (one per base channel) and a stepping reading-frame rectangle. It pauses
  automatically when the hero scrolls out of view or the tab is hidden
  (`visibilitychange` + `IntersectionObserver`), so it never burns CPU
  off-screen.
- **Impact counters & chart** — numbers count up with an eased
  `requestAnimationFrame` loop when scrolled into view; the year-over-year
  bar chart grows in with a staggered `scaleY` transition.
- **Micro-interactions** — magnetic buttons (`data-magnetic`) nudge toward
  the cursor using `gsap.quickTo` when available, or a lightweight CSS
  transform fallback; research cards (`data-tilt`) get a restrained 3D tilt
  on mouse-move.
- **Smooth scroll** — Lenis, synced to GSAP's ticker when both are present.
  Native `scroll-behavior: smooth` (already set in CSS) covers anchor jumps
  if Lenis doesn't load.

**Reduced motion is a first-class state, not an afterthought.** A single
`prefers-reduced-motion: reduce` media query disables all CSS
transitions/animations globally, and `main.js` checks the same media query
at boot: reveals render fully visible immediately, the chromatogram draws
one static frame instead of looping, counters render their final value
immediately, and magnetic/tilt hover effects are skipped entirely.

## 6. Accessibility & performance notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), a skip
  link, and visible `:focus-visible` states throughout.
- The hero canvas is decorative; it's marked appropriately and paired with a
  visually-hidden text description of what it represents, so the actual
  message of the hero doesn't depend on it rendering or animating.
- Mobile nav toggle uses `aria-expanded`/`aria-controls`; Escape closes it.
- No layout-shifting web fonts beyond the initial swap (`font-display:
  swap`); no render-blocking scripts beyond three small CDN libraries, all
  loaded at the end of `<body>`.
- The canvas animation and scroll listeners are gated behind
  `IntersectionObserver`/`visibilitychange` so nothing animates off-screen
  or in a background tab.

## 7. Libraries used (all via CDN, all optional/progressive)

- [GSAP](https://gsap.com/) + ScrollTrigger — scroll-triggered reveals, parallax
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- [Google Fonts](https://fonts.google.com/) — Instrument Serif, IBM Plex Sans, IBM Plex Mono

No frameworks, no build step, no analytics, no tracking.
