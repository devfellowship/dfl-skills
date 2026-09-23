import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDayMonthYear } from "../src/lib/format.ts";
import { adaptPack } from "../src/lib/packs.ts";

test("formats a date as `23 Sep, 2026`", () => {
  assert.equal(formatDayMonthYear("2026-09-23T12:00:00Z", { utc: true }), "23 Sep, 2026");
});

test("drops the leading zero of the day", () => {
  assert.equal(formatDayMonthYear("2026-01-05T00:00:00Z", { utc: true }), "5 Jan, 2026");
});

test("uses `Sep`, never the ICU `Sept`, and every short month", () => {
  const got = Array.from({ length: 12 }, (_, i) =>
    formatDayMonthYear(`2026-${String(i + 1).padStart(2, "0")}-10T00:00:00Z`, { utc: true }),
  );
  assert.deepEqual(got, [
    "10 Jan, 2026", "10 Feb, 2026", "10 Mar, 2026", "10 Apr, 2026", "10 May, 2026", "10 Jun, 2026",
    "10 Jul, 2026", "10 Aug, 2026", "10 Sep, 2026", "10 Oct, 2026", "10 Nov, 2026", "10 Dec, 2026",
  ]);
});

test("a missing or unparseable date is a dash, never today", () => {
  assert.equal(formatDayMonthYear(null), "—");
  assert.equal(formatDayMonthYear(undefined), "—");
  assert.equal(formatDayMonthYear(""), "—");
  assert.equal(formatDayMonthYear("not a date"), "—");
});

test("the member keeps its own updated_at, and null when the API sends none", () => {
  const pack = adaptPack({
    source: "devfellowship/internal-skills",
    pack: "p",
    updated_at: "2026-09-01T00:00:00Z",
    members: [
      { slug: "a", role: "root", ordinal: 0, status: "in_catalogue", updated_at: "2026-09-21T14:05:00Z" },
      { slug: "b", role: "required", ordinal: 1, status: "not_published" },
    ],
  });
  assert.equal(pack.members[0].updatedAt, "2026-09-21T14:05:00Z");
  assert.equal(pack.members[1].updatedAt, null);
});
