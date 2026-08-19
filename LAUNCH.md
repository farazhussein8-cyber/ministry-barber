# Launch checklist — Ministry Barber

Nothing on this list is optional. Every `TODO-CONTENT` marker in `index.html`
must be resolved before this site goes public:

```bash
grep -n "TODO-CONTENT" index.html
```

Run the test suite after any content edit — it checks that the visible hours
table and the JSON-LD schema still agree, and that no booking link has crept
back onto a walk-ins-only site:

```bash
npm test
```

---

## Hours — confirmed

Open seven days, 9am daily:

| Day | Hours |
|---|---|
| Monday – Friday | 9am – 6pm |
| Saturday | 9am – 5pm |
| Sunday | 9am – 4pm |

Verified across a full week and at every open/close boundary, including the
three different closing times. These drive both the live "Open now / Closed"
chip and what Google publishes, so any change must be made in **two** places —
the `openingHoursSpecification` block in `<head>` and the visible table in the
Visit section. `npm test` fails if the two disagree.

Still worth resolving with the shop:

- [ ] **Address conflict.** Google gives **3/25 Mokoia Road**; the Birkenhead
      Town Centre directory gives **1/25 Mokoia Rd**. The site uses Google's
      3/25. <https://www.birkenhead.net.nz/shop/Stylists/MensBarbers/Ministry+Barbershop.html>
- [ ] **Trading name.** The site uses "Ministry Barber" per the Google profile;
      the directory lists "Ministry Barbershop".

## Confirmed business facts

These came from the Google Business listing and are already in the site:

| Field | Value |
|---|---|
| Name | Ministry Barber |
| Address | 3/25 Mokoia Road, Birkenhead, Auckland 0626 |
| Phone | 021 169 8886 |
| Rating | 5.0 from 113 Google reviews |
| Booking | **None — walk-ins only** |

## Facts still missing

- [ ] Email address — the listing shows none, so the site has no email link.
- [ ] Social links — none found. Add them to the Visit section if they exist.
- [ ] Domain name, and where the site will be hosted. The listing has no
      website yet, so this will be the shop's first.

## Content to supply

- [ ] **Prices.** All six service rows read `$00`. Confirm the service list too —
      the current rows (haircut, skin fade, fade & beard, beard trim, clean
      shave, kids cut) are inferred from the shop's own description, not from a
      price list.
- [ ] **Hero photograph**, landscape, at least 1600px wide.
- [ ] **8 gallery photographs.** The grid expects a mix: two tall portraits, two
      wide landscapes, four square. Shooting to those shapes keeps the layout.
- [ ] **1–2 interior photographs.**
- [ ] **Three genuine Google review quotes** with reviewer first names.
      **These must be real and quoted accurately.** Inventing testimonials for a
      trading business breaches the Fair Trading Act. With 113 reviews at 5.0
      there is plenty to choose from.
- [ ] Logo file, ideally SVG (optional — the wordmark is set in type otherwise).

## Technical before go-live

- [ ] Replace every `example.com` in the JSON-LD block and the Open Graph tags
      with the real domain.
- [ ] Confirm the `geo` latitude and longitude against Google Maps. They are
      currently an approximation for Birkenhead, not a surveyed position.
- [ ] Replace `images/og-image.svg` with a real **1200×630 JPEG**, update the
      `og:image` references, and add back:
      ```html
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      ```
- [ ] Write real `alt` text for every photograph. The current alt text describes
      images that do not exist yet.
- [ ] Update `aggregateRating` if the rating or review count has moved.
      **Never state a rating the Google listing does not support.**
- [ ] Test the `tel:` link on a real phone.
- [ ] Check the Google Maps directions links resolve to the correct shop — they
      currently search by name and address rather than by place ID.
- [x] ~~Confirm the embedded map renders.~~ **Verified.** It loads and resolves
      to the correct business — the pin reads MINISTRY BARBER, 3/25 Mokoia Road,
      Birkenhead, with the 5.0 ★ (113) badge. The earlier blank render was the
      preview browser being slow to load third-party frames, not a fault in the
      embed.
- [ ] Run Google's Rich Results Test on the deployed URL — expect `HairSalon`
      detected with zero errors.
- [ ] Run Lighthouse in mobile mode. Targets: Performance ≥ 90, Accessibility
      100, Best Practices ≥ 95, SEO 100.

## Human checks still outstanding

These could not be verified programmatically and need a person:

- [ ] **Keyboard pass.** Tab from top to bottom. Every link, button and gallery
      thumbnail must show a visible brass focus ring. The stylesheet is correct
      and nothing suppresses outlines, but `:focus-visible` only activates on
      genuine keyboard focus, which an automated harness cannot produce.
- [ ] **Lightbox by keyboard.** Open with `Enter`, navigate with `←`/`→`, close
      with `Esc`, and confirm focus lands back on the thumbnail you opened.
- [ ] **Real-device check** on an actual iPhone and Android handset, especially
      the fixed bottom Directions/Call bar against the browser chrome.
- [ ] **Cross-browser:** current Chrome, Safari, Firefox, plus iOS Safari.
- [ ] **Screen reader spot-check** of the hero, the price menu and the hours
      table.

## Already verified during the build

- 16 automated tests: the timezone-aware open/closed logic (Saturday block,
  Sunday wrap-around, exact open/close boundaries), hours and contact
  consistency between schema and page, and a guard that no booking link,
  `ReserveAction`, or "Book" button exists on a walk-ins-only site.
- WCAG AA contrast on every text pair. This forced one change: `--brass`
  (`#B4884D`) is only 3.04:1 on paper, so small brass text uses `--brass-text`
  (`#8C6733`, 4.86:1). Plain `--brass` remains for rules, dots, focus rings and
  large display text, where 3:1 is the applicable threshold.
- The site renders and reads correctly with JavaScript disabled.
- No horizontal overflow at 375, 768, 1280 or 1920px.
- The fixed mobile bar clears the footer at the very bottom of the page.
- The header floats transparent over the hero and switches to the blurred paper
  bar past it, including on a fragment deep-link and on scroll restoration.
- Full interaction passes at desktop, tablet and mobile: nav, mobile menu,
  lightbox open/navigate/close/focus-restore, all controls on-screen with 44×44
  tap targets, and all sections revealing on scroll.
- Clean console on a fresh load: zero errors, zero failed requests.

## After go-live

- [ ] Make the site and the Google Business listing state an **identical** name,
      address and phone number. Inconsistent NAP data measurably harms local
      search ranking.
- [ ] Add the new domain to the Google Business listing — it currently has no
      website, so this is a direct win.
