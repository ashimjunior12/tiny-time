import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("getters", () => {
  const date = time("2026-08-19T14:35:42.123");

  it("returns the year", () => {
    expect(date.year()).toBe(2026);
  });

  it("returns the month as 1-12", () => {
    expect(date.month()).toBe(8);
    expect(time("2026-01-15").month()).toBe(1);
    expect(time("2026-12-15").month()).toBe(12);
  });

  it("returns the day of the month", () => {
    expect(date.date()).toBe(19);
  });

  it("returns the day of the week (0 = Sunday)", () => {
    // 2026-08-19 is a Wednesday.
    expect(date.day()).toBe(3);
  });

  it("returns clock components", () => {
    expect(date.hour()).toBe(14);
    expect(date.minute()).toBe(35);
    expect(date.second()).toBe(42);
    expect(date.millisecond()).toBe(123);
  });

  it("returns the day of the year", () => {
    expect(time("2026-01-01").dayOfYear()).toBe(1);
    expect(time("2026-12-31").dayOfYear()).toBe(365);
    expect(time("2028-12-31").dayOfYear()).toBe(366);
  });

  it("returns the number of days in the month", () => {
    expect(time("2026-02-10").daysInMonth()).toBe(28);
    expect(time("2028-02-10").daysInMonth()).toBe(29);
    expect(time("2026-04-10").daysInMonth()).toBe(30);
    expect(time("2026-08-10").daysInMonth()).toBe(31);
  });
});
