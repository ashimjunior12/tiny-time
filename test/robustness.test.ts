import { describe, expect, it } from "vitest";
import { time, Time } from "../src/index.js";
import type { TimeUnit, StartEndUnit } from "../src/index.js";

/** Deterministic PRNG (mulberry32) so the "fuzz" is reproducible. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A spread of timestamps from 1990-01-01 to ~2060, plus curated edge dates.
const random = rng(1234567);
const RANDOM_TS: number[] = Array.from({ length: 400 }, () =>
  Math.floor(631152000000 + random() * (2840140800000 - 631152000000)),
);

const EDGE_DATES = [
  "2024-02-29T12:00:00", // leap day
  "2026-01-31T23:59:59", // month end
  "2026-12-31T23:59:59", // year end
  "2026-01-01T00:00:00", // year start
  "2028-02-29T00:00:00", // leap day start
  "2026-03-01T00:00:00", // day after non-leap Feb
  "2026-08-19T14:35:42", // arbitrary
  "2027-01-01T00:00:00", // ISO week 53 case
];

// Exact-elapsed units: adding then subtracting is a perfect millisecond
// inverse. Day/week/month/year arithmetic is calendar-aware (wall-clock
// preserving across DST, day-clamping on months) and so is intentionally not a
// universal ms-inverse — the same as Moment/Day.js/Luxon.
const EXACT_UNITS: TimeUnit[] = ["milliseconds", "seconds", "minutes", "hours"];

const FIXED_UNITS: TimeUnit[] = [...EXACT_UNITS, "days", "weeks"];

const BOUNDARY_UNITS: StartEndUnit[] = [
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
];

const allTimes = (): Time[] => [
  ...RANDOM_TS.map((ts) => time(ts)),
  ...EDGE_DATES.map((d) => time(d)),
];

describe("invariant: startOf ≤ date ≤ endOf", () => {
  it("holds for every unit and date", () => {
    for (const t of allTimes()) {
      for (const unit of BOUNDARY_UNITS) {
        expect(t.startOf(unit).valueOf()).toBeLessThanOrEqual(t.valueOf());
        expect(t.endOf(unit).valueOf()).toBeGreaterThanOrEqual(t.valueOf());
        // start must be strictly before end.
        expect(t.startOf(unit).valueOf()).toBeLessThan(t.endOf(unit).valueOf());
      }
    }
  });
});

describe("invariant: add then subtract restores the original (fixed units)", () => {
  it("is a perfect inverse for exact-elapsed units", () => {
    for (const t of allTimes()) {
      for (const unit of EXACT_UNITS) {
        for (const amount of [1, 7, 100, -3, 123456]) {
          const restored = t.add(amount, unit).subtract(amount, unit);
          expect(restored.valueOf()).toBe(t.valueOf());
        }
      }
    }
  });
});

describe("invariant: format → parse → format round-trips", () => {
  it("recovers the same string to the second", () => {
    const pattern = "YYYY-MM-DD HH:mm:ss";
    for (const t of allTimes()) {
      const s = t.format(pattern);
      expect(time(s, pattern).format(pattern)).toBe(s);
    }
  });
});

describe("invariant: comparison matches valueOf ordering", () => {
  it("isBefore/isAfter/isSame agree with numeric order", () => {
    const times = allTimes();
    for (let i = 0; i < times.length; i += 1) {
      const a = times[i];
      const b = times[(i * 7 + 3) % times.length];
      expect(a.isBefore(b)).toBe(a.valueOf() < b.valueOf());
      expect(a.isAfter(b)).toBe(a.valueOf() > b.valueOf());
      expect(a.isSame(b)).toBe(a.valueOf() === b.valueOf());
      expect(a.isSameOrBefore(b)).toBe(a.valueOf() <= b.valueOf());
      expect(a.isSameOrAfter(b)).toBe(a.valueOf() >= b.valueOf());
    }
  });
});

describe("invariant: diff is antisymmetric for fixed units", () => {
  it("a.diff(b) === -b.diff(a)", () => {
    const times = allTimes();
    for (let i = 0; i < times.length; i += 1) {
      const a = times[i];
      const b = times[(i * 13 + 5) % times.length];
      for (const unit of FIXED_UNITS) {
        expect(a.diff(b, unit)).toBeCloseTo(-b.diff(a, unit), 6);
      }
    }
  });
});

describe("invariant: clamp always lands within range", () => {
  it("never returns outside [min, max]", () => {
    const min = time("2026-06-01");
    const max = time("2026-09-01");
    for (const t of allTimes()) {
      const c = t.clamp(min, max);
      expect(c.valueOf()).toBeGreaterThanOrEqual(min.valueOf());
      expect(c.valueOf()).toBeLessThanOrEqual(max.valueOf());
    }
  });
});

describe("invariant: preciseDiff reconstructs the later date", () => {
  it("adding the breakdown back lands within one second", () => {
    const times = allTimes();
    for (let i = 0; i < times.length; i += 1) {
      const a = times[i];
      const b = times[(i * 5 + 2) % times.length];
      const [earlier, later] =
        a.valueOf() <= b.valueOf() ? [a, b] : [b, a];

      const d = earlier.preciseDiff(later);
      // Every component must be non-negative.
      for (const v of Object.values(d)) expect(v).toBeGreaterThanOrEqual(0);

      const rebuilt = earlier
        .add(d.years, "years")
        .add(d.months, "months")
        .add(d.days, "days")
        .add(d.hours, "hours")
        .add(d.minutes, "minutes")
        .add(d.seconds, "seconds");

      const gap = later.valueOf() - rebuilt.valueOf();
      // Only sub-second milliseconds (dropped by design) should remain.
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(1000);
    }
  });
});

describe("invariant: range is inclusive, ordered, and bounded", () => {
  it("produces correct day ranges in both directions", () => {
    const up = time("2026-08-01").range("2026-08-31", "days");
    expect(up).toHaveLength(31);
    expect(up[0].format("YYYY-MM-DD")).toBe("2026-08-01");
    expect(up[30].format("YYYY-MM-DD")).toBe("2026-08-31");

    const down = time("2026-08-31").range("2026-08-01", "days");
    expect(down).toHaveLength(31);
    expect(down[0].date()).toBe(31);

    // Single-point range (start === end).
    expect(time("2026-08-19").range("2026-08-19")).toHaveLength(1);
  });

  it("never loops forever on a zero step", () => {
    // step 0 is coerced to 1, so this must terminate.
    const r = time("2026-08-19").range("2026-08-22", "days", 0);
    expect(r.length).toBeGreaterThan(0);
  });
});

describe("safety: immutability is never violated", () => {
  it("mutating operations leave the source untouched", () => {
    const base = time("2026-08-19T14:30:00");
    const snapshot = base.valueOf();

    base.add(5, "days");
    base.subtract(2, "months");
    base.startOf("year");
    base.endOf("month");
    base.set("hour", 0);
    base.round("day");
    base.clamp("2000-01-01", "2001-01-01");
    base.range("2026-09-19");

    expect(base.valueOf()).toBe(snapshot);
  });
});
