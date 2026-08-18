# CODON — Programmable RNA Therapeutics

A premium, animation-driven landing page for **CODON**, a concept synthetic-biology
company built for the Round 1 Creative Frontend Developer take-home assignment
("Task 01 — Biotech Animated Landing Page").

Live at: _add your deployed URL here once published — see [Deployment](#deployment)_

---

## 1. Setup

This is a static site with **no build step, no framework, and no dependencies to
install**. Everything runs from plain HTML/CSS/JS, with GSAP and Google Fonts
loaded from a CDN at runtime.

### Quickest option
Just open `index.html` directly in a browser (double-click it, or drag it into a
browser window). Every asset is linked with a relative path, so it works with no
server.

### Recommended option (avoids occasional browser file:// quirks)
Serve the folder locally so it behaves exactly like production:

```bash
# Python (built into most systems)
cd codon-biotech-landing
python3 -m http.server 8000
# then open http://localhost:8000

# or, with Node installed
npx serve .
```

If you use VS Code, the "Live Server" extension works too — right-click
`index.html` → "Open with Live Server".

### Project structure
```
codon-biotech-landing/
├── index.html        # all page markup, semantic sections
├── css/
│   └── styles.css    # design tokens + layout + responsive rules
├── js/
│   └── main.js        # animations, interactions, scroll behavior
└── README.md
```

---

## 2. Deployment

The site is a static bundle, so any static host works. Two easy options:

### Option A — GitHub Pages (free, matches the "GitHub repository" deliverable)
```bash
cd codon-biotech-landing
git init
git add .
git commit -m "CODON landing page"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
Then in the repo: **Settings → Pages → Source: Deploy from a branch → Branch:
main / (root)**. GitHub will publish it at
`https://<your-username>.github.io/<your-repo>/` within a minute or two.

### Option B — Netlify / Vercel drag-and-drop
Both offer a zero-config path: drag the `codon-biotech-landing` folder onto
Netlify's "Deploy manually" panel (app.netlify.com/drop), or run `vercel` in the
project folder with the Vercel CLI. No build command is needed — leave the
publish/output directory as the project root.

Once live, paste the URL at the top of this README and in your submission form.

---

## 3. Design & animation approach

### Grounding the brief
The brief asked for "a biotechnology company," not a specific product, so the
first decision was to invent one rather than design something generic. **CODON**
designs programmable RNA therapeutics — its whole premise is that the genome is
a source code and disease is a bug in it. That thesis is what the entire visual
system is built from, rather than reaching for biotech's usual stock imagery of
glowing green helixes and Latin-condescension serif ("Innovating the Future of
Life Sciences").

### Staying clear of the references
The brief points at two Dribbble concepts and warns explicitly against copying
them. Checked directly against both: one uses a rounded-card UI with dark
stat blocks and a warm macro-photo hero; the other's actual signature is a
radial spoke diagram fanning out from a central mark. Neither pattern appears
here — different palette and type system from the first, and the second's
radial-diagram device was deliberately avoided altogether rather than
"reskinned," since changing colors on someone else's distinctive layout idea
isn't the same as making an original one. The one thing pulled from either,
in spirit only, is surfacing real numbers directly in the hero rather than
only after a scroll — executed as bordered mono chips consistent with the
rest of CODON's system, not the rounded dark cards they're rendered as
elsewhere.

### Visual identity
- **Palette** — a clean, light "paper" background (`#F7F8F7`) with two deep
  accents held in deliberate tension: coral (`#C43E2C`) and teal (`#147063`).
  Deliberately not the dark/neon register biotech landing pages default to —
  this reads closer to how an actual pharma or investor-facing corporate site
  presents itself. It's also deliberately not the other AI-design default
  (warm cream + terracotta): the background is a cool, near-neutral off-white,
  not cream, and the accents are jewel-toned rather than clay. The coral/teal
  pairing itself isn't arbitrary — it echoes complementary base-pairing (A–T,
  G–C), and it's used structurally throughout: alternating strand colors in
  the helix, alternating eyebrow dots per section, a "discovered vs. designed"
  comparison panel.
- **Type** — Instrument Sans for display headlines, IBM Plex Sans for body
  copy, and **IBM Plex Mono** used deliberately as a signature accent (nav
  logotype, eyebrows, stat digits, pipeline indices, form labels). Reaching for
  monospace outside of literal code blocks is the one typographic risk in the
  system — it's there to keep reinforcing "the genome is code" without having
  to say it again in copy.
- **Structure as information** — the Platform section is numbered 01–04
  because it's a genuine sequential pipeline (sequence design → codon
  optimization → delivery → manufacturing); the Applications grid is
  deliberately *not* numbered, because those four areas aren't a sequence.

### Signature moment
Two, in deliberate escalation. The hero's double helix is drawn procedurally
in JS (not a static asset or video) — two sine-wave strands computed every
frame, connected by base-pair rungs that alternate front/back opacity to fake
depth, with a slow phase drift and a subtle mouse-parallax tilt. The headline
resolves out of scrambled nucleotide letters into the real sentence, like a
sequence being decoded.

But the real centerpiece is the **Sequence Console** — an interactive encoder
you can actually type into. Every letter you enter is deterministically
converted into a triplet of bases live, rendered as syntax-highlighted chips
in a terminal-style panel, with a working "copy sequence" button. It's the
one place on the page that lets a visitor *do* the thing the copy is telling
them CODON does, rather than just read about it — the difference between
describing a platform and handing someone the smallest possible version of it.

