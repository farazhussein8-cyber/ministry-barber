# Barber Station Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page static brochure website for Barber Station that makes a visitor confident enough to press Book Now, which hands off to the shop's existing Setmore booking page.

**Architecture:** One `index.html` with an editorial-minimal design system in `css/styles.css` and three small, independent ES modules in `js/`. Shop opening hours live in exactly one place — the static JSON-LD block in the HTML head — which search engines read directly and which the JavaScript parses at runtime to render a live open/closed chip. There is no build step, no framework, and no runtime dependency; `package.json` exists solely so `node --test` can run the hours logic tests and is never shipped to production.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `clamp()`), vanilla ES modules, Node 24 built-in test runner (`node --test`), Google Fonts (Instrument Serif + Inter).

**Spec:** `docs/superpowers/specs/2026-08-20-barber-station-website-design.md`

## Global Constraints

- **No dependencies.** No framework, no build step, no npm packages — `package.json` has zero `dependencies` and zero `devDependencies`. Node's built-in test runner only.
- **The site must work fully with JavaScript disabled.** The open/closed chip is absent rather than broken, the gallery is a plain grid of links, sections are visible rather than faded in. Nothing behind JS is load-bearing.
- **Hours are stated in exactly two places** and must always agree: the JSON-LD `openingHoursSpecification` (the source of truth, parsed by JS) and the human-readable table in the Visit section (plain HTML so it renders without JS).
- **Colour tokens, verbatim:** `--paper: #FAF9F6`, `--ink: #131211`, `--muted: #706C66`, `--line: #E6E2DB`, `--brass: #B4884D`. No other colours. No barber-pole red/white/blue.
- **Type:** Instrument Serif for display only, at large sizes. Inter for everything functional. The serif is never used below 24px.
- **No dark mode.** Single light treatment.
- **All motion** wrapped in `@media (prefers-reduced-motion: reduce)` and disables cleanly.
- **Timezone:** all open/closed logic computes in `Pacific/Auckland`, never the viewer's local timezone.
- **Placeholder content** must be visually obvious as placeholder and greppable via the marker `TODO-CONTENT` in an HTML comment beside it.
- **Business facts, verbatim:** Barber Station · 1/2 Camp Road, Mount Wellington, Auckland 1062 · 020 422 7237 · barberstationltd@gmail.com · https://barberstationskz8.setmore.com · 4.8 from 118 Google reviews.
- **Accessibility floor:** WCAG AA contrast, visible focus states on every interactive element, semantic landmarks, correct heading order.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | The entire page: head/meta/schema, all seven sections, semantic markup |
| `css/styles.css` | Design tokens, reset, layout primitives, every section's styles |
| `js/hours.js` | **Pure logic.** Parse JSON-LD hours, compute open/closed status. No DOM. |
| `js/lightbox.js` | Gallery overlay: open, close, next/prev, focus trap and restore |
| `js/main.js` | Wiring only: reads the DOM, calls `hours.js`, initialises lightbox and reveal |
| `tests/hours.test.js` | `node --test` suite for the hours logic |
| `package.json` | Test script only. Zero dependencies. Not deployed. |
| `images/` | Photography and placeholder SVGs |

`hours.js` is deliberately DOM-free — that is what makes the trickiest logic on the site (timezone-aware open/closed across day boundaries) unit-testable without a browser. `main.js` is the only file that touches both the DOM and the logic modules.

---

## Task 1: Project scaffold, design tokens, and typography

**Files:**
- Create: `package.json`, `.gitignore`, `index.html`, `css/styles.css`, `images/placeholder.svg`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: the CSS custom properties `--paper`, `--ink`, `--muted`, `--line`, `--brass`, `--font-display`, `--font-body`, `--wrap`, `--gutter`; the utility classes `.wrap`, `.eyebrow`, `.rule`, `.btn`, `.btn--primary`, `.btn--ghost`; and `images/placeholder.svg`. Every later task uses these names.

- [ ] **Step 1: Initialise the repository**

```bash
cd "C:/Users/GGPC/Downloads/barber-station"
git init
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.DS_Store
Thumbs.db
*.log
```

- [ ] **Step 3: Create `package.json`**

Zero dependencies — this file exists only so Node treats `.js` as ES modules and so `npm test` runs the suite.

```json
{
  "name": "barber-station",
  "version": "1.0.0",
  "private": true,
  "description": "Brochure website for Barber Station, Mount Wellington, Auckland",
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "serve": "npx --yes serve@14 . --listen 3000"
  }
}
```

`serve` is fetched on demand by `npx` and is never installed into the project, so `dependencies` stays empty and nothing ships to production.

- [ ] **Step 4: Create `images/placeholder.svg`**

A single placeholder reused at every aspect ratio via `object-fit: cover`. It is intentionally ugly enough that nobody ships it by accident.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="Placeholder image">
  <rect width="800" height="800" fill="#E6E2DB"/>
  <g fill="#706C66" font-family="system-ui, sans-serif" text-anchor="middle">
    <text x="400" y="380" font-size="34" letter-spacing="6">PLACEHOLDER</text>
    <text x="400" y="430" font-size="22">replace before launch</text>
  </g>
  <path d="M0 0h800v800H0z" fill="none" stroke="#B4884D" stroke-width="8" stroke-dasharray="18 14"/>
</svg>
```

- [ ] **Step 5: Create `index.html` with the head and an empty body shell**

```html
<!doctype html>
<html lang="en-NZ">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Barber Station — Barbershop in Mount Wellington, Auckland</title>
  <meta name="description" content="Barber Station is a barbershop on Camp Road, Mount Wellington, Auckland. Rated 4.8 from 118 Google reviews. Book online, or call 020 422 7237.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main"></main>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 6: Create `css/styles.css` with the reset and token layer**

```css
/* ---------- Tokens ---------- */
:root {
  --paper: #FAF9F6;
  --ink: #131211;
  --muted: #706C66;
  --line: #E6E2DB;
  --brass: #B4884D;

  --font-display: "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;

  --wrap: 1280px;
  --gutter: clamp(1.25rem, 4vw, 3rem);
  --section-gap: clamp(5rem, 11vw, 8.75rem);
}

/* ---------- Reset ---------- */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html { -webkit-text-size-adjust: 100%; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img, svg, video { display: block; max-width: 100%; }
img { height: auto; }

a { color: inherit; }

button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }

h1, h2, h3 { font-weight: 400; line-height: 1.05; text-wrap: balance; }

:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 3px;
  border-radius: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--ink);
  color: var(--paper);
  padding: 0.75rem 1.25rem;
  z-index: 100;
}
.skip-link:focus { left: 0; }

/* ---------- Layout primitives ---------- */
.wrap {
  width: 100%;
  max-width: var(--wrap);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.section { padding-block: var(--section-gap); }

.rule { border: 0; border-top: 1px solid var(--line); }

.eyebrow {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brass);
  margin-bottom: 1.75rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.5vw, 3.5rem);
}

.lede { color: var(--muted); max-width: 46ch; }

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1.6rem;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  border: 1px solid var(--ink);
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.25s ease, color 0.25s ease;
}
.btn--primary { background: var(--ink); color: var(--paper); }
.btn--primary:hover { background: transparent; color: var(--ink); }
.btn--ghost { background: transparent; color: var(--ink); }
.btn--ghost:hover { background: var(--ink); color: var(--paper); }
```

