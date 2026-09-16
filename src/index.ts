import { Time } from "./Time.js";
import type { TimeInput } from "./types.js";

export { Time };
export type {
  TimeUnit,
  StartEndUnit,
  DiffUnit,
  SetUnit,
  GetUnit,
  TimeInput,
  TimeObject,
} from "./types.js";
export type { PreciseDiff } from "./core/preciseDiff.js";

/**
 * Creates a `Time` instance from a `Date`, timestamp, ISO string, another
 * `Time`, or nothing at all (the current date and time).
 *
 * Pass a `format` string to parse a custom layout, e.g.
 * `time("19/08/2026", "DD/MM/YYYY")`.
 */
export function time(value?: TimeInput, format?: string): Time {
  return new Time(value, format);
}

export default time;
