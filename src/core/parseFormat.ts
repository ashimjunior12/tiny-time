import { MONTH_NAMES, MONTH_NAMES_SHORT } from "../constants.js";

/** Mutable bag of parsed components; unset fields stay undefined. */
interface Parts {
  year?: number;
  month?: number; // 0-11
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  meridiem?: "am" | "pm";
}

/** A regex fragment plus how its captured value updates the parts. */
interface TokenSpec {
  regex: string;
  apply(parts: Parts, raw: string): void;
}

const monthIndex = (name: string): number => {
  const lower = name.toLowerCase();
  const long = MONTH_NAMES.findIndex((m) => m.toLowerCase() === lower);
  if (long !== -1) return long;
  return MONTH_NAMES_SHORT.findIndex((m) => m.toLowerCase() === lower);
};

// Longer tokens must be tried before their prefixes (MMMM before MM before M).
const TOKENS: Record<string, TokenSpec> = {
  YYYY: { regex: "(\\d{4})", apply: (p, r) => (p.year = +r) },
  YY: { regex: "(\\d{2})", apply: (p, r) => (p.year = 2000 + +r) },
  MMMM: { regex: "([A-Za-z]+)", apply: (p, r) => (p.month = monthIndex(r)) },
  MMM: { regex: "([A-Za-z]{3})", apply: (p, r) => (p.month = monthIndex(r)) },
  MM: { regex: "(\\d{2})", apply: (p, r) => (p.month = +r - 1) },
  M: { regex: "(\\d{1,2})", apply: (p, r) => (p.month = +r - 1) },
  DD: { regex: "(\\d{2})", apply: (p, r) => (p.day = +r) },
  D: { regex: "(\\d{1,2})", apply: (p, r) => (p.day = +r) },
  HH: { regex: "(\\d{2})", apply: (p, r) => (p.hour = +r) },
  H: { regex: "(\\d{1,2})", apply: (p, r) => (p.hour = +r) },
  hh: { regex: "(\\d{2})", apply: (p, r) => (p.hour = +r) },
  h: { regex: "(\\d{1,2})", apply: (p, r) => (p.hour = +r) },
  mm: { regex: "(\\d{2})", apply: (p, r) => (p.minute = +r) },
  m: { regex: "(\\d{1,2})", apply: (p, r) => (p.minute = +r) },
  ss: { regex: "(\\d{2})", apply: (p, r) => (p.second = +r) },
  s: { regex: "(\\d{1,2})", apply: (p, r) => (p.second = +r) },
  SSS: { regex: "(\\d{3})", apply: (p, r) => (p.millisecond = +r) },
  A: {
    regex: "(AM|PM)",
    apply: (p, r) => (p.meridiem = r.toLowerCase() as "am" | "pm"),
  },
  a: {
    regex: "(am|pm)",
    apply: (p, r) => (p.meridiem = r.toLowerCase() as "am" | "pm"),
  },
};

const TOKEN_NAMES = Object.keys(TOKENS).sort((a, b) => b.length - a.length);

function escapeLiteral(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parses `input` against an explicit `format` string, e.g.
 * `parseFormat("19/08/2026", "DD/MM/YYYY")`.
 *
 * Native `Date` can't reliably read day-first or custom layouts; this can.
 * Unspecified units default to their minimum (month → January, day → 1,
 * time → 0) and an unspecified year defaults to the current year. Wrap literal
 * text in `[brackets]`.
 *
 * @throws if the input doesn't match the format.
 */
export function parseFormat(input: string, format: string): Date {
  const appliers: TokenSpec["apply"][] = [];
  let regexSource = "^";

  let i = 0;
  while (i < format.length) {
    // Literal escape: [text] is matched verbatim.
    if (format[i] === "[") {
      const close = format.indexOf("]", i);
      if (close !== -1) {
        regexSource += escapeLiteral(format.slice(i + 1, close));
        i = close + 1;
        continue;
      }
    }

    const token = TOKEN_NAMES.find((name) => format.startsWith(name, i));
    if (token) {
      regexSource += TOKENS[token].regex;
      appliers.push(TOKENS[token].apply);
      i += token.length;
      continue;
    }

    regexSource += escapeLiteral(format[i]);
    i += 1;
  }
  regexSource += "$";

  const match = new RegExp(regexSource).exec(input);
  if (!match) {
    throw new Error(`"${input}" does not match format "${format}"`);
  }

  const parts: Parts = {};
  appliers.forEach((apply, index) => apply(parts, match[index + 1]));

  let hour = parts.hour ?? 0;
  if (parts.meridiem === "pm" && hour < 12) hour += 12;
  if (parts.meridiem === "am" && hour === 12) hour = 0;

  return new Date(
    parts.year ?? new Date().getFullYear(),
    parts.month ?? 0,
    parts.day ?? 1,
    hour,
    parts.minute ?? 0,
    parts.second ?? 0,
    parts.millisecond ?? 0,
  );
}
