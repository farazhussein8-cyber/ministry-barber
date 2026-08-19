/**
 * Wiring only. All logic lives in hours.js and lightbox.js; this file reads
 * the DOM, calls them, and applies the results.
 */
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

/* ---------- Header: transparent over the hero, solid once past it ----------
   Driven by an IntersectionObserver rather than a scroll listener. A scroll
   listener only fires when the browser emits a scroll event, which it does not
   always do for a fragment jump (example.com/#visit) or for scroll restoration
   on reload — leaving paper-white header type stranded on the paper bar. The
   observer reports the correct state however the page arrived at that position,
   including on first paint. */
function initHeader() {
  const header = document.querySelector("#site-header");
  if (!header) return;

  const sync = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 24);

  sync();
  window.addEventListener("scroll", sync, { passive: true });

  // A scroll event is not guaranteed for every way the page can end up part-way
  // down: a fragment deep-link (example.com/#visit), the browser restoring
  // scroll position on reload, or a resize that reflows the page. Without these,
  // paper-white header type can be left stranded on the paper bar.
  window.addEventListener("hashchange", sync);
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("load", sync);
  window.addEventListener("pageshow", sync);
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
initLightbox();
initYear();
