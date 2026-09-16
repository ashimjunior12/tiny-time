import type {
  TimeUnit,
  StartEndUnit,
  DiffUnit,
  SetUnit,
  GetUnit,
  TimeInput,
  TimeObject,
} from "./types.js";
import {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  DAY_NAMES,
  DAY_NAMES_SHORT,
} from "./constants.js";
import { parse } from "./core/parse.js";
import { formatDate } from "./core/format.js";
import { applyUnit } from "./core/manipulate.js";
import { startOf, endOf } from "./core/boundary.js";
import { diff } from "./core/diff.js";
import { relativeTime } from "./core/relative.js";
import { isoWeek, quarterOf } from "./core/week.js";
import { calendar } from "./core/calendar.js";
import { parseFormat } from "./core/parseFormat.js";
import { preciseDiff, type PreciseDiff } from "./core/preciseDiff.js";

/** Maps a `startOf`/`endOf` unit to the plural unit used by `add`. */
const STEP_UNIT: Record<StartEndUnit, TimeUnit> = {
  second: "seconds",
  minute: "minutes",
  hour: "hours",
  day: "days",
  week: "weeks",
  month: "months",
  quarter: "quarters",
  year: "years",
};

/**
 * An immutable wrapper around the native `Date`.
 *
 * Every method that would change the value returns a brand new `Time`; the
 * original is never mutated.
 */
export class Time {
  private readonly instant: Date;

  constructor(value?: TimeInput, format?: string) {
    if (typeof value === "string" && format !== undefined) {
      this.instant = parseFormat(value, format);
    } else {
      this.instant = Time.toDateValue(value);
    }

    if (Number.isNaN(this.instant.getTime())) {
      throw new Error("Invalid date");
    }
  }

  /** Normalizes any accepted input (including another `Time`) into a `Date`. */
  private static toDateValue(value?: TimeInput): Date {
    if (value instanceof Time) {
      return new Date(value.instant.getTime());
    }
    return parse(value);
  }

  // ---------------------------------------------------------------------------
  // Static helpers
  // ---------------------------------------------------------------------------

  /** Current date and time. Equivalent to `time()`. */
  static now(): Time {
    return new Time();
  }

  /** Creates a `Time` from a Unix timestamp in **seconds**. */
  static unix(seconds: number): Time {
    return new Time(seconds * 1000);
  }

  /** Parses a string against an explicit format, e.g. `("19/08/2026", "DD/MM/YYYY")`. */
  static fromFormat(input: string, format: string): Time {
    return new Time(input, format);
  }

  /** Type guard: whether `value` is a `Time` instance. */
  static isTime(value: unknown): value is Time {
    return value instanceof Time;
  }

  /** Returns true if the input can be parsed into a valid date, without throwing. */
  static isValid(value?: TimeInput): boolean {
    try {
      return !Number.isNaN(Time.toDateValue(value).getTime());
    } catch {
      return false;
    }
  }

  /** The earliest of the given instances. */
  static min(...times: TimeInput[]): Time {
    return times
      .map((t) => new Time(t))
      .reduce((earliest, current) =>
        current.isBefore(earliest) ? current : earliest,
      );
  }

  /** The latest of the given instances. */
  static max(...times: TimeInput[]): Time {
    return times
      .map((t) => new Time(t))
      .reduce((latest, current) =>
        current.isAfter(latest) ? current : latest,
      );
  }

  // ---------------------------------------------------------------------------
  // Conversion
  // ---------------------------------------------------------------------------

  /** A copy of this instance. */
  clone(): Time {
    return new Time(this.instant);
  }

  /** A native `Date` clone (safe to mutate). */
  toDate(): Date {
    return new Date(this.instant.getTime());
  }

  /** Milliseconds since the Unix epoch. Also enables `<`, `>`, and `Number()`. */
  valueOf(): number {
    return this.instant.getTime();
  }

  /** Seconds since the Unix epoch. */
  unix(): number {
    return Math.floor(this.instant.getTime() / 1000);
  }

  /** ISO 8601 string, e.g. "2026-08-19T14:30:00.000Z". */
  toISOString(): string {
    return this.instant.toISOString();
  }

