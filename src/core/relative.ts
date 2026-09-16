import { MS } from "../constants.js";

interface Threshold {
  /** Upper bound, in the reference unit, for this phrase to apply. */
  limit: number;
  /** Divisor to convert the elapsed span into the phrase's unit. */
  divisor: number;
  /** Singular phrase used when the count rounds to 1. */
  singular: string;
  /** Plural phrase; `%d` is replaced with the rounded count. */
  plural: string;
}

const SECOND = MS.seconds;
const MINUTE = MS.minutes;
const HOUR = MS.hours;
const DAY = MS.days;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

// Ordered brackets, mirroring the familiar moment.js humanize thresholds.
const THRESHOLDS: Threshold[] = [
  { limit: 44 * SECOND, divisor: SECOND, singular: "a few seconds", plural: "a few seconds" },
  { limit: 90 * SECOND, divisor: MINUTE, singular: "a minute", plural: "a minute" },
  { limit: 45 * MINUTE, divisor: MINUTE, singular: "a minute", plural: "%d minutes" },
  { limit: 90 * MINUTE, divisor: HOUR, singular: "an hour", plural: "an hour" },
  { limit: 22 * HOUR, divisor: HOUR, singular: "an hour", plural: "%d hours" },
  { limit: 36 * HOUR, divisor: DAY, singular: "a day", plural: "a day" },
  { limit: 25 * DAY, divisor: DAY, singular: "a day", plural: "%d days" },
  { limit: 45 * DAY, divisor: MONTH, singular: "a month", plural: "a month" },
  { limit: 11 * MONTH, divisor: MONTH, singular: "a month", plural: "%d months" },
  { limit: 17 * MONTH, divisor: YEAR, singular: "a year", plural: "a year" },
];

function phrase(elapsedMs: number): string {
  for (const { limit, divisor, singular, plural } of THRESHOLDS) {
    if (elapsedMs < limit) {
      const count = Math.round(elapsedMs / divisor);
      return count <= 1 ? singular : plural.replace("%d", String(count));
    }
  }

  const years = Math.round(elapsedMs / YEAR);
  return years <= 1 ? "a year" : `${years} years`;
}

/**
 * Human-readable distance between `date` and `base` (defaults to now).
 *
 * @param withoutSuffix when true, returns the bare span ("2 hours") without the
 *   "ago" / "in" prefix or suffix.
 *
 * Examples: "a few seconds ago", "in 3 days", "2 months ago".
 */
export function relativeTime(
  date: Date,
  base: Date = new Date(),
  withoutSuffix = false,
): string {
  const deltaMs = date.getTime() - base.getTime();
  const spoken = phrase(Math.abs(deltaMs));

  if (withoutSuffix) {
    return spoken;
  }

  return deltaMs <= 0 ? `${spoken} ago` : `in ${spoken}`;
}
