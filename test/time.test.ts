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

    expect(date1.isLeapYear()).toBe(true);
    expect(date2.isLeapYear()).toBe(false);
  });

  it("should handle proper date format", () => {
    const date = time("2026-01-02");

    expect(date.format("YYYY/MM/DD")).toBe("2026/01/02");
  });

  it("should format time in 12-hour format", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.format("hh:mm")).toBe("02:30");
  });

  it("should convert 13:00 to 01:00 pm", () => {
    const date = time("2026-08-19T13:00:00");
    expect(date.to12Hour()).toBe("01:00 PM");
  });

  it("should convert 00:00 to 12:00 am", () => {
    const date = time("2026-08-19T00:00:00");
    expect(date.to12Hour()).toBe("12:00 AM");
  });

  it("should add seconds", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.add(30, "seconds").format("HH:mm:ss")).toBe("14:30:30");
  });

  it("should add minutes", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.add(30, "minutes").format("HH:mm:ss")).toBe("15:00:00");
  });

  it("should add hours", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.add(2, "hours").format("HH:mm:ss")).toBe("16:30:00");
  });

  it("should accept a Date object", () => {
    const input = new Date(2026, 7, 19, 14, 30, 0);

    const date = time(input);

    expect(date.format("YYYY-MM-DD HH:mm:ss")).toBe("2026-08-19 14:30:00");
  });

  it("should accept a date string", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.format("YYYY-MM-DD HH:mm:ss")).toBe("2026-08-19 14:30:00");
  });

  it("should reject an invalid date", () => {
    expect(() => time("invalid-date")).toThrow("Invalid date");
  });

  it("should create the current date when no value is provided", () => {
    const date = time();

    expect(date).toBeDefined();
  });

  it("should clone the provided Date object", () => {
    const input = new Date(2026, 7, 19, 14, 30, 0);

    const date = time(input);

    input.setFullYear(2030);

    expect(date.format("YYYY-MM-DD")).toBe("2026-08-19");
  });

  it("should determine whether a date is before another date", () => {
    const date = time("2026-08-19T14:30:00");
    const other = time("2026-08-20T14:30:00");

    expect(date.isBefore(other)).toBe(true);
  });

  it("should determine whether a date is after another date", () => {
    const date = time("2026-08-20T14:30:00");
    const other = time("2026-08-19T14:30:00");

    expect(date.isAfter(other)).toBe(true);
  });

  it("should determine whether two dates are the same", () => {
    const date = time("2026-08-19T14:30:00");
    const other = time("2026-08-19T14:30:00");

    expect(date.isSame(other)).toBe(true);
  });

  it("should compare against a date string", () => {
    const date = time("2026-08-19T14:30:00");

    expect(date.isBefore("2026-08-20T14:30:00")).toBe(true);
  });

  it("should get the start of a day", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.startOf("day").format()).toBe("2026-08-19 00:00:00");
  });

  it("should get the start of a month", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.startOf("month").format()).toBe("2026-08-01 00:00:00");
  });

  it("should get the start of a year", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.startOf("year").format()).toBe("2026-01-01 00:00:00");
  });

  it("should get the end of a day", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.endOf("day").format()).toBe("2026-08-19 23:59:59");
  });

  it("should get the end of a month", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.endOf("month").format()).toBe("2026-08-31 23:59:59");
  });

  it("should get the end of a year", () => {
    const date = time("2026-08-19T14:35:42");

    expect(date.endOf("year").format()).toBe("2026-12-31 23:59:59");
  });

  it("should handle the end of February in a leap year", () => {
    const date = time("2028-02-15T14:35:42");

    expect(date.endOf("month").format()).toBe("2028-02-29 23:59:59");
  });
});
