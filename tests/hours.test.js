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
