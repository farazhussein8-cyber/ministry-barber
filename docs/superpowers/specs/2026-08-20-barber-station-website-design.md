# Barber Station — Website Design

**Date:** 2026-08-20
**Status:** Approved, pending implementation plan
**Client:** Barber Station, Mount Wellington, Auckland

---

## 1. Purpose

A brochure website for Barber Station, an existing barbershop. The site does not
take bookings itself. Its single job is to make a visitor confident enough to
press **Book Now**, which hands off to the shop's existing Setmore booking page.

Success looks like: a stranger who found the shop on Google arrives, sees that it
is open, sees what a haircut costs, sees the standard of the work, and books —
without ever needing to scroll back up or leave the page to find a phone number.

### Non-goals

These are deliberately excluded and should not be added without a new decision:

- No booking or scheduling system. Setmore already does this.
- No contact form. A static site has no backend to receive one, and a form that
  silently fails is worse than no form. Phone, email and Setmore cover every
  reason a customer would make contact.
- No blog, no newsletter signup, no e-commerce.
- No CMS. Content changes are made by editing HTML.
- No dark mode. The site commits to a single light treatment (see §4.2).
- No multi-page structure. See §5.

---

## 2. Business facts

These are the source of truth for content. Items marked **UNCONFIRMED** must be
verified with the shop owner before launch.

| Field | Value | Status |
|---|---|---|
| Trading name | Barber Station | Confirmed |
| Address | 1/2 Camp Road, Mount Wellington, Auckland 1062 | **UNCONFIRMED** |
| Phone | 020 422 7237 | Confirmed |
| Email | barberstationltd@gmail.com | Confirmed |
| Hours, Mon–Fri | 8:00am – 5:00pm | **UNCONFIRMED** |
| Hours, Sat | 6:00am – 2:00pm | **UNCONFIRMED** |
| Hours, Sun | Closed | **UNCONFIRMED** |
| Google rating | 4.8 from 118 reviews | Confirmed at time of writing |
| Facebook following | 1,100+ | Confirmed |
| Booking platform | https://barberstationskz8.setmore.com | Confirmed |

**Address discrepancy:** Google Business lists `1/2 Camp Road`; the Setmore page
lists `2 Camp Road`. One is wrong. Resolve before launch, then make the site,
Google Business, Setmore and Facebook all agree — inconsistent NAP (name,
address, phone) data across listings measurably harms local search ranking.

**Hours:** a 6:00am Saturday open is unusual enough to be worth re-checking. The
hours appear in three places in the build (the live open/closed chip, the Visit
table, and the JSON-LD schema) and all three read from one shared source, so a
correction is a single edit.

---

## 3. Content required from client

The build proceeds with clearly-marked placeholders. All of the following must be
supplied and swapped in before launch.

### 3.1 Blocking for launch

- **Service menu** — every service, with duration and price. Only "Haircut,
  30 mins" is currently known, and it has no price.
- **Photography:**
  - 1 hero image, landscape, high resolution
  - 6–9 gallery images of completed cuts, a mix of portrait and landscape
  - 1–2 interior images of the shop
  - 1 portrait per barber
- **Team** — first name and a one-line description for each barber.
- **Reviews** — 3 real Google review quotes with the reviewer's first name.
  These must be genuine and quoted accurately; fabricated testimonials are both
  dishonest and a legal risk under the NZ Fair Trading Act.
- **Address and hours** confirmed per §2.
- **Facebook page URL** — the exact permalink.

### 3.2 Nice to have

- Logo file, ideally SVG. Without one, the wordmark is set in type.
- Per-service Setmore deep links, so a price row can book that exact service.
- A parking note, if there is anything useful to say.

---

## 4. Visual system

Direction: **modern editorial minimal**. Generous white space, large photography,
restrained type, hairline rules. The photography carries the site; the design
gets out of its way.

### 4.1 Typography

| Role | Face | Usage |
|---|---|---|
| Display | Instrument Serif | Hero line, section openers, pull quotes, service names |
| Everything else | Inter | Nav, body, prices, hours, buttons, captions |

Both are free via Google Fonts. Each needs a real fallback stack
(`Georgia, serif` and `system-ui, sans-serif` respectively).

The serif appears **only at large sizes**. Using it for small functional text is
what makes serif pairings look amateur, and it is explicitly out of bounds.

Scale is intentionally extreme — the core editorial move is that nothing sits in
the timid middle:

