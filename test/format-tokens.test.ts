import { describe, expect, it } from "vitest";
import { time } from "../src/index.js";

describe("format tokens", () => {
  const date = time("2026-08-09T14:05:07.042"); // Sunday

  it("formats month names", () => {
    expect(date.format("MMMM")).toBe("August");
    expect(date.format("MMM")).toBe("Aug");
    expect(date.format("M")).toBe("8");
    expect(date.format("MM")).toBe("08");
  });

  it("formats weekday names", () => {
    expect(date.format("dddd")).toBe("Sunday");
    expect(date.format("ddd")).toBe("Sun");
  });

  it("formats padded and unpadded numbers", () => {
    expect(date.format("D")).toBe("9");
    expect(date.format("DD")).toBe("09");
    expect(date.format("H")).toBe("14");
    expect(date.format("m")).toBe("5");
    expect(date.format("mm")).toBe("05");
    expect(date.format("s")).toBe("7");
    expect(date.format("ss")).toBe("07");
  });

  it("formats ordinal days", () => {
    expect(time("2026-08-01").format("Do")).toBe("1st");
    expect(time("2026-08-02").format("Do")).toBe("2nd");
    expect(time("2026-08-03").format("Do")).toBe("3rd");
    expect(time("2026-08-11").format("Do")).toBe("11th");
    expect(time("2026-08-21").format("Do")).toBe("21st");
    expect(time("2026-08-22").format("Do")).toBe("22nd");
  });

  it("formats milliseconds", () => {
    expect(date.format("SSS")).toBe("042");
  });

  it("keeps bracketed text literal", () => {
    expect(date.format("[Today is] dddd")).toBe("Today is Sunday");
    expect(date.format("[Year] YYYY")).toBe("Year 2026");
  });

  it("composes a full human-readable pattern", () => {
    expect(date.format("dddd, MMMM Do YYYY")).toBe("Sunday, August 9th 2026");
  });
});
