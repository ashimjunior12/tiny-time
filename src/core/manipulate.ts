import type { TimeUnit } from "../types.js";
import { MS } from "../constants.js";

/**
 * Adds months in place while keeping the day within the target month.
 *
 * Example:
 * 2026-01-31 + 1 month → 2026-02-28
 */
export function addMonths(date: Date, amount: number): void {
  const originalDay = date.getDate();

  // Prevent JavaScript Date from overflowing when the current day doesn't
  // exist in the target month (e.g. Jan 31 → Feb).
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);

  const lastDayOfTargetMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  date.setDate(Math.min(originalDay, lastDayOfTargetMonth));
}

/**
 * Adds years in place while correctly handling leap days.
 *
 * Example:
 * 2028-02-29 + 1 year → 2029-02-28
 */
export function addYears(date: Date, amount: number): void {
  addMonths(date, amount * 12);
}

/**
 * Applies `amount` of `unit` to `date`, mutating it in place.
 *
 * Sub-day units (ms/seconds/minutes/hours) advance by exact elapsed time, so
 * "2 hours later" is always 7,200,000 ms and the operation is perfectly
 * reversible. Day and week units move by whole calendar days (preserving the
 * wall-clock time across daylight-saving shifts — "same time tomorrow"), and
 * months/years use the overflow-safe helpers.
 */
export function applyUnit(date: Date, amount: number, unit: TimeUnit): void {
  switch (unit) {
    case "milliseconds":
    case "seconds":
    case "minutes":
    case "hours":
      date.setTime(date.getTime() + amount * MS[unit]);
      break;
    case "days":
      date.setDate(date.getDate() + amount);
      break;
    case "weeks":
      date.setDate(date.getDate() + amount * 7);
      break;
    case "months":
      addMonths(date, amount);
      break;
    case "quarters":
      addMonths(date, amount * 3);
      break;
    case "years":
      addYears(date, amount);
      break;
  }
}