- [ ] **Step 7: Verify tokens render**

Serve the site and confirm the page loads with the warm paper background and no console errors:

```bash
npx --yes serve@14 . --listen 3000
```

Open `http://localhost:3000`. Expected: a blank `#FAF9F6` page, no 404 for `css/styles.css`, no console errors. Tab once — the "Skip to content" link must appear.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold static site with editorial design tokens"
```

---

## Task 2: Hours logic module with tests

This is the only genuinely tricky logic on the site — timezone-aware, crosses day boundaries, and wraps around Sunday. It gets real tests.

**Files:**
- Create: `js/hours.js`, `tests/hours.test.js`

**Interfaces:**
- Consumes: `.eyebrow` etc. not required — this module is DOM-free.
- Produces, and later tasks depend on these exact signatures:
  - `parseOpeningHours(schema: object) -> Array<{days: number[], opens: string, closes: string}>` where `days` holds JS `getDay()` indices (Sunday `0` … Saturday `6`) and `opens`/`closes` are `"HH:MM"` 24-hour strings.
  - `getShopParts(date: Date) -> {day: number, minutes: number}` — the weekday index and minutes-since-midnight for that instant in `Pacific/Auckland`.
  - `getStatus(spec: Array, date: Date) -> {open: boolean, label: string, today: number}` where `label` reads `"Open now · closes 5pm"` or `"Closed · opens 8am Monday"`, and `today` is the Auckland weekday index.
  - `formatTime(hhmm: string) -> string` — `"17:00"` becomes `"5pm"`, `"08:30"` becomes `"8:30am"`.

- [ ] **Step 1: Write the failing tests**

Create `tests/hours.test.js`. August is New Zealand winter, so Auckland is UTC+12 (NZST) for every fixture below.

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  parseOpeningHours,
  getShopParts,
  getStatus,
  formatTime,
} from "../js/hours.js";

const SCHEMA = {
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "06:00",
      closes: "14:00",
    },
  ],
};

test("formatTime renders 12-hour times without a leading zero", () => {
  assert.equal(formatTime("17:00"), "5pm");
  assert.equal(formatTime("08:00"), "8am");
  assert.equal(formatTime("08:30"), "8:30am");
  assert.equal(formatTime("14:00"), "2pm");
  assert.equal(formatTime("00:00"), "12am");
  assert.equal(formatTime("12:00"), "12pm");
});

test("parseOpeningHours maps weekday names to getDay indices", () => {
  const spec = parseOpeningHours(SCHEMA);
  assert.equal(spec.length, 2);
  assert.deepEqual(spec[0].days, [1, 2, 3, 4, 5]);
  assert.equal(spec[0].opens, "08:00");
  assert.deepEqual(spec[1].days, [6]);
  assert.equal(spec[1].closes, "14:00");
});

test("getShopParts converts UTC to Auckland time, not local time", () => {
  // 2026-08-19T21:00Z is Thursday 2026-08-20, 09:00 in Auckland (UTC+12).
  const parts = getShopParts(new Date("2026-08-19T21:00:00Z"));
  assert.equal(parts.day, 4); // Thursday
  assert.equal(parts.minutes, 9 * 60);
});

test("open during weekday trading hours", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-19T21:00:00Z")); // Thu 09:00
  assert.equal(status.open, true);
  assert.equal(status.label, "Open now · closes 5pm");
  assert.equal(status.today, 4);
});

test("closed after the weekday close points at tomorrow", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-20T06:00:00Z")); // Thu 18:00
  assert.equal(status.open, false);
  assert.equal(status.label, "Closed · opens 8am Friday");
});

test("closed before opening points at today", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-19T18:00:00Z")); // Thu 06:00
  assert.equal(status.open, false);
  assert.equal(status.label, "Closed · opens 8am today");
});

test("open on Saturday morning uses the Saturday block", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-21T19:00:00Z")); // Sat 07:00
  assert.equal(status.open, true);
  assert.equal(status.label, "Open now · closes 2pm");
  assert.equal(status.today, 6);
});

test("Sunday is closed and wraps forward to Monday", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-22T22:00:00Z")); // Sun 10:00
  assert.equal(status.open, false);
  assert.equal(status.label, "Closed · opens 8am Monday");
  assert.equal(status.today, 0);
});

test("exactly at closing time counts as closed", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-20T05:00:00Z")); // Thu 17:00
  assert.equal(status.open, false);
});

test("exactly at opening time counts as open", () => {
  const spec = parseOpeningHours(SCHEMA);
  const status = getStatus(spec, new Date("2026-08-19T20:00:00Z")); // Thu 08:00
  assert.equal(status.open, true);
});

test("a schema with no hours never claims to be open", () => {
  const status = getStatus([], new Date("2026-08-19T21:00:00Z"));
  assert.equal(status.open, false);
  assert.equal(status.label, "");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../js/hours.js'`.

- [ ] **Step 3: Write the implementation**

Create `js/hours.js`:

```js
const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHOP_TIMEZONE = "Pacific/Auckland";

const shopTimeFormatter = new Intl.DateTimeFormat("en-NZ", {
  timeZone: SHOP_TIMEZONE,
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "17:00" -> "5pm", "08:30" -> "8:30am" */
export function formatTime(hhmm) {
  const [rawHour, rawMinute] = hhmm.split(":").map(Number);
  const suffix = rawHour < 12 ? "am" : "pm";
  const hour = rawHour % 12 === 0 ? 12 : rawHour % 12;
  return rawMinute === 0
    ? `${hour}${suffix}`
    : `${hour}:${String(rawMinute).padStart(2, "0")}${suffix}`;
}

function toMinutes(hhmm) {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

/** Read the JSON-LD block into a normalised, DOM-free shape. */
export function parseOpeningHours(schema) {
  const blocks = schema?.openingHoursSpecification ?? [];
  return blocks.map((block) => {
    const names = Array.isArray(block.dayOfWeek)
      ? block.dayOfWeek
      : [block.dayOfWeek];
    return {
      days: names
        .map((name) => DAY_INDEX[String(name).split("/").pop()])
        .filter((index) => index !== undefined),
      opens: block.opens,
      closes: block.closes,
    };
  });
}

/** The weekday and minutes-since-midnight for an instant, in Auckland time. */
export function getShopParts(date) {
  const parts = shopTimeFormatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // en-NZ hour12:false can render midnight as "24"; normalise it to 0.
  const hour = Number(lookup.hour) % 24;
  return {
    day: DAY_INDEX[lookup.weekday],
    minutes: hour * 60 + Number(lookup.minute),
  };
}

function blockForDay(spec, day) {
  return spec.find((block) => block.days.includes(day)) ?? null;
}

/** Search forward from `day` for the next day the shop opens. */
function nextOpening(spec, day, minutes) {
  const todayBlock = blockForDay(spec, day);
  if (todayBlock && minutes < toMinutes(todayBlock.opens)) {
    return { block: todayBlock, when: "today" };
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = (day + offset) % 7;
    const block = blockForDay(spec, candidate);
    if (block) {
      return {
        block,
        when: offset === 1 ? "tomorrow" : DAY_NAMES[candidate],
      };
    }
  }
  return null;
}

/** {open, label, today} for an instant. Never throws on empty input. */
export function getStatus(spec, date) {
  const { day, minutes } = getShopParts(date);

  if (!spec || spec.length === 0) {
    return { open: false, label: "", today: day };
  }

  const todayBlock = blockForDay(spec, day);
  if (
    todayBlock &&
    minutes >= toMinutes(todayBlock.opens) &&
    minutes < toMinutes(todayBlock.closes)
  ) {
    return {
      open: true,
      label: `Open now · closes ${formatTime(todayBlock.closes)}`,
      today: day,
    };
  }

  const next = nextOpening(spec, day, minutes);
  if (!next) {
    return { open: false, label: "Closed", today: day };
  }

  const whenLabel = next.when === "tomorrow" ? DAY_NAMES[(day + 1) % 7] : next.when;
  return {
    open: false,
    label: `Closed · opens ${formatTime(next.block.opens)} ${whenLabel}`,
    today: day,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test
```

