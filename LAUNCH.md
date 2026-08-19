# Launch checklist — Barber Station

Nothing on this list is optional. Every `TODO-CONTENT` marker in `index.html`
must be resolved before this site goes public. There are **12** of them today:

```bash
grep -n "TODO-CONTENT" index.html
```

Run the test suite after any content edit — it checks that the visible hours
table and the JSON-LD schema still agree:

```bash
npm test
```

---

## Facts to confirm with the shop

- [ ] **Street address: 1/2 Camp Road or 2 Camp Road?** Google Business says
      `1/2`, the Setmore page says `2`. One of them is wrong.
- [ ] **Opening hours**, especially the **Saturday 6:00am** open — unusual enough
      to be worth re-checking.
- [ ] Exact Facebook page URL.
- [ ] The domain name, and where the site will be hosted.

## Content to supply

- [ ] **Full service menu** — every service, duration and price. Only
      "Haircut, 30 min" is currently known, and it has no price. All six rows on
      the page are placeholders reading `$00`.
- [ ] **Hero photograph**, landscape, at least 1600px wide.
- [ ] **8 gallery photographs.** The grid expects a mix: two tall portraits, two
      wide landscapes, four square. Shooting to those shapes keeps the layout.
- [ ] **1–2 interior photographs.**
- [ ] **One portrait per barber**, plus first names and a one-line description.
- [ ] **Three genuine Google review quotes** with reviewer first names.
      **These must be real and quoted accurately.** Inventing testimonials for a
      trading business breaches the Fair Trading Act.
- [ ] Logo file, ideally SVG (optional — the wordmark is set in type otherwise).

## Technical before go-live

- [ ] Replace every `example.com` in the JSON-LD block and the Open Graph tags
      with the real domain.
- [ ] Confirm the `geo` latitude and longitude against Google Maps.
- [ ] Replace `images/og-image.svg` with a real **1200×630 JPEG**, update the
      `og:image` references, and add back:
      ```html
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      ```
- [ ] Write real `alt` text for every photograph. The current alt text describes
      images that do not exist yet.
- [ ] Confirm the visible hours table and the JSON-LD `openingHoursSpecification`
      state the same hours. `npm test` enforces this.
- [ ] Update `aggregateRating` if the Google rating or review count has moved.
      **Never state a rating the listing does not support.**
- [ ] Test `tel:` and `mailto:` links on a real phone.
- [ ] Confirm the Setmore link opens the correct booking page.
- [ ] Run Google's Rich Results Test on the deployed URL — expect `HairSalon`
      detected with zero errors.
- [ ] Run Lighthouse in mobile mode on the deployed URL. Targets: Performance
      ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100.

## Human checks still outstanding

These could not be verified programmatically during the build and need a person:

- [ ] **Keyboard pass.** Tab from the top of the page to the bottom with a real
      keyboard. Every link, button and gallery thumbnail must show a visible
      brass focus ring. The stylesheet is correct and nothing suppresses
      outlines, but `:focus-visible` only activates on genuine keyboard focus,
      which an automated harness cannot produce.
- [ ] **Lightbox by keyboard.** Open a thumbnail with `Enter`, navigate with
      `←`/`→`, close with `Esc`, and confirm focus lands back on the thumbnail
      you opened.
- [ ] **Real-device check** on an actual iPhone and Android handset, especially
      the fixed bottom Book/Call bar against the browser chrome.
- [ ] **Cross-browser:** current Chrome, Safari, Firefox, plus iOS Safari.
- [ ] **Screen reader spot-check** of the hero, the price menu and the hours
      table.

## Already verified during the build

For reference, these were checked and passed:

- 15 automated tests, covering the timezone-aware open/closed logic (including
  the Saturday block, Sunday wrap-around and exact open/close boundaries) and
  hours/contact consistency between the schema and the visible page.
- WCAG AA contrast on every text pair. This forced one change: `--brass`
  (`#B4884D`) is only 3.04:1 on paper, so small brass text uses `--brass-text`
  (`#8C6733`, 4.86:1). Plain `--brass` remains for rules, dots, focus rings and
  large display text, where 3:1 is the applicable threshold.
- The site renders and reads correctly with JavaScript disabled: no `reveal`
  classes or `opacity: 0` in the served HTML, the open/closed chip stays hidden
  rather than showing an empty pill, and the gallery degrades to a plain grid.
- No horizontal overflow at 375, 768, 1280 or 1920px.
- The fixed mobile bar clears the footer at the very bottom of the page.
- Header hairline appears on scroll and retracts at the top.
- Anchor links land clear of the sticky header.

## After go-live

- [ ] Make the site, Google Business, Setmore and Facebook state an **identical**
      name, address and phone number. Inconsistent NAP data measurably harms
      local search ranking.
- [ ] Add the new domain to the Google Business listing.
