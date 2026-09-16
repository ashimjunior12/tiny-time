import type { StartEndUnit } from "../types.js";

/**
 * Returns a new `Date` snapped to the start of the given unit.
 * Weeks start on Sunday, matching `Date.prototype.getDay()`.
 */
export function startOf(date: Date, unit: StartEndUnit): Date {
  const result = new Date(date.getTime());

  switch (unit) {
    case "second":
      result.setMilliseconds(0);
      break;
    case "minute":
      result.setSeconds(0, 0);
      break;
    case "hour":
      result.setMinutes(0, 0, 0);
      break;
    case "day":
      result.setHours(0, 0, 0, 0);
      break;
    case "week":
      result.setDate(result.getDate() - result.getDay());
      result.setHours(0, 0, 0, 0);
      break;
    case "month":
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case "quarter":
      result.setMonth(Math.floor(result.getMonth() / 3) * 3, 1);
      result.setHours(0, 0, 0, 0);
      break;
    case "year":
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }

  return result;
}

/**
 * Returns a new `Date` snapped to the last representable instant of the given
 * unit (the `.999` millisecond). Handles month lengths and leap years.
 */
export function endOf(date: Date, unit: StartEndUnit): Date {
  const result = new Date(date.getTime());

  switch (unit) {
    case "second":
      result.setMilliseconds(999);
      break;
    case "minute":
      result.setSeconds(59, 999);
      break;
    case "hour":
      result.setMinutes(59, 59, 999);
      break;
    case "day":
      result.setHours(23, 59, 59, 999);
      break;
    case "week":
      result.setDate(result.getDate() - result.getDay() + 6);
      result.setHours(23, 59, 59, 999);
      break;
    case "month":
      // Day 0 of the next month is the last day of this one.
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case "quarter":
      // Last day of the quarter's final month.
      result.setMonth(Math.floor(result.getMonth() / 3) * 3 + 3, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case "year":
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }

  return result;
}
