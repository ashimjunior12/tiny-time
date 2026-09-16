import { describe, expect, it } from "vitest";
import { time, Time } from "../src/index.js";

describe("custom-format parsing", () => {
  it("parses day-first and custom layouts", () => {
    expect(time("19/08/2026", "DD/MM/YYYY").format("YYYY-MM-DD")).toBe(
      "2026-08-19",
    );
    expect(
      time("2026-08-19 14:30", "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss"),
    ).toBe("2026-08-19 14:30:00");
  });

  it("parses month names and 12-hour + meridiem", () => {
    expect(time("August 9, 2026", "MMMM D, YYYY").format("YYYY-MM-DD")).toBe(
      "2026-08-09",
    );
    expect(time("02:05 PM", "hh:mm A").format("HH:mm")).toBe("14:05");
    expect(time("12:00 AM", "hh:mm A").format("HH:mm")).toBe("00:00");
    expect(time("12:00 PM", "hh:mm A").format("HH:mm")).toBe("12:00");
  });

  it("honors bracketed literals and defaults", () => {
    expect(time("Year 2026", "[Year] YYYY").format("YYYY")).toBe("2026");
  });

  it("throws when the input does not match", () => {
    expect(() => time("nope", "YYYY-MM-DD")).toThrow();
  });

  it("is also available as Time.fromFormat", () => {
    expect(Time.fromFormat("19-08-2026", "DD-MM-YYYY").format("YYYY-MM-DD")).toBe(
      "2026-08-19",
    );
  });
});

describe("static helpers", () => {
  it("creates from unix seconds", () => {
    expect(Time.unix(1_000_000_000).unix()).toBe(1_000_000_000);
  });

  it("is a type guard with isTime", () => {
    expect(Time.isTime(time())).toBe(true);
    expect(Time.isTime(new Date())).toBe(false);
    expect(Time.isTime("2026-08-19")).toBe(false);
  });
});

describe("generic get & isoWeekday", () => {
  const d = time("2026-08-19T14:30:45"); // Wednesday

  it("reads components generically", () => {
    expect(d.get("year")).toBe(2026);
    expect(d.get("month")).toBe(8);
    expect(d.get("date")).toBe(19);
    expect(d.get("quarter")).toBe(3);
    expect(d.get("week")).toBe(34);
  });

  it("returns ISO weekday (Mon=1..Sun=7)", () => {
    expect(time("2026-08-19").isoWeekday()).toBe(3); // Wednesday
    expect(time("2026-08-23").isoWeekday()).toBe(7); // Sunday
    expect(time("2026-08-24").isoWeekday()).toBe(1); // Monday
  });
});

describe("to / toNow", () => {
  it("is the inverse of from", () => {
    const base = time("2026-08-19T12:00:00");
    const later = time("2026-08-19T14:00:00");

    expect(base.to(later)).toBe("in 2 hours");
    expect(later.to(base)).toBe("2 hours ago");
  });
});

describe("range", () => {
  it("builds an inclusive ascending range", () => {
    const days = time("2026-08-19").range("2026-08-22", "days");
    expect(days.map((d) => d.format("YYYY-MM-DD"))).toEqual([
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
    ]);
  });

  it("supports a custom step and descending direction", () => {
    const every2 = time("2026-08-19").range("2026-08-25", "days", 2);
    expect(every2).toHaveLength(4); // 19, 21, 23, 25

    const down = time("2026-08-22").range("2026-08-20", "days");
    expect(down.map((d) => d.date())).toEqual([22, 21, 20]);
  });

  it("works across months", () => {
    const months = time("2026-01-15").range("2026-04-15", "months");
    expect(months).toHaveLength(4);
  });
});

describe("clamp", () => {
  const lo = "2026-08-10";
  const hi = "2026-08-20";

  it("constrains to the range", () => {
    expect(time("2026-08-05").clamp(lo, hi).format("YYYY-MM-DD")).toBe(
      "2026-08-10",
    );
    expect(time("2026-08-25").clamp(lo, hi).format("YYYY-MM-DD")).toBe(
      "2026-08-20",
    );
    expect(time("2026-08-15").clamp(lo, hi).format("YYYY-MM-DD")).toBe(
      "2026-08-15",
    );
  });
});

describe("round", () => {
  it("rounds to the nearest unit", () => {
    expect(time("2026-08-19T14:39:00").round("hour").format("HH:mm")).toBe(
      "15:00",
    );
    expect(time("2026-08-19T14:20:00").round("hour").format("HH:mm")).toBe(
      "14:00",
    );
    expect(time("2026-08-19T14:30:00").round("hour").format("HH:mm")).toBe(
      "15:00",
    ); // tie rounds up
    expect(time("2026-08-19T20:00:00").round("day").format("YYYY-MM-DD")).toBe(
      "2026-08-20",
    );
  });
});

describe("preciseDiff", () => {
  it("breaks a span into calendar components", () => {
    const a = time("2024-01-15T10:00:00");
    const b = time("2026-03-20T13:30:45");

    expect(a.preciseDiff(b)).toEqual({
      years: 2,
      months: 2,
      days: 5,
      hours: 3,
      minutes: 30,
      seconds: 45,
    });
  });

  it("is order-independent (magnitude)", () => {
    const a = time("2026-01-31");
    const b = time("2026-03-01");
    expect(a.preciseDiff(b)).toEqual(b.preciseDiff(a));
  });

  it("borrows real month lengths", () => {
    // Jan 31 → Mar 1: borrowing February (2026 not a leap year → 28 days).
    expect(time("2026-01-31").preciseDiff("2026-03-01")).toEqual({
      years: 0,
      months: 1,
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("new format tokens", () => {
  const d = time("2026-08-09T14:05:07"); // Sunday

  it("formats dd, k/kk, X/x", () => {
    expect(d.format("dd")).toBe("Su");
    expect(time("2026-08-19T00:30:00").format("k")).toBe("24");
    expect(time("2026-08-19T00:30:00").format("kk")).toBe("24");
    expect(d.format("x")).toBe(String(d.valueOf()));
    expect(d.format("X")).toBe(String(Math.floor(d.valueOf() / 1000)));
  });

  it("formats localized presets", () => {
    expect(d.format("L")).toBe("08/09/2026");
    expect(d.format("LL")).toBe("August 9, 2026");
    expect(d.format("LT")).toBe("2:05 PM");
    expect(d.format("LTS")).toBe("2:05:07 PM");
    expect(d.format("LLLL")).toBe("Sunday, August 9, 2026 2:05 PM");
  });
});
