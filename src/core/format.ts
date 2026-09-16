import {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  DAY_NAMES,
  DAY_NAMES_SHORT,
  DAY_NAMES_MIN,
} from "../constants.js";
import { isoWeek, quarterOf } from "./week.js";

/** Left-pads a number with zeros to the given width. */
export function pad(value: number, length = 2): string {
  return String(Math.abs(value)).padStart(length, "0");
}

/** Returns an ordinal string for a day of the month, e.g. 1 → "1st". */
export function ordinal(day: number): string {
  const remainderTen = day % 10;
  const remainderHundred = day % 100;

  if (remainderTen === 1 && remainderHundred !== 11) return `${day}st`;
  if (remainderTen === 2 && remainderHundred !== 12) return `${day}nd`;
  if (remainderTen === 3 && remainderHundred !== 13) return `${day}rd`;

  return `${day}th`;
}

/** Formats the local timezone offset, e.g. "+05:30" (colon) or "+0530". */
function timezoneOffset(date: Date, colon: boolean): string {
  const totalMinutes = -date.getTimezoneOffset();
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(totalMinutes);
  const hours = pad(Math.floor(absMinutes / 60));
  const minutes = pad(absMinutes % 60);

  return colon ? `${sign}${hours}:${minutes}` : `${sign}${hours}${minutes}`;
}

/**
 * Formats a `Date` against a token pattern.
 *
 * Supported tokens (longest match wins):
 *
 *   YYYY 2026   YY 26
 *   MMMM August MMM Aug   MM 08   M 8
 *   DD 09       D 9       Do 9th
 *   dddd Monday ddd Mon    dd Mo
 *   Q 3         ww 33      w 33
 *   HH 14       H 14       hh 02  h 2   kk 14  k 14
 *   mm 05       m 5        ss 09  s 9   SSS 123
 *   A PM        a pm
 *   X 1787…     x 1787…000 (unix seconds / milliseconds)
 *   Z +05:30    ZZ +0530
 *   L 08/09/2026   LL August 9, 2026   LLL … h:mm A   LLLL dddd, …
 *   LT 2:05 PM     LTS 2:05:07 PM
 *
 * Wrap literal text in square brackets to keep it verbatim: `[Today] dddd`.
 */
export function formatDate(date: Date, pattern: string): string {
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  const hour24From1 = hours === 0 ? 24 : hours;
  const period = hours < 12 ? "AM" : "PM";

  const YYYY = String(date.getFullYear());
  const MMMM = MONTH_NAMES[date.getMonth()];
  const D = String(date.getDate());
  const dddd = DAY_NAMES[date.getDay()];
  const h = String(hour12);
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const A = period;

  const tokens: Record<string, string> = {
    YYYY,
    YY: pad(date.getFullYear() % 100),

    MMMM,
    MMM: MONTH_NAMES_SHORT[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),

    DD: pad(date.getDate()),
    Do: ordinal(date.getDate()),
    D,

    dddd,
    ddd: DAY_NAMES_SHORT[date.getDay()],
    dd: DAY_NAMES_MIN[date.getDay()],

    Q: String(quarterOf(date)),
    ww: pad(isoWeek(date)),
    w: String(isoWeek(date)),

    HH: pad(hours),
    H: String(hours),
    hh: pad(hour12),
    h,
    kk: pad(hour24From1),
    k: String(hour24From1),

    mm,
    m: String(date.getMinutes()),

    ss,
    s: String(date.getSeconds()),

    SSS: pad(date.getMilliseconds(), 3),

    A,
    a: period.toLowerCase(),

    X: String(Math.floor(date.getTime() / 1000)),
    x: String(date.getTime()),

    ZZ: timezoneOffset(date, false),
    Z: timezoneOffset(date, true),

    // Localized presets (English), matching Day.js LocalizedFormat.
    LTS: `${h}:${mm}:${ss} ${A}`,
    LT: `${h}:${mm} ${A}`,
    LLLL: `${dddd}, ${MMMM} ${D}, ${YYYY} ${h}:${mm} ${A}`,
    LLL: `${MMMM} ${D}, ${YYYY} ${h}:${mm} ${A}`,
    LL: `${MMMM} ${D}, ${YYYY}`,
    L: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${YYYY}`,
  };

  const tokenPattern = Object.keys(tokens)
    .sort((a, b) => b.length - a.length)
    .join("|");

  // Match escaped literals first, then any known token.
  const regex = new RegExp(`\\[([^\\]]*)\\]|${tokenPattern}`, "g");

  return pattern.replace(regex, (match, escaped: string | undefined) =>
    escaped !== undefined ? escaped : tokens[match],
  );
}