This section is also the one deliberately dark surface on an otherwise light
page — a scoped color system (its own CSS custom properties, never touching
the global palette) that revives the vivid neon coral/teal originally used
across the whole site before the switch to a lighter, more corporate register.
Those colors work best on black; rather than lose them, they got one true
home instead of being spread thin everywhere. That's the "spend your boldness
in one place" principle applied literally: the whole page stays quiet and
professional except for the one surface that's actually behaving like
software, which gets to look like it.

### Structure with real hierarchy
The Applications section breaks from the uniform-card-grid habit: Oncology is
a featured, wider card with a tinted background and a "Lead focus area" tag,
sitting above three peer cards — an actual bento layout, not just visual
variety for its own sake. The size difference is explained in the copy
(most sequencing data, least tolerance for delay), so the hierarchy encodes
something true rather than decorating an otherwise flat list.

### Motion, more broadly
- A thin **sequence strip** under the nav doubles as a scroll-progress
  indicator, rendered as a strand of A/T/G/C bases that light up as you scroll
  — a functional element wearing the same visual language as the hero, instead
  of a generic gradient progress bar.
- The hero visual settles back and fades slightly as you scroll past it —
  a scroll-linked parallax tying the hero to what follows instead of just
  cutting away from it.
- Application cards tilt subtly toward the cursor in 3D on hover (desktop
  pointer only) — small, but it's the difference between a static card and
  one that feels responsive to being looked at.
- Section content fades/rises in on scroll via `IntersectionObserver`
  (**not** gated behind the GSAP CDN — see [Engineering notes](#4-engineering-notes)).
- Stat numbers count up once they enter the viewport.
- Mouse behavior is otherwise intentionally standard — the system cursor, no
  cursor replacement, no magnetic hover pulls on buttons. Motion is reserved
  for the moments that carry meaning rather than decorating every interaction.

### Restraint
`prefers-reduced-motion` is respected everywhere: the helix stops animating and
renders once, the headline shows its final text immediately instead of
scrambling, section reveals show fully visible with no transition, the hero
parallax and card tilt are skipped entirely rather than jankily disabled
mid-effect, and the scroll-cue's animated drip is disabled via the global
reduced-motion CSS block.

---

## 4. Engineering notes

- **No build step, on purpose.** Everything ships as plain HTML/CSS/JS so the
  project can be opened, edited, and deployed by anyone without installing
  tooling — and so deployment is a straight static-file push (see
  [Deployment](#2-deployment)).
- **Content visibility doesn't depend on the CDN.** Scroll reveals and stat
  counters are driven by a native `IntersectionObserver`; GSAP (loaded from
  cdnjs) is layered on top purely for nicer easing on the stat tweens. If the
  GSAP request is blocked or slow, the page still reveals and counts correctly
  with a plain `requestAnimationFrame` fallback — I found this the hard way
  while testing against a restrictive network and fixed it rather than
  leaving a silent failure mode.
- **`IntersectionObserver` reflects real scroll, not scroll history.** Worth
  noting since it tripped up my own testing: an element only reveals once it's
  actually been geometrically visible in the viewport. Normal scrolling
  (mouse wheel, trackpad, keyboard, touch) always passes through every
  section on the way, so this is invisible in practice — verified with both
  simulated wheel-scroll and keyboard navigation. The only way to see
  something different is a JS-driven instant teleport (`scrollTo` with
  `behavior: "instant"` straight to the bottom), which isn't a real user
  action; even then, the observer is still fully alive and self-corrects the
  moment the page is scrolled normally afterward.
- **The Sequence Console's encoding is a deterministic, invertible mapping**
  (letter index → coprime-scattered base-4 value → three bases), not a lookup
  table — every letter always produces the same codon, and the same three
  colors always mean the same base, across the whole page.
- **The helix and sequence strip are generated, not baked assets** — no images
  to optimize or licence, and they scale losslessly to any viewport.
- **Accessibility**: semantic landmarks (`header`/`nav`/`main`/`section`/
  `footer`), a skip-to-content link, visible focus rings (`:focus-visible`),
  labelled form fields, decorative SVGs marked `aria-hidden`, and every text
  color checked against its background for WCAG AA contrast.
- **Responsive breakpoints** at 1000px (nav collapses to a slide-in panel,
  hero/thesis/CTA grids stack) and 620px (card grids drop to a single column).
- Tested at desktop (1440px), tablet (834px), and mobile (390px) widths, plus
  keyboard-only navigation and `prefers-reduced-motion`.

### Extending it
The contact form is intentionally front-end only (client-side validation +
success state) since this is a static deliverable — it's structured so the
`fetch()` call to a real backend (e.g. a Laravel `mail` route) can be dropped
straight into the `submit` handler in `js/main.js` without touching the markup.

---

## 5. Credits
- Fonts: [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans),
  [IBM Plex Sans / Mono](https://fonts.google.com/specimen/IBM+Plex+Sans) via
  Google Fonts.
- Animation: [GSAP](https://gsap.com/) (core only) via cdnjs.
- CODON is a fictional company invented for this exercise; all figures,
  programs, and partner counts are illustrative.