Expected: PASS, 11 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add js/hours.js tests/hours.test.js
git commit -m "feat: add timezone-aware opening hours logic with tests"
```

---

## Task 3: Structured data, social meta, and favicon

**Files:**
- Modify: `index.html` (head)
- Create: `images/favicon.svg`, `images/og-image.jpg` (placeholder)

**Interfaces:**
- Consumes: nothing
- Produces: a `<script type="application/ld+json" id="business-schema">` element. `js/main.js` in Task 11 reads it by that exact id. The `openingHoursSpecification` inside it is the single source of truth for hours.

- [ ] **Step 1: Create `images/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#131211"/>
  <text x="32" y="44" text-anchor="middle" font-family="Georgia, serif"
        font-size="38" fill="#FAF9F6">B</text>
</svg>
```

- [ ] **Step 2: Add the JSON-LD block to `index.html`**

Insert immediately before `</head>`. Note the `TODO-CONTENT` marker on `geo` — the coordinates must be read off Google Maps for the confirmed address before launch.

```html
  <script type="application/ld+json" id="business-schema">
  {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "name": "Barber Station",
    "description": "Barbershop in Mount Wellington, Auckland.",
    "image": "https://example.com/images/og-image.jpg",
    "telephone": "+64204227237",
    "email": "barberstationltd@gmail.com",
    "url": "https://example.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1/2 Camp Road",
      "addressLocality": "Mount Wellington",
      "addressRegion": "Auckland",
      "postalCode": "1062",
      "addressCountry": "NZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -36.9089,
      "longitude": 174.8443
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "06:00",
        "closes": "14:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "118"
    },
    "hasMap": "https://maps.google.com/?q=Barber+Station+Camp+Road+Mount+Wellington",
    "potentialAction": {
      "@type": "ReserveAction",
      "target": "https://barberstationskz8.setmore.com"
    }
  }
  </script>
```

<!-- TODO-CONTENT: replace example.com with the real domain; confirm geo coordinates; confirm street address (1/2 vs 2 Camp Road) -->

- [ ] **Step 3: Add social and icon meta to `index.html`**

Insert after the `<meta name="description">` line:

```html
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">

  <meta property="og:type" content="business.business">
  <meta property="og:site_name" content="Barber Station">
  <meta property="og:title" content="Barber Station — Barbershop in Mount Wellington, Auckland">
  <meta property="og:description" content="Rated 4.8 from 118 Google reviews. Book online, or call 020 422 7237.">
  <meta property="og:image" content="https://example.com/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://example.com">
  <meta name="twitter:card" content="summary_large_image">
```

- [ ] **Step 4: Create a placeholder `images/og-image.jpg`**

Copy the placeholder SVG to a 1200×630 JPEG so the tag is never broken. Until a real share image exists:

```bash
cp images/placeholder.svg images/og-image.svg
```

Then update the two `og:image` references and `"image"` in the schema to `images/og-image.svg`, and delete the `og:image:width`/`og:image:height` tags. Swap back to a real 1200×630 JPEG at launch and restore the dimension tags.

- [ ] **Step 5: Verify the schema parses**

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8').match(/id=\"business-schema\">([\s\S]*?)<\/script>/);JSON.parse(m[1]);console.log('schema OK')"
```

Expected: `schema OK`. Malformed JSON throws here rather than failing silently in Google's crawler.

- [ ] **Step 6: Commit**

```bash
git add index.html images/
git commit -m "feat: add LocalBusiness schema, Open Graph tags and favicon"
```

---

## Task 4: Header, navigation, and mobile action bar

**Files:**
- Modify: `index.html` (body), `css/styles.css`

**Interfaces:**
- Consumes: `.wrap`, `.btn`, `.btn--primary` from Task 1
- Produces: `.site-header` (gets the `is-scrolled` class from Task 11), `#nav-toggle` and `#site-nav` (wired by Task 11), and the `.mobile-bar` element.

- [ ] **Step 1: Add the header markup**

Insert directly after the skip link in `index.html`:

```html
  <header class="site-header" id="site-header">
    <div class="wrap site-header__inner">
      <a class="wordmark" href="#top">Barber&nbsp;Station</a>

      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle__box" aria-hidden="true"></span>
        <span class="sr-only">Menu</span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="Primary">
        <a href="#services">Services</a>
        <a href="#gallery">Gallery</a>
        <a href="#shop">The shop</a>
        <a href="#reviews">Reviews</a>
        <a href="#visit">Visit</a>
      </nav>

      <a class="btn btn--primary site-header__cta"
         href="https://barberstationskz8.setmore.com"
         target="_blank" rel="noopener">Book now</a>
    </div>
  </header>
```

- [ ] **Step 2: Add the mobile action bar**

Insert immediately before the closing `</body>` tag, above the script tag:

```html
  <div class="mobile-bar">
    <a class="btn btn--ghost" href="tel:+64204227237">Call</a>
    <a class="btn btn--primary"
       href="https://barberstationskz8.setmore.com"
       target="_blank" rel="noopener">Book now</a>
  </div>
```

- [ ] **Step 3: Style the header and mobile bar**

Append to `css/styles.css`:

```css
/* ---------- Screen reader utility ---------- */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---------- Header ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}
.site-header.is-scrolled { border-bottom-color: var(--line); }

.site-header__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 72px;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.01em;
  text-decoration: none;
  margin-right: auto;
}

.site-nav { display: flex; gap: 2rem; }
.site-nav a {
  font-size: 0.9375rem;
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease;
}
.site-nav a:hover { border-bottom-color: var(--brass); }

.site-header__cta { padding: 0.7rem 1.4rem; }

.nav-toggle { display: none; }
.nav-toggle__box {
  display: block;
  width: 22px;
  height: 10px;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
}

/* ---------- Mobile bar ---------- */
.mobile-bar { display: none; }

@media (max-width: 860px) {
  .site-header__cta { display: none; }
  .nav-toggle { display: block; }

  .site-nav {
    position: absolute;
    left: 0; right: 0; top: 100%;
    flex-direction: column;
    gap: 0;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    padding: 0 var(--gutter) 1rem;
    display: none;
  }
  .site-nav.is-open { display: flex; }
  .site-nav a { padding: 0.9rem 0; border-bottom: 1px solid var(--line); }

  .mobile-bar {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 60;
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 0.6rem;
    padding: 0.7rem var(--gutter) calc(0.7rem + env(safe-area-inset-bottom));
    background: color-mix(in srgb, var(--paper) 94%, transparent);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--line);
  }

  /* Stop the fixed bar covering the end of the page. */
  body { padding-bottom: 5.5rem; }
}
```

