import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("Time", () => {
  it("should create a time", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.format()).toBe("2026-08-19 14:30:00");
  });

  it("should add days", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.add(2, "days").format()).toBe("2026-08-21 14:30:00");
  });

  it("should subtract days", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.subtract(2, "days").format()).toBe("2026-08-17 14:30:00");
  });

  it("should not mutate the original date", () => {
    const date = time("2026-08-19T14:30:00");

    const future = date.add(2, "days");

    expect(date.format()).toBe("2026-08-19 14:30:00");

    expect(future.format()).toBe("2026-08-21 14:30:00");
  });

  it("should handle adding one month to the end of a month", () => {
    const date = time("2026-01-31");

    expect(date.add(1, "months").format("YYYY-MM-DD")).toBe("2026-02-28");
  });

  it("should handle February in a leap year", () => {
    const date = time("2028-01-31");

    expect(date.add(1, "months").format("YYYY-MM-DD")).toBe("2028-02-29");
  });

  it("should handle subtracting a month", () => {
    const date = time("2026-03-31");

    expect(date.subtract(1, "months").format("YYYY-MM-DD")).toBe("2026-02-28");
  });

  it("should add only one year to February 29th in a leap year", () => {
    const date = time("2024-02-29");

    expect(date.add(1, "years").format("YYYY-MM-DD")).toBe("2025-02-28");
  });

  it("should handle leap day when subtracting a year", () => {
    const date = time("2028-02-29");

    expect(date.subtract(1, "years").format("YYYY-MM-DD")).toBe("2027-02-28");
  });

  it("should handle whether a year is a leap year", () => {
    const date1 = time("2028-01-01");
    const date2 = time("2025-01-01");

    expect(date1.isLeapYear(date1.format())).toBe(true);
    expect(date2.isLeapYear(date2.format())).toBe(false);
  });
});
