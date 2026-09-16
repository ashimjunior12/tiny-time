import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("extended manipulation", () => {
  const date = time("2026-08-19T14:30:00");

  it("adds and subtracts weeks", () => {
    expect(date.add(1, "weeks").format("YYYY-MM-DD")).toBe("2026-08-26");
    expect(date.subtract(2, "weeks").format("YYYY-MM-DD")).toBe("2026-08-05");
  });

  it("adds and subtracts milliseconds", () => {
    expect(date.add(500, "milliseconds").format("ss.SSS")).toBe("00.500");
  });
});

describe("week boundaries", () => {
  // 2026-08-19 is a Wednesday; the surrounding week runs Sun 16 → Sat 22.
  const date = time("2026-08-19T14:35:42");

  it("snaps to the start of the week (Sunday)", () => {
    expect(date.startOf("week").format()).toBe("2026-08-16 00:00:00");
  });

  it("snaps to the end of the week (Saturday)", () => {
    expect(date.endOf("week").format()).toBe("2026-08-22 23:59:59");
  });
});

describe("extended diff", () => {
  it("computes whole months", () => {
    const start = time("2026-01-15");
    const end = time("2026-03-15");

    expect(end.diff(start, "months")).toBe(2);
    expect(start.diff(end, "months")).toBe(-2);
  });

  it("computes whole years", () => {
    const start = time("2020-06-01");
    const end = time("2026-06-01");

    expect(end.diff(start, "years")).toBe(6);
  });

  it("computes weeks and milliseconds", () => {
    const start = time("2026-08-01T00:00:00");
    const end = time("2026-08-15T00:00:00");

    expect(end.diff(start, "weeks")).toBe(2);
    expect(end.diff(start, "milliseconds")).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("truncates partial months toward zero", () => {
    const start = time("2026-01-15");
    const end = time("2026-03-14"); // just under two months

    expect(end.diff(start, "months")).toBe(1);
  });
});
