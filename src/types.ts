import type { Time } from "./Time.js";

/** Units that can be added to or subtracted from a `Time` instance. */
export type TimeUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "quarters"
  | "years";

/** Units accepted by `startOf` and `endOf`. */
export type StartEndUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

/** Units accepted by `diff`. */
export type DiffUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "quarters"
  | "years";

/** Components that can be overwritten with `set`. Month is 1-12. */
export type SetUnit =
  | "year"
  | "month"
  | "date"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

/** Units accepted by the generic `get` getter. Month is 1-12. */
export type GetUnit =
  | SetUnit
  | "day"
  | "dayOfYear"
  | "quarter"
  | "week"
  | "isoWeekday";

/** Plain-object representation returned by `toObject`. Month is 1-12. */
export interface TimeObject {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/**
 * Anything that can be turned into a `Time` instance: another `Time`, a native
 * `Date`, a millisecond timestamp, or a parseable date string.
 */
export type TimeInput = Time | Date | string | number;