- [ ] **Step 4: Verify**

Reload at 1280px: wordmark left, five nav links, Book now button right, no bottom bar. Resize to 375px: nav links hidden behind the toggle, bottom bar pinned with Call and Book now. Scroll to the very bottom — the footer content must not sit underneath the bar.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add sticky header, mobile nav and mobile action bar"
```

---

## Task 5: Hero

**Files:**
- Modify: `index.html`, `css/styles.css`

**Interfaces:**
- Consumes: `.wrap`, `.btn`, `.btn--primary`, `.btn--ghost`
- Produces: `#open-status` — the empty element Task 11 fills with the open/closed label. It must contain nothing in the HTML so that a JS-disabled visitor sees no empty chip.

- [ ] **Step 1: Add the hero markup**

Insert inside `<main id="main">`:

```html
    <section class="hero" id="top">
      <img class="hero__img" src="images/placeholder.svg"
           alt="The interior of Barber Station in Mount Wellington"
           fetchpriority="high" width="1600" height="1000">
      <!-- TODO-CONTENT: replace with the real hero photograph -->

      <div class="wrap hero__inner">
        <p class="hero__eyebrow">Mount Wellington, Auckland</p>
        <h1 class="hero__title">A proper cut,<br>booked in a minute.</h1>

        <ul class="hero__proof">
          <li id="open-status" class="status" hidden></li>
          <li><span class="stars" aria-hidden="true">★</span> 4.8 · 118 Google reviews</li>
          <li>1/2 Camp Road, Mount Wellington</li>
        </ul>

        <div class="hero__actions">
          <a class="btn btn--primary"
             href="https://barberstationskz8.setmore.com"
             target="_blank" rel="noopener">Book appointment</a>
          <a class="btn btn--ghost" href="tel:+64204227237">020 422 7237</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Style the hero**

Append to `css/styles.css`:

```css
.hero {
  position: relative;
  display: grid;
  align-items: end;
  min-height: min(88vh, 900px);
  padding-block: clamp(3rem, 8vw, 6rem);
  isolation: isolate;
  color: var(--paper);
}

.hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}

/* Scrim guarantees AA contrast over any photograph. */
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    to top,
    rgba(19, 18, 17, 0.82) 0%,
    rgba(19, 18, 17, 0.55) 45%,
    rgba(19, 18, 17, 0.15) 100%
  );
}

.hero__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 8vw, 7.5rem);
  margin-bottom: 2rem;
}

.hero__proof {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.75rem;
  font-size: 0.9375rem;
  margin-bottom: 2.25rem;
}
.hero__proof li { display: flex; align-items: center; gap: 0.45rem; }

.stars { color: var(--brass); }

