import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("relative time", () => {
  it("describes the past with an 'ago' suffix", () => {
    const now = time();

    expect(now.subtract(5, "seconds").fromNow()).toBe("a few seconds ago");
    expect(now.subtract(5, "minutes").fromNow()).toBe("5 minutes ago");
    expect(now.subtract(2, "hours").fromNow()).toBe("2 hours ago");
    expect(now.subtract(3, "days").fromNow()).toBe("3 days ago");
  });

  it("describes the future with an 'in' prefix", () => {
    const now = time();

    expect(now.add(5, "minutes").fromNow()).toBe("in 5 minutes");
    expect(now.add(2, "hours").fromNow()).toBe("in 2 hours");
    expect(now.add(3, "days").fromNow()).toBe("in 3 days");
  });

  it("uses singular phrases near the boundary", () => {
    const now = time();

    expect(now.subtract(1, "minutes").fromNow()).toBe("a minute ago");
    expect(now.subtract(1, "hours").fromNow()).toBe("an hour ago");
    expect(now.subtract(1, "days").fromNow()).toBe("a day ago");
  });

  it("omits the suffix when asked", () => {
    const now = time();
    expect(now.subtract(5, "minutes").fromNow(true)).toBe("5 minutes");
  });

  it("computes distance from an explicit base with from()", () => {
    const base = time("2026-08-19T12:00:00");
    const earlier = time("2026-08-19T10:00:00");
    const later = time("2026-08-19T14:00:00");

    expect(earlier.from(base)).toBe("2 hours ago");
    expect(later.from(base)).toBe("in 2 hours");
  });
});
