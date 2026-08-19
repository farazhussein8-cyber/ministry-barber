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
