/**
 * Guards the one duplication the design permits: opening hours appear both in
 * the JSON-LD block (the source of truth, read by search engines and by
 * main.js) and in the human-readable table (which must render without JS).
 * If those two ever disagree, the site lies to somebody. This catches it.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseOpeningHours, formatTime } from "../js/hours.js";

const html = readFileSync(
  fileURLToPath(new URL("../index.html", import.meta.url)),
  "utf8"
);

function schemaFromHtml() {
  const match = html.match(/id="business-schema">([\s\S]*?)<\/script>/);
  assert.ok(match, "index.html must contain a #business-schema JSON-LD block");
  return JSON.parse(match[1]);
}

function tableRowsFromHtml() {
  const rows = [];
  const re = /<tr data-day="(\d)"><th scope="row">([^<]+)<\/th><td>([^<]+)<\/td><\/tr>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    rows.push({ day: Number(m[1]), label: m[2], text: m[3].trim() });
  }
  return rows;
}

test("the JSON-LD block is valid JSON and describes the business", () => {
  const schema = schemaFromHtml();
  assert.equal(schema["@type"], "HairSalon");
  assert.equal(schema.name, "Barber Station");
  assert.equal(schema.telephone, "+64204227237");
});

test("the visible hours table covers all seven days exactly once", () => {
  const rows = tableRowsFromHtml();
  assert.equal(rows.length, 7);
  assert.deepEqual(
    rows.map((r) => r.day).sort((a, b) => a - b),
    [0, 1, 2, 3, 4, 5, 6]
  );
});

test("the visible hours table agrees with the JSON-LD schema", () => {
  const spec = parseOpeningHours(schemaFromHtml());
  const rows = tableRowsFromHtml();

  for (const row of rows) {
    const block = spec.find((b) => b.days.includes(row.day));
    const expected = block
      ? `${formatTime(block.opens)} – ${formatTime(block.closes)}`
      : "Closed";
    assert.equal(
      row.text,
      expected,
      `${row.label}: table says "${row.text}", schema says "${expected}"`
    );
  }
});

test("contact details are consistent across the page", () => {
  const schema = schemaFromHtml();
  assert.ok(html.includes('href="tel:+64204227237"'), "tel: link present");
  assert.ok(
    html.includes(`href="mailto:${schema.email}"`),
    "mailto: link matches the schema email"
  );
  assert.ok(
    html.includes("https://barberstationskz8.setmore.com"),
    "Setmore booking link present"
  );
});
