import { describe, expect, it } from "vitest";
import { time, Time } from "../src/index.js";

describe("conversion & serialization", () => {
  it("clones an instance without sharing state", () => {
    const original = time("2026-08-19T14:30:00");
    const copy = original.clone();

    expect(copy.format()).toBe(original.format());
    expect(copy).not.toBe(original);
  });

  it("returns a detached native Date", () => {
    const t = time("2026-08-19T14:30:00");
    const d = t.toDate();

    d.setFullYear(2030);

    expect(t.year()).toBe(2026);
  });

  it("exposes the timestamp via valueOf", () => {
    const t = time("2026-08-19T14:30:00");
    expect(t.valueOf()).toBe(t.toDate().getTime());
  });

  it("supports numeric comparison operators via valueOf", () => {
    const earlier = time("2026-08-19T10:00:00");
    const later = time("2026-08-19T12:00:00");

    expect(earlier < later).toBe(true);
    expect(Number(earlier)).toBe(earlier.valueOf());
  });

  it("returns unix seconds", () => {
    const t = time(1_000_000_000_000);
    expect(t.unix()).toBe(1_000_000_000);
  });

  it("serializes through JSON.stringify", () => {
    const t = time("2026-08-19T14:30:00Z");
    expect(JSON.stringify({ at: t })).toBe(
      `{"at":"2026-08-19T14:30:00.000Z"}`,
    );
  });

  it("stringifies with the default format", () => {
    const t = time("2026-08-19T14:30:00");
    expect(`${t}`).toBe("2026-08-19 14:30:00");
  });
});

describe("static helpers", () => {
  it("creates the current time with Time.now()", () => {
    expect(Time.now()).toBeInstanceOf(Time);
  });

  it("validates input without throwing", () => {
    expect(Time.isValid("2026-08-19")).toBe(true);
    expect(Time.isValid("not-a-date")).toBe(false);
    expect(Time.isValid(new Date())).toBe(true);
  });

  it("finds the earliest and latest of several inputs", () => {
    const a = "2026-08-19T10:00:00";
    const b = "2026-08-19T12:00:00";
    const c = "2026-08-19T08:00:00";

    expect(Time.min(a, b, c).format()).toBe("2026-08-19 08:00:00");
    expect(Time.max(a, b, c).format()).toBe("2026-08-19 12:00:00");
  });

  it("accepts a millisecond timestamp", () => {
    const ms = new Date("2026-08-19T14:30:00").getTime();
    expect(time(ms).format()).toBe("2026-08-19 14:30:00");
  });

  it("accepts another Time instance", () => {
    const t = time("2026-08-19T14:30:00");
    expect(time(t).format()).toBe("2026-08-19 14:30:00");
  });
});