  /** Default formatted string; used by template literals and `String()`. */
  toString(): string {
    return this.format();
  }

  /** Serializes to an ISO string when passed to `JSON.stringify`. */
  toJSON(): string {
    return this.instant.toISOString();
  }

  /** Plain object of the date's components (month is 1-12). */
  toObject(): TimeObject {
    return {
      year: this.year(),
      month: this.month(),
      date: this.date(),
      hour: this.hour(),
      minute: this.minute(),
      second: this.second(),
      millisecond: this.millisecond(),
    };
  }

  /** Components as `[year, month, date, hour, minute, second, millisecond]` (month 1-12). */
  toArray(): [number, number, number, number, number, number, number] {
    return [
      this.year(),
      this.month(),
      this.date(),
      this.hour(),
      this.minute(),
      this.second(),
      this.millisecond(),
    ];
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  /** Full year, e.g. 2026. */
  year(): number {
    return this.instant.getFullYear();
  }

  /** Month of the year, 1 (January) through 12 (December). */
  month(): number {
    return this.instant.getMonth() + 1;
  }

  /** Day of the month, 1 through 31. */
  date(): number {
    return this.instant.getDate();
  }

  /** Day of the week, 0 (Sunday) through 6 (Saturday). */
  day(): number {
    return this.instant.getDay();
  }

  hour(): number {
    return this.instant.getHours();
  }

  minute(): number {
    return this.instant.getMinutes();
  }

  second(): number {
    return this.instant.getSeconds();
  }

  millisecond(): number {
    return this.instant.getMilliseconds();
  }

  /** Day of the year, 1 through 366. */
  dayOfYear(): number {
    const startOfYear = new Date(this.instant.getFullYear(), 0, 1);
    const startOfDay = new Date(
      this.instant.getFullYear(),
      this.instant.getMonth(),
      this.instant.getDate(),
    );
    // Round rather than floor so a 23h/25h daylight-saving day doesn't skew it.
    return Math.round((startOfDay.getTime() - startOfYear.getTime()) / 86_400_000) + 1;
  }

  /** Number of days in this instance's month (28-31). */
  daysInMonth(): number {
    return new Date(this.instant.getFullYear(), this.instant.getMonth() + 1, 0).getDate();
  }

  /** Number of days in this instance's year (365 or 366). */
  daysInYear(): number {
    return this.isLeapYear() ? 366 : 365;
  }

  /** Quarter of the year, 1 through 4. */
  quarter(): number {
    return quarterOf(this.instant);
  }

  /** ISO 8601 week number, 1 through 53. */
  week(): number {
    return isoWeek(this.instant);
  }

  /** Timezone offset from UTC in minutes (positive east of UTC). */
  utcOffset(): number {
    return -this.instant.getTimezoneOffset();
  }

  /** Weekday name, e.g. "Monday" (or "Mon" when `short` is true). */
  dayName(short = false): string {
    const names = short ? DAY_NAMES_SHORT : DAY_NAMES;
    return names[this.instant.getDay()];
  }

  /** Month name, e.g. "August" (or "Aug" when `short` is true). */
  monthName(short = false): string {
    const names = short ? MONTH_NAMES_SHORT : MONTH_NAMES;
    return names[this.instant.getMonth()];
  }

  /** ISO weekday, 1 (Monday) through 7 (Sunday). */
  isoWeekday(): number {
    const day = this.instant.getDay();
    return day === 0 ? 7 : day;
  }

  /** Generic getter — reads any component by name (month is 1-12). */
  get(unit: GetUnit): number {
    switch (unit) {
      case "year": return this.year();
      case "month": return this.month();
      case "date": return this.date();
      case "day": return this.day();
      case "hour": return this.hour();
      case "minute": return this.minute();
      case "second": return this.second();
      case "millisecond": return this.millisecond();
      case "quarter": return this.quarter();
      case "week": return this.week();
      case "isoWeekday": return this.isoWeekday();
      case "dayOfYear": return this.dayOfYear();
    }
  }

  // ---------------------------------------------------------------------------
  // Manipulation
  // ---------------------------------------------------------------------------

  /** Returns a new instance with `amount` of `unit` added. */
  add(amount: number, unit: TimeUnit): Time {
    const next = new Date(this.instant.getTime());
    applyUnit(next, amount, unit);
    return new Time(next);
  }

  /** Returns a new instance with `amount` of `unit` subtracted. */
  subtract(amount: number, unit: TimeUnit): Time {
    return this.add(-amount, unit);
  }

  /** Returns a new instance with a single component overwritten. Month is 1-12. */
  set(unit: SetUnit, value: number): Time {
    const next = new Date(this.instant.getTime());

    switch (unit) {
      case "year":
        next.setFullYear(value);
        break;
      case "month":
        next.setMonth(value - 1);
        break;
      case "date":
        next.setDate(value);
        break;
      case "hour":
        next.setHours(value);
        break;
      case "minute":
        next.setMinutes(value);
        break;
      case "second":
        next.setSeconds(value);
        break;
      case "millisecond":
        next.setMilliseconds(value);
        break;
    }

    return new Time(next);
  }

  /** Returns a new instance snapped to the start of `unit`. */
  startOf(unit: StartEndUnit): Time {
    return new Time(startOf(this.instant, unit));
  }

  /** Returns a new instance snapped to the end of `unit`. */
  endOf(unit: StartEndUnit): Time {
    return new Time(endOf(this.instant, unit));
  }

  /** Rounds to the nearest `unit` boundary (ties round up). */
  round(unit: StartEndUnit): Time {
    const down = this.startOf(unit);
    const up = down.add(1, STEP_UNIT[unit]);
    const midpoint = (down.valueOf() + up.valueOf()) / 2;
    return this.valueOf() >= midpoint ? up : down;
  }

  /** Constrains this instance to the inclusive `[min, max]` range. */
  clamp(min: TimeInput, max: TimeInput): Time {
    const low = new Time(min);
    const high = new Time(max);
    if (this.isBefore(low)) return low.clone();
    if (this.isAfter(high)) return high.clone();
    return this.clone();
  }

  /**
   * Builds an array of instances stepping from this instance to `end`
   * (inclusive). Direction is inferred, so `end` may be earlier or later.
   *
   * @param unit step unit (default `"days"`)
   * @param step step size (default `1`)
   */
  range(end: TimeInput, unit: TimeUnit = "days", step = 1): Time[] {
    const target = new Time(end);
    const ascending = target.isSameOrAfter(this);
    const magnitude = Math.abs(step) || 1;
    const stride = ascending ? magnitude : -magnitude;

    const result: Time[] = [];
    let cursor: Time = this.clone();

    // Hard cap guards against a pathological step producing a runaway loop.
    for (let guard = 0; guard < 1_000_000; guard += 1) {
      const done = ascending
        ? cursor.isAfter(target)
        : cursor.isBefore(target);
      if (done) break;
      result.push(cursor);
      cursor = cursor.add(stride, unit);
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  /** Formats using the token table (see `core/format`). */
  format(pattern = "YYYY-MM-DD HH:mm:ss"): string {
    return formatDate(this.instant, pattern);
  }

  /** 12-hour clock string, e.g. "02:30 PM". */
  to12Hour(): string {
    return this.format("hh:mm A");
  }

  /** 24-hour clock string, e.g. "14:30". */
  to24Hour(): string {
    return this.format("HH:mm");
  }

  /** Human-readable distance from now, e.g. "2 hours ago" or "in 3 days". */
  fromNow(withoutSuffix = false): string {
    return relativeTime(this.instant, new Date(), withoutSuffix);
  }

  /** Human-readable distance from another date. */
  from(other: TimeInput, withoutSuffix = false): string {
    return relativeTime(this.instant, Time.toDateValue(other), withoutSuffix);
  }

  /**
   * Friendly calendar phrase relative to `reference` (defaults to now), e.g.
   * "Today at 2:30 PM", "Yesterday at 9:00 AM", or "08/19/2026".
   */
  calendar(reference?: TimeInput): string {
    const base = reference === undefined ? new Date() : Time.toDateValue(reference);
    return calendar(this.instant, base);
  }

  /** Relative time of `other` as seen from this instance (inverse of `from`). */
  to(other: TimeInput, withoutSuffix = false): string {
    return relativeTime(Time.toDateValue(other), this.instant, withoutSuffix);
  }

  /** Relative time of now as seen from this instance (inverse of `fromNow`). */
  toNow(withoutSuffix = false): string {
    return relativeTime(new Date(), this.instant, withoutSuffix);
  }

  // ---------------------------------------------------------------------------
  // Comparison & queries
  // ---------------------------------------------------------------------------

  /** True if this instance's year is a leap year. */
  isLeapYear(): boolean {
    const year = this.instant.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  isBefore(other: TimeInput): boolean {
    return this.instant.getTime() < Time.toDateValue(other).getTime();
  }

  isAfter(other: TimeInput): boolean {
    return this.instant.getTime() > Time.toDateValue(other).getTime();
  }

  /**
   * Equality check. With no `unit`, compares the exact millisecond timestamps;
   * with a `unit`, compares only down to that granularity (e.g. same day).
   */
  isSame(other: TimeInput, unit?: StartEndUnit): boolean {
    const otherDate = Time.toDateValue(other);

    if (!unit) {
      return this.instant.getTime() === otherDate.getTime();
    }

    return (
      startOf(this.instant, unit).getTime() === startOf(otherDate, unit).getTime()
    );
  }

  isSameOrBefore(other: TimeInput): boolean {
    return this.instant.getTime() <= Time.toDateValue(other).getTime();
  }

  isSameOrAfter(other: TimeInput): boolean {
    return this.instant.getTime() >= Time.toDateValue(other).getTime();
  }

  /**
   * True if this instance lies between `start` and `end`.
   *
   * @param inclusivity two characters controlling the bounds: `[` / `]` include
   *   the edge, `(` / `)` exclude it. Defaults to `"()"` (both exclusive).
   */
  isBetween(start: TimeInput, end: TimeInput, inclusivity = "()"): boolean {
    const value = this.instant.getTime();
    const startMs = Time.toDateValue(start).getTime();
    const endMs = Time.toDateValue(end).getTime();

    const lowerOk = inclusivity[0] === "[" ? value >= startMs : value > startMs;
    const upperOk = inclusivity[1] === "]" ? value <= endMs : value < endMs;

    return lowerOk && upperOk;
  }

  /** True if this instance falls on the same calendar day as now. */
  isToday(): boolean {
    return this.isSame(new Time(), "day");
  }

  /** True if this instance falls on tomorrow's calendar day. */
  isTomorrow(): boolean {
    return this.isSame(new Time().add(1, "days"), "day");
  }

  /** True if this instance falls on yesterday's calendar day. */
  isYesterday(): boolean {
    return this.isSame(new Time().subtract(1, "days"), "day");
  }

  /** True if this instance falls on a Saturday or Sunday. */
  isWeekend(): boolean {
    const weekday = this.instant.getDay();
    return weekday === 0 || weekday === 6;
  }

  /** True if this instance falls on a weekday (Monday-Friday). */
  isWeekday(): boolean {
    return !this.isWeekend();
  }

  /** True if this instance is earlier than the current moment. */
  isPast(): boolean {
    return this.instant.getTime() < Date.now();
  }

  /** True if this instance is later than the current moment. */
  isFuture(): boolean {
    return this.instant.getTime() > Date.now();
  }

  // ---------------------------------------------------------------------------
  // Difference
  // ---------------------------------------------------------------------------

  /** Difference between this instance and `other`, expressed in `unit`. */
  diff(other: TimeInput, unit: DiffUnit): number {
    return diff(this.instant, Time.toDateValue(other), unit);
  }

  /**
   * Calendar-accurate breakdown of the span to `other` as
   * `{ years, months, days, hours, minutes, seconds }` — always non-negative,
   * with real month lengths (never "32 days"). Handy for "1 year, 2 months ago".
   */
  preciseDiff(other: TimeInput): PreciseDiff {
    return preciseDiff(this.instant, Time.toDateValue(other));
  }
}
