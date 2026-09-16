import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("comparison", () => {
  const date = time("2026-08-19T14:30:00");

  it("supports isSameOrBefore / isSameOrAfter", () => {
    expect(date.isSameOrBefore("2026-08-19T14:30:00")).toBe(true);
    expect(date.isSameOrBefore("2026-08-20T00:00:00")).toBe(true);
    expect(date.isSameOrAfter("2026-08-19T14:30:00")).toBe(true);
    expect(date.isSameOrAfter("2026-08-19T00:00:00")).toBe(true);
  });

  it("compares at a chosen granularity with isSame", () => {
    expect(date.isSame("2026-08-19T09:00:00", "day")).toBe(true);
    expect(date.isSame("2026-08-20T14:30:00", "day")).toBe(false);
    expect(date.isSame("2026-08-01T00:00:00", "month")).toBe(true);
    expect(date.isSame("2026-01-01T00:00:00", "year")).toBe(true);
    expect(date.isSame("2026-08-19T14:30:01")).toBe(false);
  });

  it("checks whether a date is between two others", () => {
    const start = "2026-08-19T10:00:00";
    const end = "2026-08-19T18:00:00";

    expect(date.isBetween(start, end)).toBe(true);
    expect(date.isBetween("2026-08-19T15:00:00", end)).toBe(false);
  });

  it("respects inclusivity in isBetween", () => {
    const edge = time("2026-08-19T10:00:00");
    const start = "2026-08-19T10:00:00";
    const end = "2026-08-19T18:00:00";

    expect(edge.isBetween(start, end)).toBe(false); // "()" exclusive
    expect(edge.isBetween(start, end, "[)")).toBe(true);
    expect(edge.isBetween(start, end, "[]")).toBe(true);
  });
});

describe("calendar queries", () => {
  it("detects today, tomorrow, and yesterday", () => {
    expect(time().isToday()).toBe(true);
    expect(time().add(1, "days").isTomorrow()).toBe(true);
    expect(time().subtract(1, "days").isYesterday()).toBe(true);
    expect(time().add(2, "days").isToday()).toBe(false);
  });

  it("detects weekends and weekdays", () => {
    // 2026-08-22 is a Saturday, 2026-08-23 a Sunday, 2026-08-19 a Wednesday.
    expect(time("2026-08-22").isWeekend()).toBe(true);
    expect(time("2026-08-23").isWeekend()).toBe(true);
    expect(time("2026-08-19").isWeekend()).toBe(false);
    expect(time("2026-08-19").isWeekday()).toBe(true);
  });
});

describe("set", () => {
  const date = time("2026-08-19T14:30:45.500");

  it("overwrites individual components immutably", () => {
    expect(date.set("year", 2030).format()).toBe("2030-08-19 14:30:45");
    expect(date.set("month", 1).format()).toBe("2026-01-19 14:30:45");
    expect(date.set("date", 1).format()).toBe("2026-08-01 14:30:45");
    expect(date.set("hour", 0).format()).toBe("2026-08-19 00:30:45");
    // Original is untouched.
    expect(date.format()).toBe("2026-08-19 14:30:45");
  });
});