- Hero: `clamp(2.75rem, 8vw, 7.5rem)`
- Section openers: `clamp(2rem, 4.5vw, 3.5rem)`
- Body: `1.0625rem` (17px), line-height `1.6`
- Eyebrow labels: `0.75rem`, uppercase, `0.14em` letter-spacing

### 4.2 Colour

Near-monochrome by design. The haircut photography supplies all the colour the
site needs.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FAF9F6` | Page background — warm off-white, not clinical white |
| `--ink` | `#131211` | Headings, body copy, primary button |
| `--muted` | `#706C66` | Secondary copy, captions, durations |
| `--line` | `#E6E2DB` | Hairline rules and borders |
| `--brass` | `#B4884D` | Star rating, eyebrow labels, link underlines — nothing else |

No barber-pole red-white-blue. That palette is the fastest possible way to look
like every other barbershop template and it actively fights the chosen
direction. Brass carries the same traditional-grooming signal with restraint.

All colours are defined as CSS custom properties on `:root` so a future rebrand
is a single block edit.

### 4.3 Layout

- 12-column grid, `1280px` max width, generous gutters.
- Hairline `1px` rules are the primary structural device — separating sections
  and bracketing the price list, the way a printed menu does.
- Sections carry numbered uppercase eyebrows: `01 — SERVICES`, `02 — GALLERY`.
- Vertical rhythm: ~140px between sections on desktop, ~80px on mobile.
- One or two elements deliberately break the grid so the page does not read as a
  wireframe.

### 4.4 Motion

Restrained, and entirely optional to the page working:

- 12px rise-and-fade as a section enters the viewport, via `IntersectionObserver`.
- Soft image zoom on gallery hover.
- Nothing else. No parallax, no auto-playing carousel, no counting-up numbers.

All motion is wrapped in `@media (prefers-reduced-motion: reduce)` and disables
cleanly.

---

## 5. Structure

**Single-page scroller.** One document, anchor-link navigation, with the Book
button persistently in reach.

Chosen over a multi-page site because a single-location brochure site has no
content that justifies four thin pages, because it keeps all SEO signal on one
URL, because it is the stronger mobile experience, and because it removes a page
load from between the visitor and the booking button.

**Escape hatch:** if the service menu turns out to be long enough to dominate the
scroll, it moves to a standalone `/services.html` page and the home page keeps an
abbreviated "from $X" summary. This is a decision to make once the real menu
arrives, not upfront.

---

## 6. Sections

### Header

Wordmark left, anchor nav centre, **Book Now** right. Sticky. A hairline bottom
border fades in once the hero has scrolled past.

On mobile the nav collapses to a menu, and a fixed bottom bar pins **Book** and
**Call** side by side in the thumb zone, visible at every scroll position.

### Hero

Full-bleed photograph with the display line over it, plus three pieces of proof
stacked tight beneath:

1. A live **"Open now · closes 5pm"** / **"Closed · opens 8am Mon"** chip,
   computed in JS from the shared hours data.
2. `4.8 ★ · 118 Google reviews`
3. The Camp Road address.

Two buttons: *Book appointment* (Setmore, new tab) and *Call* (`tel:` link).

Everything a walk-in needs is visible before the first scroll.

### 01 — Services

The price menu as hairline-ruled rows: service name in the display serif,
duration in muted grey, price right-aligned. Reads as a printed menu.

If per-service Setmore deep links are supplied, each row becomes a link to book
that specific service.

### 02 — Gallery

Mixed-aspect grid — tall portraits alongside wider shots, so it does not read as
a flat 3×3. Clicking an image opens a lightweight custom lightbox (no library):
overlay, arrow-key and swipe navigation, `Esc` to close, focus trapped while
open, focus returned to the trigger on close.

Images are responsive (`srcset`) and lazy-loaded below the fold.

### 03 — The shop

Interior photograph alongside a short paragraph about the shop, followed by a
team strip: portrait, first name, one line each.

### 04 — Reviews

Three real Google review quotes set large in the display serif, the 4.8
aggregate, and a link out to the Google listing. A 4.8 from 118 reviews is a
genuine asset and is given real estate accordingly.

### 05 — Visit

Embedded Google map, full address, an hours table with **today's row
highlighted**, phone, email, Facebook link, and a parking note if supplied.

### Footer

Wordmark, quick links, social links, copyright.

---

## 7. Technical

### 7.1 Stack

Plain static site. No build step, no dependencies, no framework.

```
barber-station/
├── index.html
├── css/styles.css
├── js/main.js
├── images/
└── docs/superpowers/specs/
```

Deployable by dragging the folder onto Netlify, Cloudflare Pages or Vercel, or by
uploading to any host that serves files.

