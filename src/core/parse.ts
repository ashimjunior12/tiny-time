/**
 * ISO date / date-time **without** a timezone designator.
 *
 * Group order: year, month, day, [hour, minute, [second, [fraction]]].
 * The separator may be `T` or a space. Anything carrying a `Z` or a `±hh:mm`
 * offset deliberately fails this pattern and falls through to the native
 * parser, which honours that offset.
 */
const ISO_LOCAL =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

/**
 * Converts the supported primitive inputs into a fresh `Date`.
 *
 * `Time` instances are unwrapped by the caller before reaching here, so this
 * stays free of any dependency on the `Time` class (and free of import cycles).
 *
 * - `undefined` / `null` → the current date and time
 * - `Date`               → a defensive clone, never the original reference
 * - `number`             → treated as a millisecond timestamp
 * - `string`             → a timezone-less ISO string is read in **local** time
 *   (so `"2026-08-01"` is that calendar day everywhere, not a UTC instant that
 *   shifts across the date line); everything else — strings with a `Z`/offset,
 *   or non-ISO formats — is handed to the native parser.
 */
export function parse(value?: Date | string | number | null): Date {
  if (value === undefined || value === null) {
    return new Date();
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  const match = ISO_LOCAL.exec(value.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] ?? 0);
    const minute = Number(match[5] ?? 0);
    const second = Number(match[6] ?? 0);
    const millisecond = match[7] ? Number(match[7].padEnd(3, "0")) : 0;

    // Reject out-of-range components rather than letting the Date constructor
    // silently roll them over (e.g. month 13, or 25:00). Time fields are kept
    // range-checked but not re-validated after construction, so a wall-clock
    // time that lands in a daylight-saving gap is still accepted (and shifted),
    // matching how Day.js and Moment behave.
    if (
      month < 1 || month > 12 ||
      day < 1 || day > 31 ||
      hour > 23 || minute > 59 || second > 59
    ) {
      return new Date(NaN);
    }

    const result = new Date(year, month - 1, day, hour, minute, second, millisecond);

    // Catch day overflow that ranges alone miss (e.g. Feb 30 → Mar 2).
    if (result.getMonth() !== month - 1 || result.getDate() !== day) {
      return new Date(NaN);
    }

    return result;
  }

  return new Date(value);
}
