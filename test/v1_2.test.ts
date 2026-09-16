import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("quarter & week", () => {
  it("returns the quarter (1-4)", () => {
    expect(time("2026-01-15").quarter()).toBe(1);
    expect(time("2026-04-15").quarter()).toBe(2);
    expect(time("2026-08-15").quarter()).toBe(3);
    expect(time("2026-11-15").quarter()).toBe(4);
  });

  it("returns the ISO week number", () => {
    // 2026-01-01 is a Thursday → ISO week 1.
    expect(time("2026-01-01").week()).toBe(1);
    expect(time("2026-08-19").week()).toBe(34);
    // 2027-01-01 is a Friday → belongs to week 53 of 2026.
    expect(time("2027-01-01").week()).toBe(53);
  });

  it("supports quarter in add/subtract/diff", () => {
    expect(time("2026-01-15").add(1, "quarters").format("YYYY-MM-DD")).toBe(
      "2026-04-15",
    );
    expect(time("2026-07-15").diff("2026-01-15", "quarters")).toBe(2);
  });

  it("supports quarter boundaries", () => {
    const d = time("2026-08-19T14:35:42");
    expect(d.startOf("quarter").format()).toBe("2026-07-01 00:00:00");
    expect(d.endOf("quarter").format()).toBe("2026-09-30 23:59:59");
  });
});

describe("name getters", () => {
  const d = time("2026-08-19T14:30:00"); // Wednesday, August

  it("returns month and day names", () => {
    expect(d.monthName()).toBe("August");
    expect(d.monthName(true)).toBe("Aug");
    expect(d.dayName()).toBe("Wednesday");
    expect(d.dayName(true)).toBe("Wed");
  });
});

describe("calendar-related getters", () => {
  it("returns days in the year", () => {
    expect(time("2026-05-01").daysInYear()).toBe(365);
    expect(time("2028-05-01").daysInYear()).toBe(366);
  });

  it("returns a UTC offset in minutes", () => {
    expect(typeof time().utcOffset()).toBe("number");
  });
});

describe("toObject / toArray", () => {
  const d = time("2026-08-19T14:30:45.123");

  it("returns a component object with 1-12 month", () => {
    expect(d.toObject()).toEqual({
      year: 2026,
      month: 8,
      date: 19,
      hour: 14,
      minute: 30,
      second: 45,
      millisecond: 123,
    });
  });

  it("returns a component array", () => {
    expect(d.toArray()).toEqual([2026, 8, 19, 14, 30, 45, 123]);
  });
});

describe("isPast / isFuture", () => {
  it("detects past and future", () => {
    expect(time().subtract(1, "hours").isPast()).toBe(true);
    expect(time().add(1, "hours").isFuture()).toBe(true);
    expect(time().add(1, "hours").isPast()).toBe(false);
  });
});

describe("calendar()", () => {
  it("describes days relative to a reference", () => {
    const ref = time("2026-08-19T12:00:00");

    expect(time("2026-08-19T14:30:00").calendar(ref)).toBe("Today at 2:30 PM");
    expect(time("2026-08-20T09:00:00").calendar(ref)).toBe(
      "Tomorrow at 9:00 AM",
    );
    expect(time("2026-08-18T09:00:00").calendar(ref)).toBe(
      "Yesterday at 9:00 AM",
    );
    // Six days ahead → weekday name (2026-08-24 is a Monday).
    expect(time("2026-08-24T10:00:00").calendar(ref)).toBe("Monday at 10:00 AM");
    // Far away → numeric date.
    expect(time("2026-12-25T10:00:00").calendar(ref)).toBe("12/25/2026");
  });
});

describe("quarter & week format tokens", () => {
  it("formats Q, w, ww", () => {
    const d = time("2026-08-19");
    expect(d.format("[Q]Q")).toBe("Q3");
    expect(d.format("w")).toBe("34");
    expect(d.format("ww")).toBe("34");
    expect(time("2026-01-01").format("ww")).toBe("01");
  });
});
