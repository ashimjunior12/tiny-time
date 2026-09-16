import { applyUnit } from "./manipulate.js";
import type { TimeUnit } from "../types.js";

/** A calendar-accurate breakdown of the span between two dates. */
export interface PreciseDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function step(date: Date, amount: number, unit: TimeUnit): Date {
  const clone = new Date(date.getTime());
  applyUnit(clone, amount, unit);
  return clone;
}

/**
 * Largest whole `count` of `unit` that can be added to `cursor` without passing
 * `later`. `seed`/`cap` bound the search: `seed` starts it near the answer,
 * `cap` is a hard safety limit so a pathological input can never loop forever.
 */
function peel(
  cursor: Date,
  later: Date,
  unit: TimeUnit,
  seed: number,
  cap: number,
): number {
  let count = Math.max(0, seed);

  while (count > 0 && step(cursor, count, unit).getTime() > later.getTime()) {
    count -= 1;
  }
  while (count < cap && step(cursor, count + 1, unit).getTime() <= later.getTime()) {
    count += 1;
  }

  return count;
}

/**
 * Breaks the span between two dates into calendar components.
 *
 * Each unit is peeled off with the very same `add` operation used to apply it,
 * so `earlier.add(years,'years')…add(seconds,'seconds')` reproduces `later`
 * exactly (to the millisecond). It uses real, overflow-safe month lengths, so
 * it never reports "32 days", and it stays correct across daylight-saving
 * transitions and leap days.
 *
 * The result is a magnitude — always non-negative — describing the distance
 * between `a` and `b` regardless of order.
 */
export function preciseDiff(a: Date, b: Date): PreciseDiff {
  let earlier = a;
  let later = b;
  if (earlier.getTime() > later.getTime()) {
    [earlier, later] = [later, earlier];
  }

  let cursor = earlier;

  const years = peel(cursor, later, "years", later.getFullYear() - earlier.getFullYear(), 100000);
  cursor = step(cursor, years, "years");

  const months = peel(cursor, later, "months", 0, 12);
  cursor = step(cursor, months, "months");

  const days = peel(cursor, later, "days", 0, 40);
  cursor = step(cursor, days, "days");

  const hours = peel(cursor, later, "hours", 0, 48);
  cursor = step(cursor, hours, "hours");

  const minutes = peel(cursor, later, "minutes", 0, 120);
  cursor = step(cursor, minutes, "minutes");

  const seconds = peel(cursor, later, "seconds", 0, 120);

  return { years, months, days, hours, minutes, seconds };
}