### 7.2 JavaScript

Three small, independent modules in one file, each doing one thing:

| Module | Responsibility |
|---|---|
| `openStatus` | Reads the shared hours object; renders the open/closed chip and highlights today's row in the Visit table |
| `lightbox` | Gallery overlay: open, close, next/previous, focus management |
| `reveal` | `IntersectionObserver` scroll animation; no-ops under `prefers-reduced-motion` |

Plus a small mobile nav toggle.

**The site must work fully with JavaScript disabled.** The chip is absent rather
than broken, the gallery is a plain grid of images, sections are visible rather
than faded in. Nothing behind JS is load-bearing.

**Hours are defined once.** The single source is the `openingHoursSpecification`
block inside the static JSON-LD script tag in the HTML head (§7.3). `openStatus`
parses that block at runtime to drive both the open/closed chip and the
today-highlight in the Visit table.

This ordering matters: the schema must be static in the HTML so search engines
read it without executing JavaScript. Defining the hours in `main.js` instead
would either duplicate them or make the schema JS-dependent. Reading the schema
from JS gives one source of truth and a crawlable schema at the same time.

The human-readable hours table in the Visit section is written in the HTML as
plain markup, so it renders without JS. It is the one acceptable duplication —
and any edit to it must be mirrored in the JSON-LD block, which the launch
checklist (§8) verifies.

### 7.3 SEO and sharing

- **`LocalBusiness` / `HairSalon` JSON-LD** with name, address, geo, phone,
  opening hours and aggregate rating. This is what lets Google surface hours and
  stars directly in search results — the highest-leverage item on the site for a
  single-location shop, at roughly 20 lines.
- **Open Graph and Twitter Card tags** with a dedicated share image, so links
  posted to the shop's 1.1K-follower Facebook page render a proper card.
- Favicon set, semantic heading hierarchy, a descriptive `<title>` and meta
  description naming both the service and the suburb.

The aggregate rating in the schema must be kept roughly current, and must never
state a rating the Google listing does not support.

### 7.4 Performance

- Responsive `srcset` images; WebP with JPEG fallback.
- `loading="lazy"` on everything below the fold; the hero image eager and
  `fetchpriority="high"`.
- `preconnect` to the Google Fonts origins; fonts loaded with `display=swap`.
- No libraries, so total JS stays in the low single-digit kilobytes.
- Target: Lighthouse performance ≥ 90 on mobile.

### 7.5 Accessibility

- WCAG AA contrast for all text. `--muted` on `--paper` must be verified, and
  hero text over photography needs a scrim to guarantee contrast.
- Visible focus states on every interactive element — never `outline: none`
  without a replacement.
- Real `alt` text on content images; empty `alt` on decorative ones.
- Semantic landmarks, a skip link, and correct heading order.
- Lightbox is fully keyboard operable with focus trapped and restored.
- Full keyboard traversal of the page in a sensible order.

---

## 8. Testing

Manual, proportionate to a static brochure site:

1. **Content** — every placeholder replaced; phone, email, address, hours and
   Setmore link verified correct and consistent with Google Business. The
   visible hours table and the JSON-LD `openingHoursSpecification` state the
   same hours.
2. **Links** — every anchor scrolls to its section; Book opens Setmore in a new
   tab; `tel:` and `mailto:` work on a real phone.
3. **Open/closed logic** — chip and today-highlight correct at: mid-week open,
   mid-week closed, Saturday morning open, Sunday closed, and across the
   open/close boundary.
4. **Responsive** — 375px, 768px, 1280px, 1920px. No horizontal scroll at any
   width. Mobile bottom bar does not obscure content or the footer.
5. **Degradation** — page is usable and readable with JS disabled.
6. **Accessibility** — keyboard-only traversal including the lightbox; contrast
   checked; tested with `prefers-reduced-motion` enabled.
7. **Sharing** — Open Graph card renders correctly in a link preview validator.
8. **Structured data** — passes Google's Rich Results Test.
9. **Performance** — Lighthouse mobile run, performance ≥ 90.
10. **Browsers** — current Chrome, Safari and Firefox, plus iOS Safari.

---

## 9. Open questions

1. Is the address `1/2 Camp Road` or `2 Camp Road`?
2. Are the Saturday hours really 6:00am – 2:00pm?
3. What is the full service menu, with durations and prices?
4. Does a logo file exist?
5. Should price rows deep-link to individual Setmore services, or all to the
   booking page root?
6. Who owns the domain, and where will the site be hosted?
