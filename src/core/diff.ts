import type { DiffUnit } from "../types.js";
import { MS } from "../constants.js";
import { addMonths } from "./manipulate.js";

/** Rounds toward zero, treating `-0` as `0`. */
function truncate(value: number): number {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function addMonthsClone(date: Date, amount: number): Date {
  const clone = new Date(date.getTime());
  addMonths(clone, amount);
  return clone;
}

/**
 * Signed fractional month difference (`a - b`), calendar-aware.
 *
 * Anchors `a` onto the whole-month boundary nearest `b`, then interpolates the
 * remainder against the surrounding month so partial months are proportional to
 * the actual length of that month.
 */
function monthDiff(a: Date, b: Date): number {
  if (a.getDate() < b.getDate()) {
    return -monthDiff(b, a);
  }

  const wholeMonths =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

  const anchor = addMonthsClone(a, wholeMonths);
  const overshoot = b.getTime() - anchor.getTime() < 0;
  const neighbor = addMonthsClone(a, wholeMonths + (overshoot ? -1 : 1));

  const span = overshoot
    ? anchor.getTime() - neighbor.getTime()
    : neighbor.getTime() - anchor.getTime();

  return -(wholeMonths + (b.getTime() - anchor.getTime()) / span);
}

/**
 * Difference between two dates (`a - b`) expressed in `unit`.
 *
 * Fixed-length units return a floating-point value (e.g. 0.5 hours). Months and
 * years return the whole count, truncated toward zero, matching how humans
 * count calendar months.
 */
export function diff(a: Date, b: Date, unit: DiffUnit): number {
  if (unit === "months") {
    return truncate(monthDiff(a, b));
  }

  if (unit === "quarters") {
    return truncate(monthDiff(a, b) / 3);
  }

  if (unit === "years") {
    return truncate(monthDiff(a, b) / 12);
  }

  return (a.getTime() - b.getTime()) / MS[unit];
}
