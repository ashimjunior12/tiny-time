import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("timezone-safe parsing (regression)", () => {
  it("reads a date-only ISO string as a local calendar day", () => {
    // Previously native Date read this as UTC midnight, shifting the day in
    // negative-offset zones. It must be the 1st everywhere now.
    const d = time("2026-08-01");
    expect(d.date()).toBe(1);
    expect(d.month()).toBe(8);
    expect(d.format("YYYY-MM-DD")).toBe("2026-08-01");
    expect(d.valueOf()).toBe(new Date(2026, 7, 1).getTime());
  });

  it("reads a tz-less date-time as local", () => {
    expect(time("2026-08-19T14:30:00").valueOf()).toBe(
      new Date(2026, 7, 19, 14, 30, 0).getTime(),
    );
  });

  it("respects an explicit Z / UTC designator", () => {
    expect(time("2026-08-01T00:00:00Z").valueOf()).toBe(
      Date.parse("2026-08-01T00:00:00Z"),
    );
  });

  it("respects an explicit numeric offset", () => {
    expect(time("2026-08-01T00:00:00+05:45").valueOf()).toBe(
      Date.parse("2026-08-01T00:00:00+05:45"),
    );
  });

  it("parses fractional seconds", () => {
    expect(time("2026-08-19T14:30:00.5").millisecond()).toBe(500);
    expect(time("2026-08-19T14:30:00.042").millisecond()).toBe(42);
  });

  it("round-trips through toISOString", () => {
    const t = time("2026-08-19T14:30:00");
    expect(time(t.toISOString()).valueOf()).toBe(t.valueOf());
  });
});

describe("exact-elapsed time arithmetic (regression)", () => {
  it("treats hours/minutes/seconds as exact durations", () => {
    const t = time("2026-08-19T14:30:00");
    expect(t.add(2, "hours").diff(t, "hours")).toBe(2);
    expect(t.add(90, "minutes").diff(t, "minutes")).toBe(90);
    expect(t.add(3600, "seconds").valueOf() - t.valueOf()).toBe(3_600_000);
  });
});

describe("parseFormat safety", () => {
  it("throws (does not hang or misparse) on non-matching input", () => {
    expect(() => time("hello world", "YYYY-MM-DD")).toThrow();
    expect(() => time("2026/08/19", "YYYY-MM-DD")).toThrow();
  });

  it("treats regex metacharacters in the format as literals", () => {
    // Dots, plus, parens etc. must match literally, not as regex operators.
    expect(time("2026.08.19", "YYYY.MM.DD").format("YYYY-MM-DD")).toBe(
      "2026-08-19",
    );
    expect(time("(2026)", "[(]YYYY[)]").format("YYYY")).toBe("2026");
    // A literal dot must not act as "any char".
    expect(() => time("2026X08X19", "YYYY.MM.DD")).toThrow();
  });

  it("is not vulnerable to catastrophic backtracking (ReDoS)", () => {
    // A long adversarial input against a greedy month-name token must fail
    // fast, not hang. Guard well under any CI timeout.
    const evil = "a".repeat(100_000) + "!";
    const started = Date.now();
    expect(() => time(evil, "MMMM")).toThrow();
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

describe("invalid input handling", () => {
  it("throws a clear error for unparseable dates", () => {
    expect(() => time("not-a-date")).toThrow("Invalid date");
    expect(() => time("2026-13-99")).toThrow();
  });

  it("does not throw for valid edge inputs", () => {
    expect(() => time(0)).not.toThrow(); // epoch
    expect(() => time(new Date())).not.toThrow();
    expect(() => time()).not.toThrow();
  });
});
