/**
 * Opening-hours logic. Deliberately DOM-free so it can be unit tested.
 *
 * The single source of truth for hours is the JSON-LD block in index.html.
 * main.js parses that block and hands the result to these functions.
 */

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
  // en-NZ with hour12:false can render midnight as "24"; normalise it to 0.
  const hour = Number(lookup.hour) % 24;
  return {
    day: DAY_INDEX[lookup.weekday],
    minutes: hour * 60 + Number(lookup.minute),
  };
}

function blockForDay(spec, day) {
  return spec.find((block) => block.days.includes(day)) ?? null;
}

/** Search forward from `day` for the next time the shop opens. */
function nextOpening(spec, day, minutes) {
  const todayBlock = blockForDay(spec, day);
  if (todayBlock && minutes < toMinutes(todayBlock.opens)) {
    return { block: todayBlock, when: "today" };
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = (day + offset) % 7;
    const block = blockForDay(spec, candidate);
    if (block) {
      return { block, when: DAY_NAMES[candidate] };
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

  return {
    open: false,
    label: `Closed · opens ${formatTime(next.block.opens)} ${next.when}`,
    today: day,
  };
}