.status::before {
  content: "";
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 0.15rem;
}
.status[data-open="true"] { color: #7FBF7F; }
.status[data-open="false"] { color: #D9A5A5; }

.hero__actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.hero .btn { border-color: var(--paper); }
.hero .btn--primary { background: var(--paper); color: var(--ink); }
.hero .btn--primary:hover { background: transparent; color: var(--paper); }
.hero .btn--ghost { color: var(--paper); }
.hero .btn--ghost:hover { background: var(--paper); color: var(--ink); }
```

The two status colours are the sole exception to the five-token palette. They sit on the dark scrim, not on paper, and both clear 4.5:1 against it — a red/green signal is the one place where colour carries meaning that shape cannot.

- [ ] **Step 3: Verify**

Reload. Expected: full-bleed placeholder, huge serif headline in paper-white, readable proof row, two buttons. The status chip must be **invisible** (it is still `hidden` until Task 11). Check the headline against the image at 375px — no overflow, no horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add hero with proof row and booking actions"
```

---

## Task 6: Services price menu

**Files:**
- Modify: `index.html`, `css/styles.css`

**Interfaces:**
- Consumes: `.section`, `.wrap`, `.eyebrow`, `.section-title`
- Produces: `.menu` and `.menu__row`. No JS dependency.

- [ ] **Step 1: Add the services markup**

Every price is a placeholder. The `TODO-CONTENT` marker makes them greppable.

```html
    <section class="section" id="services">
      <div class="wrap">
        <p class="eyebrow">01 — Services</p>
        <h2 class="section-title">What we do</h2>
        <p class="lede menu__lede">Walk in if we're quiet, or book ahead and skip the wait.</p>

        <!-- TODO-CONTENT: confirm every service, duration and price with the shop -->
        <ul class="menu">
          <li class="menu__row">
            <span class="menu__name">Haircut</span>
            <span class="menu__meta">30 min</span>
            <span class="menu__price">$00</span>
          </li>
          <li class="menu__row">
            <span class="menu__name">Haircut &amp; beard</span>
            <span class="menu__meta">45 min</span>
            <span class="menu__price">$00</span>
          </li>
          <li class="menu__row">
            <span class="menu__name">Skin fade</span>
            <span class="menu__meta">40 min</span>
            <span class="menu__price">$00</span>
          </li>
          <li class="menu__row">
            <span class="menu__name">Beard trim</span>
            <span class="menu__meta">20 min</span>
            <span class="menu__price">$00</span>
          </li>
          <li class="menu__row">
            <span class="menu__name">Kids cut</span>
            <span class="menu__meta">30 min</span>
            <span class="menu__price">$00</span>
          </li>
          <li class="menu__row">
            <span class="menu__name">Hot towel shave</span>
            <span class="menu__meta">30 min</span>
            <span class="menu__price">$00</span>
          </li>
        </ul>

        <a class="btn btn--primary menu__cta"
           href="https://barberstationskz8.setmore.com"
           target="_blank" rel="noopener">Book a time</a>
      </div>
    </section>
```

- [ ] **Step 2: Style the menu**

```css
.menu__lede { margin-top: 1.25rem; }

.menu {
  list-style: none;
  padding: 0;
  margin-top: 3.5rem;
  border-top: 1px solid var(--line);
}

.menu__row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: baseline;
  gap: 1rem 2rem;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--line);
}

.menu__name {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  line-height: 1.15;
}

.menu__meta {
  color: var(--muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.menu__price {
  font-size: 1.125rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 4ch;
  text-align: right;
}

.menu__cta { margin-top: 3rem; }

@media (max-width: 560px) {
  .menu__row {
    grid-template-columns: 1fr auto;
    gap: 0.25rem 1rem;
  }
  .menu__name { grid-column: 1; }
  .menu__price { grid-column: 2; grid-row: 1; }
  .menu__meta { grid-column: 1 / -1; }
}
```

- [ ] **Step 3: Verify**

Reload. Expected: six hairline-ruled rows, serif service names, right-aligned prices in a clean tabular column. At 375px each row becomes name + price on one line with the duration beneath — check no price wraps to its own line.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add services price menu"
```

---

## Task 7: Gallery grid

**Files:**
- Modify: `index.html`, `css/styles.css`
- Create: nothing

**Interfaces:**
- Consumes: `.section`, `.wrap`, `.eyebrow`, `.section-title`
- Produces: `.gallery` containing `.gallery__item` buttons, each with `data-full` (full-size image URL) and `data-caption`. Task 8 (`lightbox.js`) reads exactly those attribute names.

- [ ] **Step 1: Add the gallery markup**

Each item is a real `<button>` so it is keyboard-reachable and announced correctly. With JS disabled the buttons do nothing but the images are still visible — which is the required degradation.

```html
    <section class="section" id="gallery">
      <div class="wrap">
        <p class="eyebrow">02 — Gallery</p>
        <h2 class="section-title">Recent work</h2>
      </div>

      <div class="wrap">
        <!-- TODO-CONTENT: replace all eight images and write real alt text -->
        <ul class="gallery">
          <li><button class="gallery__item gallery__item--tall" data-full="images/placeholder.svg" data-caption="Skin fade">
            <img src="images/placeholder.svg" alt="A skin fade cut at Barber Station" loading="lazy" width="800" height="1000"></button></li>
          <li><button class="gallery__item" data-full="images/placeholder.svg" data-caption="Textured crop">
            <img src="images/placeholder.svg" alt="A textured crop cut at Barber Station" loading="lazy" width="800" height="800"></button></li>
          <li><button class="gallery__item" data-full="images/placeholder.svg" data-caption="Beard shape-up">
            <img src="images/placeholder.svg" alt="A shaped beard at Barber Station" loading="lazy" width="800" height="800"></button></li>
          <li><button class="gallery__item gallery__item--wide" data-full="images/placeholder.svg" data-caption="In the chair">
            <img src="images/placeholder.svg" alt="A barber working in the chair" loading="lazy" width="1200" height="800"></button></li>
          <li><button class="gallery__item gallery__item--tall" data-full="images/placeholder.svg" data-caption="Classic taper">
            <img src="images/placeholder.svg" alt="A classic tapered cut" loading="lazy" width="800" height="1000"></button></li>
          <li><button class="gallery__item" data-full="images/placeholder.svg" data-caption="Line-up">
            <img src="images/placeholder.svg" alt="A sharp line-up" loading="lazy" width="800" height="800"></button></li>
          <li><button class="gallery__item" data-full="images/placeholder.svg" data-caption="Buzz cut">
            <img src="images/placeholder.svg" alt="A buzz cut" loading="lazy" width="800" height="800"></button></li>
          <li><button class="gallery__item gallery__item--wide" data-full="images/placeholder.svg" data-caption="The shop">
            <img src="images/placeholder.svg" alt="Chairs and mirrors inside Barber Station" loading="lazy" width="1200" height="800"></button></li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 2: Style the grid**

```css
.gallery {
  list-style: none;
  padding: 0;
  margin-top: 3.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 15rem;
  gap: 0.75rem;
}

.gallery__item {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: var(--line);
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery__item:hover img { transform: scale(1.04); }

.gallery li { display: block; }
.gallery li:has(.gallery__item--tall) { grid-row: span 2; }
.gallery li:has(.gallery__item--wide) { grid-column: span 2; }

@media (max-width: 860px) {
  .gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 11rem; }
}
```

- [ ] **Step 3: Verify**

Reload. Expected: an eight-image grid with two tall and two wide cells breaking the rhythm — not a flat 3×3. Hover an image: it zooms slightly. Tab through: every image is focusable with a visible brass outline. At 375px the grid is two columns with no overflow.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add mixed-aspect gallery grid"
```

---

## Task 8: Lightbox

**Files:**
- Create: `js/lightbox.js`
- Modify: `index.html` (dialog markup), `css/styles.css`

**Interfaces:**
- Consumes: `.gallery__item` buttons with `data-full` and `data-caption` from Task 7
- Produces: `export function initLightbox(root = document)` — attaches listeners and returns nothing. Task 11 calls it.

- [ ] **Step 1: Add the dialog markup**

Insert before the `.mobile-bar` element. A native `<dialog>` gives focus trapping and `Esc`-to-close from the platform rather than hand-rolled code.

```html
  <dialog class="lightbox" id="lightbox" aria-label="Gallery image viewer">
    <button class="lightbox__close" data-lb="close" aria-label="Close gallery">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev" data-lb="prev" aria-label="Previous image">&#8249;</button>
    <figure class="lightbox__figure">
      <img id="lightbox-img" src="" alt="">
      <figcaption id="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next" data-lb="next" aria-label="Next image">&#8250;</button>
  </dialog>
```

- [ ] **Step 2: Write `js/lightbox.js`**

```js
export function initLightbox(root = document) {
  const dialog = root.querySelector("#lightbox");
  const image = root.querySelector("#lightbox-img");
  const caption = root.querySelector("#lightbox-caption");
  const triggers = Array.from(root.querySelectorAll(".gallery__item"));

  if (!dialog || !image || triggers.length === 0) return;
  if (typeof dialog.showModal !== "function") return; // no <dialog>: grid still works

  let index = 0;

  function show(next) {
    index = (next + triggers.length) % triggers.length;
    const trigger = triggers[index];
    const inner = trigger.querySelector("img");
    image.src = trigger.dataset.full || inner.src;
    image.alt = inner ? inner.alt : "";
    caption.textContent = trigger.dataset.caption || "";
  }

  triggers.forEach((trigger, position) => {
    trigger.addEventListener("click", () => {
      show(position);
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", (event) => {
    const action = event.target.dataset.lb;
    if (action === "close") dialog.close();
    else if (action === "next") show(index + 1);
    else if (action === "prev") show(index - 1);
    else if (event.target === dialog) dialog.close(); // click the backdrop
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
  });

  // Return focus to the thumbnail that opened the viewer.
  dialog.addEventListener("close", () => triggers[index].focus());
}
```

`<dialog>.showModal()` handles the focus trap, the backdrop, inert-ing the rest of the page, and `Esc`. The `close` listener restores focus to the originating thumbnail, which `showModal` does not do on its own.

- [ ] **Step 3: Style the lightbox**

```css
.lightbox {
  width: min(94vw, 1100px);
  max-width: none;
  max-height: 92vh;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--paper);
  overflow: visible;
}
.lightbox::backdrop { background: rgba(19, 18, 17, 0.92); }

.lightbox__figure { margin: 0; text-align: center; }
.lightbox__figure img {
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  margin-inline: auto;
}
.lightbox__figure figcaption {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--line);
}

.lightbox__close {
  position: absolute;
  top: -2.75rem;
  right: 0;
  font-size: 2.25rem;
  line-height: 1;
  color: var(--paper);
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3rem;
  line-height: 1;
  padding: 0.5rem 1rem;
  color: var(--paper);
}
.lightbox__nav--prev { left: -3.25rem; }
.lightbox__nav--next { right: -3.25rem; }

.lightbox :focus-visible { outline-color: var(--paper); }

@media (max-width: 860px) {
  .lightbox__nav--prev { left: 0; }
  .lightbox__nav--next { right: 0; }
  .lightbox__nav { background: rgba(19, 18, 17, 0.55); }
}
```

- [ ] **Step 4: Verify (this task's verification is the interaction, so do all of it)**

With `js/main.js` not yet wiring it, temporarily test by adding to the console:

```js
const m = await import("/js/lightbox.js"); m.initLightbox();
```

Then check every one of these:
1. Click a thumbnail — the overlay opens with that image.
2. Press `→` and `←` — the image changes, and wraps around at both ends.
3. Press `Esc` — it closes, and **focus returns to the thumbnail you clicked**.
4. `Tab` repeatedly while open — focus never escapes the dialog to the page behind.
5. Click the dark backdrop — it closes.
6. At 375px, the prev/next arrows sit inside the viewport and are tappable.

- [ ] **Step 5: Commit**

```bash
git add js/lightbox.js index.html css/styles.css
git commit -m "feat: add accessible gallery lightbox"
```

---

## Task 9: The shop and team

**Files:**
- Modify: `index.html`, `css/styles.css`

**Interfaces:**
- Consumes: `.section`, `.wrap`, `.eyebrow`, `.section-title`
- Produces: `.shop`, `.team`. No JS dependency.

- [ ] **Step 1: Add the markup**

```html
    <section class="section" id="shop">
      <div class="wrap shop">
        <div class="shop__media">
          <img src="images/placeholder.svg" alt="Inside Barber Station on Camp Road"
               loading="lazy" width="1000" height="1250">
          <!-- TODO-CONTENT: replace with a real interior photograph -->
        </div>

        <div class="shop__copy">
          <p class="eyebrow">03 — The shop</p>
          <h2 class="section-title">On Camp Road since day one</h2>
          <!-- TODO-CONTENT: replace this paragraph with the shop's own words -->
          <p class="lede">
            We're a neighbourhood barbershop in Mount Wellington. Fades, classic
            cuts, beard work and hot towel shaves — done properly, without the
            fuss. Most days you can walk in. If you'd rather not wait, book a
            time and we'll be ready for you.
          </p>
        </div>
      </div>

      <div class="wrap">
        <!-- TODO-CONTENT: replace with real barbers, portraits and first names -->
        <ul class="team">
          <li class="team__member">
            <img src="images/placeholder.svg" alt="Portrait of a barber" loading="lazy" width="600" height="750">
            <h3 class="team__name">Name</h3>
            <p class="team__role">Barber · fades and classic cuts</p>
          </li>
          <li class="team__member">
            <img src="images/placeholder.svg" alt="Portrait of a barber" loading="lazy" width="600" height="750">
            <h3 class="team__name">Name</h3>
            <p class="team__role">Barber · beard work</p>
          </li>
          <li class="team__member">
            <img src="images/placeholder.svg" alt="Portrait of a barber" loading="lazy" width="600" height="750">
            <h3 class="team__name">Name</h3>
            <p class="team__role">Barber · skin fades</p>
          </li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 2: Style it**

```css
.shop {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}
.shop__media img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
.shop__copy .lede { margin-top: 1.5rem; max-width: 42ch; }

.team {
  list-style: none;
  padding: 0;
  margin-top: clamp(3rem, 7vw, 5rem);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1rem, 3vw, 2.5rem);
}
.team__member img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
.team__name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  margin-top: 1rem;
}
.team__role { color: var(--muted); font-size: 0.875rem; }

@media (max-width: 860px) {
  .shop { grid-template-columns: 1fr; }
  .team { grid-template-columns: 1fr; max-width: 22rem; }
}
```

- [ ] **Step 3: Verify**

Reload. Expected: a two-column split with a 4:5 portrait image beside the copy, then three team cards below. At 375px everything stacks to one column and the team cards cap at 22rem so they don't become full-width and enormous.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add shop story and team section"
```

---

## Task 10: Reviews and Visit

**Files:**
- Modify: `index.html`, `css/styles.css`

**Interfaces:**
- Consumes: `.section`, `.wrap`, `.eyebrow`, `.section-title`, `.stars`
- Produces: `.hours-table` with one `<tr data-day="N">` per weekday, `N` being the JS `getDay()` index. Task 11 adds `is-today` to the matching row. This attribute name and index base must match `hours.js` exactly.

- [ ] **Step 1: Add the reviews markup**

The quotes below are placeholders. They must be replaced with genuine, accurately quoted Google reviews before launch — inventing testimonials for a trading business breaches the Fair Trading Act.

```html
    <section class="section reviews" id="reviews">
      <div class="wrap">
        <p class="eyebrow">04 — Reviews</p>
        <h2 class="section-title">
          <span class="stars" aria-hidden="true">★</span> 4.8 from 118 reviews
        </h2>

        <!-- TODO-CONTENT: replace all three with real, accurately quoted Google reviews -->
        <ul class="quotes">
          <li class="quote">
            <blockquote>Placeholder review quote goes here — replace with a real one.</blockquote>
            <cite>First name</cite>
          </li>
          <li class="quote">
            <blockquote>Placeholder review quote goes here — replace with a real one.</blockquote>
            <cite>First name</cite>
          </li>
          <li class="quote">
            <blockquote>Placeholder review quote goes here — replace with a real one.</blockquote>
            <cite>First name</cite>
          </li>
        </ul>

        <a class="reviews__link" href="https://maps.google.com/?q=Barber+Station+Camp+Road+Mount+Wellington"
           target="_blank" rel="noopener">Read all reviews on Google</a>
      </div>
    </section>
```

- [ ] **Step 2: Add the visit markup**

```html
    <section class="section" id="visit">
      <div class="wrap">
        <p class="eyebrow">05 — Visit</p>
        <h2 class="section-title">Find us</h2>
      </div>

      <div class="wrap visit">
        <div class="visit__map">
          <iframe
            title="Map showing Barber Station on Camp Road, Mount Wellington"
            src="https://www.google.com/maps?q=Barber+Station+Camp+Road+Mount+Wellington+Auckland&output=embed"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>

        <div class="visit__details">
          <h3 class="visit__heading">Address</h3>
          <p>1/2 Camp Road<br>Mount Wellington<br>Auckland 1062</p>
          <!-- TODO-CONTENT: confirm 1/2 vs 2 Camp Road -->

          <h3 class="visit__heading">Hours</h3>
          <!-- TODO-CONTENT: confirm hours; any change here must also be made in the JSON-LD block -->
          <table class="hours-table">
            <tbody>
              <tr data-day="1"><th scope="row">Monday</th><td>8am – 5pm</td></tr>
              <tr data-day="2"><th scope="row">Tuesday</th><td>8am – 5pm</td></tr>
              <tr data-day="3"><th scope="row">Wednesday</th><td>8am – 5pm</td></tr>
              <tr data-day="4"><th scope="row">Thursday</th><td>8am – 5pm</td></tr>
              <tr data-day="5"><th scope="row">Friday</th><td>8am – 5pm</td></tr>
              <tr data-day="6"><th scope="row">Saturday</th><td>6am – 2pm</td></tr>
              <tr data-day="0"><th scope="row">Sunday</th><td>Closed</td></tr>
            </tbody>
          </table>

          <h3 class="visit__heading">Contact</h3>
          <p>
            <a href="tel:+64204227237">020 422 7237</a><br>
            <a href="mailto:barberstationltd@gmail.com">barberstationltd@gmail.com</a><br>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a>
            <!-- TODO-CONTENT: replace with the exact Facebook page URL -->
          </p>

          <a class="btn btn--primary visit__cta"
             href="https://barberstationskz8.setmore.com"
             target="_blank" rel="noopener">Book appointment</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Style both sections**

```css
/* ---------- Reviews ---------- */
.reviews { border-top: 1px solid var(--line); }

.quotes {
  list-style: none;
  padding: 0;
  margin-top: 3.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
}
.quote blockquote {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  line-height: 1.3;
}
.quote cite {
  display: block;
  margin-top: 1rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-style: normal;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.reviews__link {
  display: inline-block;
  margin-top: 3rem;
  font-size: 0.9375rem;
  border-bottom: 1px solid var(--brass);
  text-decoration: none;
  padding-bottom: 2px;
}

/* ---------- Visit ---------- */
.visit {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: clamp(2rem, 6vw, 4rem);
  margin-top: 3.5rem;
}
.visit__map iframe {
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--line);
}

.visit__heading {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brass);
  margin-top: 2rem;
}
.visit__heading:first-child { margin-top: 0; }
.visit__details p { margin-top: 0.6rem; }
.visit__details a { text-decoration-color: var(--line); text-underline-offset: 3px; }

.hours-table {
  width: 100%;
  margin-top: 0.6rem;
  border-collapse: collapse;
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
}
.hours-table th,
.hours-table td { padding: 0.5rem 0; border-bottom: 1px solid var(--line); }
.hours-table th { font-weight: 400; text-align: left; color: var(--muted); }
.hours-table td { text-align: right; }
.hours-table .is-today th,
.hours-table .is-today td { color: var(--ink); font-weight: 500; }
.hours-table .is-today th::after { content: " · today"; color: var(--brass); }

.visit__cta { margin-top: 2rem; }

@media (max-width: 860px) {
  .quotes { grid-template-columns: 1fr; }
  .visit { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Verify**

Reload. Expected: three large serif quotes side by side, then a map beside the address, hours table and contact block. No row is highlighted yet — that arrives in Task 11. Confirm the map iframe actually loads a map. At 375px both sections become single-column.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add reviews and visit sections"
```

---

## Task 11: Footer, and wiring all JavaScript together

**Files:**
- Create: `js/main.js`
- Modify: `index.html` (footer), `css/styles.css`

**Interfaces:**
- Consumes: `parseOpeningHours`, `getStatus` from `js/hours.js` (Task 2); `initLightbox` from `js/lightbox.js` (Task 8); `#business-schema` (Task 3); `#open-status` (Task 5); `#nav-toggle` / `#site-nav` / `#site-header` (Task 4); `.hours-table tr[data-day]` (Task 10)
- Produces: the finished page. Nothing consumes `main.js`.

- [ ] **Step 1: Add the footer markup**

```html
    <footer class="site-footer">
      <div class="wrap site-footer__inner">
        <a class="wordmark" href="#top">Barber&nbsp;Station</a>
        <nav class="site-footer__nav" aria-label="Footer">
          <a href="#services">Services</a>
          <a href="#gallery">Gallery</a>
          <a href="#visit">Visit</a>
          <a href="https://barberstationskz8.setmore.com" target="_blank" rel="noopener">Book</a>
        </nav>
        <p class="site-footer__legal">
          &copy; <span id="year">2026</span> Barber Station · 1/2 Camp Road, Mount Wellington, Auckland
        </p>
      </div>
    </footer>
```

Place it after `</main>` and before the `.mobile-bar`.

- [ ] **Step 2: Style the footer and the reveal animation**

```css
/* ---------- Footer ---------- */
.site-footer {
  border-top: 1px solid var(--line);
  padding-block: 3rem;
}
.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem 2.5rem;
}
.site-footer__nav { display: flex; gap: 1.5rem; margin-right: auto; }
.site-footer__nav a { font-size: 0.9375rem; text-decoration: none; }
.site-footer__nav a:hover { border-bottom: 1px solid var(--brass); }
.site-footer__legal {
  width: 100%;
  font-size: 0.8125rem;
  color: var(--muted);
}

/* ---------- Reveal ---------- */
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1; transform: none; }
}

html { scroll-behavior: smooth; scroll-padding-top: 90px; }
```

`scroll-padding-top` stops the sticky header covering a section heading when an anchor link lands.

- [ ] **Step 3: Write `js/main.js`**

```js
import { parseOpeningHours, getStatus } from "./hours.js";
import { initLightbox } from "./lightbox.js";

/* ---------- Open / closed status ---------- */
function initStatus() {
  const schemaEl = document.querySelector("#business-schema");
  const statusEl = document.querySelector("#open-status");
  if (!schemaEl) return;

  let spec;
  try {
    spec = parseOpeningHours(JSON.parse(schemaEl.textContent));
  } catch {
    return; // malformed schema: leave the chip hidden rather than show nonsense
  }

  const status = getStatus(spec, new Date());

  if (statusEl && status.label) {
    statusEl.textContent = status.label;
    statusEl.dataset.open = String(status.open);
    statusEl.hidden = false;
  }

  const todayRow = document.querySelector(
    `.hours-table tr[data-day="${status.today}"]`
  );
  if (todayRow) todayRow.classList.add("is-today");
}

/* ---------- Mobile navigation ---------- */
function initNav() {
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Header hairline on scroll ---------- */
function initHeader() {
  const header = document.querySelector("#site-header");
  if (!header) return;
  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".section, .site-footer");
  if (reduced || !("IntersectionObserver" in window)) return;

  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Copyright year ---------- */
function initYear() {
  const el = document.querySelector("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

initStatus();
initNav();
initHeader();
initReveal();
initYear();
```

The `.reveal` class is added **by JavaScript**, never in the HTML. That is what guarantees the JS-disabled requirement: with no JS, nothing is ever set to `opacity: 0`, so every section is simply visible.

- [ ] **Step 4: Verify the wiring**

Reload and check each:
1. The hero chip now reads `Open now · closes 5pm` or `Closed · opens …`, with a green or muted-red dot. Cross-check against the real time in Auckland.
2. In the Visit hours table, today's row is darker and reads `Monday · today`.
3. Scroll down 30px — a hairline appears under the header.
4. Sections fade and rise in as they enter view.
5. Click a nav link — it scrolls to the section and the heading is **not** hidden behind the sticky header.
6. At 375px, the menu toggle opens the nav and tapping a link closes it again.
7. Console is clean.

- [ ] **Step 5: Verify the JS-disabled path**

Disable JavaScript in DevTools and hard-reload. Expected: every section visible and readable, gallery is a plain grid, the open/closed chip is **absent** (not an empty pill), the hours table shows all seven days with no highlight, all links and phone numbers work.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: add footer and wire status, nav, header and reveal"
```

---

## Task 12: Accessibility, performance, and launch checklist

**Files:**
- Modify: `css/styles.css`, `index.html` as defects are found
- Create: `LAUNCH.md`

**Interfaces:**
- Consumes: the finished site
- Produces: `LAUNCH.md`, the pre-launch content checklist the shop owner works through.

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: PASS, 11 tests.

- [ ] **Step 2: Keyboard-only pass**

Unplug the mouse. `Tab` from the top of the page to the bottom. Confirm: the skip link works; every link, button and gallery thumbnail shows a visible brass focus ring; the tab order matches the visual order; the lightbox traps focus and returns it on close; nothing is focusable that shouldn't be.

Fix anything that fails before continuing.

- [ ] **Step 3: Contrast audit**

Check with DevTools' contrast checker:

| Pair | Required |
|---|---|
| `--muted` `#706C66` on `--paper` `#FAF9F6` | ≥ 4.5:1 body text |
| `--brass` `#B4884D` on `--paper` | ≥ 4.5:1 — **this one is marginal; if it fails, darken the eyebrow text to `--muted` and keep brass for rules and dots only** |
| Hero text on the scrim | ≥ 4.5:1 at the darkest point of the photo |
| Status green/red on the scrim | ≥ 4.5:1 |

- [ ] **Step 4: Responsive sweep**

At 375px, 768px, 1280px and 1920px confirm: no horizontal scrollbar; no text clipped or overlapping; the mobile bar never covers the footer; the hero headline never overflows.

- [ ] **Step 5: Validate structured data**

Paste the rendered page source into Google's Rich Results Test. Expected: `HairSalon` detected, zero errors. Warnings about optional fields are acceptable.

- [ ] **Step 6: Lighthouse**

Run Lighthouse in mobile mode. Targets: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100. Fix anything that lands below.

- [ ] **Step 7: Write `LAUNCH.md`**

```markdown
# Launch checklist — Barber Station

Nothing on this list is optional. Every item marked `TODO-CONTENT` in
`index.html` must be resolved before this site goes public.

    grep -rn "TODO-CONTENT" index.html

## Facts to confirm with the shop
- [ ] Street address: is it **1/2 Camp Road** or **2 Camp Road**? Google and
      Setmore currently disagree.
- [ ] Opening hours, especially the **Saturday 6am** open.
- [ ] Exact Facebook page URL.
- [ ] The domain name, and where the site will be hosted.

## Content to supply
- [ ] Full service menu: every service, duration and price.
- [ ] Hero photograph (landscape, at least 1600px wide).
- [ ] 8 gallery photographs, a mix of portrait and landscape.
- [ ] 1–2 interior photographs.
- [ ] One portrait per barber, plus first names and a one-line description.
- [ ] Three genuine Google review quotes with reviewer first names.
      **These must be real and quoted accurately.** Inventing testimonials for
      a trading business breaches the Fair Trading Act.
- [ ] Logo file, ideally SVG (optional — the wordmark is set in type otherwise).

## Technical before go-live
- [ ] Replace every `example.com` in the JSON-LD and Open Graph tags with the
      real domain.
- [ ] Confirm the `geo` latitude and longitude against Google Maps.
- [ ] Replace `images/og-image.svg` with a real 1200×630 JPEG and restore the
      `og:image:width` / `og:image:height` tags.
- [ ] Write real `alt` text for every photograph.
- [ ] Confirm the visible hours table and the JSON-LD `openingHoursSpecification`
      state the same hours. They are the only two places hours appear.
- [ ] Update `aggregateRating` if the Google rating or review count has moved.
      Never state a rating the listing does not support.
- [ ] Re-run `npm test`, Lighthouse, and Google's Rich Results Test.
- [ ] Test `tel:` and `mailto:` links on a real phone.
- [ ] Confirm the Setmore link opens the correct booking page.

## After go-live
- [ ] Make the site, Google Business, Setmore and Facebook state an identical
      name, address and phone number. Inconsistent NAP data measurably harms
      local search ranking.
- [ ] Add the new domain to the Google Business listing.
```

- [ ] **Step 8: Confirm no placeholder ships silently**

```bash
grep -c "TODO-CONTENT" index.html
```

Expected: a non-zero count while placeholders remain. This number must reach `0` before launch, and `LAUNCH.md` is the record of what each one needs.

- [ ] **Step 9: Commit**

```bash
git add LAUNCH.md css/styles.css index.html
git commit -m "chore: accessibility and performance pass, add launch checklist"
```

---

## Self-Review

**Spec coverage.** Walked every section of the spec against the tasks:

| Spec section | Task |
|---|---|
| §1 purpose, non-goals | Honoured throughout; no contact form, no CMS, no dark mode, single page |
| §2 business facts | Tasks 3, 5, 10, 12 — with the address and hours discrepancies carried into `LAUNCH.md` |
| §3 content required | Task 12 `LAUNCH.md`, plus `TODO-CONTENT` markers in Tasks 5–10 |
| §4.1 typography | Task 1 tokens; serif restricted to display sizes in Tasks 5, 6, 9, 10 |
| §4.2 colour | Task 1 tokens; the one documented exception is the status dot in Task 5 |
| §4.3 layout | Task 1 primitives; hairline rules in Tasks 6, 10; numbered eyebrows in Tasks 6–10 |
| §4.4 motion | Task 7 hover zoom, Task 11 reveal and the `prefers-reduced-motion` block |
| §5 single-page structure | Tasks 4–11 |
| §6 every section | Task 4 header, 5 hero, 6 services, 7+8 gallery, 9 shop, 10 reviews+visit, 11 footer |
| §7.1 stack | Task 1 |
| §7.2 JS modules and JS-disabled | Tasks 2, 8, 11 — verified explicitly at Task 11 Step 5 |
| §7.3 SEO and sharing | Task 3 |
| §7.4 performance | `loading="lazy"` in Tasks 7, 9; `fetchpriority` in Task 5; `preconnect` in Task 1; Lighthouse in Task 12 |
| §7.5 accessibility | Focus styles and skip link in Task 1; `<dialog>` focus management in Task 8; full audit in Task 12 |
| §8 testing | Task 2 unit tests; Task 12 Steps 1–6; `LAUNCH.md` |

No gaps found.

**Placeholder scan.** No `TBD`, no "add error handling", no "similar to Task N". Every code step carries the actual code. The `TODO-CONTENT` markers are deliberate, are content-not-code, and are tracked to zero by Task 12 Step 8.

**Type consistency.** Checked the names that cross task boundaries:

- `parseOpeningHours` / `getStatus` — defined Task 2, imported Task 11. Match.
- `getStatus` returns `{open, label, today}` — Task 11 uses exactly those three. Match.
- `initLightbox` — exported Task 8, imported Task 11. Match.
- `data-full` / `data-caption` — written Task 7, read Task 8. Match.
- `tr[data-day="N"]` with Sunday `0` — written Task 10, queried Task 11 against `status.today`, which `hours.js` derives from the same `DAY_INDEX` base. Match.
- `#business-schema`, `#open-status`, `#nav-toggle`, `#site-nav`, `#site-header`, `#year` — declared Tasks 3–10, queried Task 11. All match.
- `.is-scrolled`, `.is-open`, `.is-today`, `.reveal`, `.is-visible` — styled Tasks 4, 10, 11; toggled Task 11. All match.
