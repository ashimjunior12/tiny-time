# timeatom

A tiny (~4&nbsp;kB gzipped), immutable, dependency-free date & time library for JavaScript and TypeScript.

It wraps the native `Date` with a small, chainable, fully-typed API for formatting, custom-format parsing, math, comparison, relative time ("3 days ago"), calendar phrases, week & quarter numbers, ranges, and differences — without the weight of Moment or the plugin juggling of Day.js. Everything is built in: no plugins, no config, zero dependencies.

**Why timeatom?**

- **Tiny & fast** — ~4&nbsp;kB gzipped, zero dependencies, tree-shakeable ESM.
- **Immutable** — every method returns a new instance; your dates never mutate underneath you.
- **Batteries included** — relative time, `calendar()`, custom-format parsing, `isBetween`, quarters, ISO weeks, ranges, `clamp`, `round`, and 60+ methods without a single plugin.
- **Fully typed** — first-class TypeScript, human-friendly 1–12 months.
- **Familiar** — a Day.js-style API, so migrating is trivial.

### Built in vs. Day.js plugins

Day.js keeps its core small by moving most features into plugins you install and register one by one. timeatom ships them all in the box:

| Feature | timeatom | Day.js |
| --- | --- | --- |
| Relative time (`fromNow`, `from`, `to`, `toNow`) | ✅ built in | `relativeTime` plugin |
| Custom-format parsing (`time(str, fmt)`) | ✅ built in | `customParseFormat` plugin |
| `isBetween` | ✅ built in | `isBetween` plugin |
| `isToday` / `isTomorrow` / `isYesterday` | ✅ built in | 3 separate plugins |
| ISO week, quarter | ✅ built in | `isoWeek` + `quarterOfYear` plugins |
| `calendar()` | ✅ built in | `calendar` plugin |
| Localized/advanced tokens (`LLLL`, `X`, `k`…) | ✅ built in | `localizedFormat` + `advancedFormat` plugins |
| `min` / `max` | ✅ built in | `minMax` plugin |
| Ranges, `clamp`, `round`, `preciseDiff` | ✅ built in | not available |

```ts
import { time } from "timeatom";

time("2026-08-09T14:05:07").format("dddd, MMMM Do YYYY [at] h:mm A");
// "Sunday, August 9th 2026 at 2:05 PM"

time().subtract(3, "days").fromNow(); // "3 days ago"
time("2026-03-15").diff("2026-01-15", "months"); // 2
```

## Installation

```bash
npm install timeatom
```

## Quick Start

```ts
import { time } from "timeatom";

const now = time(); // current date/time
const parsed = time("2026-08-19T14:30:00"); // from an ISO string
const fromDate = time(new Date()); // from a Date
const fromMs = time(1755612600000); // from a timestamp
const copy = time(parsed); // from another Time

parsed.format(); // "2026-08-19 14:30:00"
```

`time(value?)` accepts a `Date`, a millisecond timestamp, a date string, another `Time`, or nothing (current time) and always returns a new `Time`. A string that can't be parsed — or that names an impossible date like `"2026-02-30"` — throws `Invalid date`.

> **Time-zone safe.** A date-only or timezone-less string (`"2026-08-01"`, `"2026-08-01T14:30"`) is read as that **local** calendar time, so it never drifts a day across the date line the way native `new Date("2026-08-01")` (UTC) does. Strings with an explicit `Z` or `±hh:mm` offset are honoured as written.

## Parsing

Beyond the native parser, timeatom can read a string against an **explicit format** — perfect for day-first or otherwise ambiguous layouts that native `Date` gets wrong:

```ts
time("19/08/2026", "DD/MM/YYYY").format("YYYY-MM-DD"); // "2026-08-19"
time("August 9, 2026", "MMMM D, YYYY").format(); // "2026-08-09 00:00:00"
time("02:05 PM", "hh:mm A").to24Hour(); // "14:05"

// Same thing via the static method:
Time.fromFormat("2026-08-19 14:30", "YYYY-MM-DD HH:mm");
```

Parsing supports the tokens `YYYY YY MMMM MMM MM M DD D HH H hh h mm m ss s SSS A a`, plus `[bracketed]` literals. Unspecified units default to their minimum (month → January, day → 1, time → 0); an unspecified year defaults to the current year. A string that doesn't match the format throws.

Other entry points:

```ts
Time.unix(1755612600); // from a Unix timestamp in seconds
Time.now(); // current time
Time.isTime(value); // type guard — is this a Time instance?
Time.isValid("2026-13-40"); // false, without throwing
```

## Immutability

Every method that would change a value returns a **new** `Time`. The original is never mutated, and any `Date` you pass in is cloned defensively.

```ts
const date = time("2026-08-19T14:30:00");
const future = date.add(2, "days");

date.format(); // "2026-08-19 14:30:00" (unchanged)
future.format(); // "2026-08-21 14:30:00"
```

## Formatting

`.format(pattern)` turns a `Time` into a string. The default pattern is `"YYYY-MM-DD HH:mm:ss"`. Wrap literal text in `[square brackets]` to keep it verbatim.

```ts
const date = time("2026-08-09T14:05:07.042");

date.format(); // "2026-08-09 14:05:07"
date.format("YYYY/MM/DD"); // "2026/08/09"
date.format("h:mm A"); // "2:05 PM"
date.format("dddd, MMMM Do YYYY"); // "Sunday, August 9th 2026"
date.format("[Today is] dddd"); // "Today is Sunday"
```

### Tokens

| Token  | Meaning                    | Example  |
| ------ | -------------------------- | -------- |
| `YYYY` | 4-digit year               | 2026     |
| `YY`   | 2-digit year               | 26       |
| `MMMM` | Full month name            | August   |
| `MMM`  | Short month name           | Aug      |
| `MM`   | Month, padded              | 08       |
| `M`    | Month                      | 8        |
| `DD`   | Day of month, padded       | 09       |
| `D`    | Day of month               | 9        |
| `Do`   | Day of month, ordinal      | 9th      |
| `dddd` | Full weekday name          | Sunday   |
| `ddd`  | Short weekday name         | Sun      |
| `dd`   | Min weekday name           | Su       |
| `Q`    | Quarter (1–4)              | 3        |
| `ww`   | ISO week, padded           | 33       |
| `w`    | ISO week                   | 33       |
| `HH`   | Hour (24h), padded         | 14       |
| `H`    | Hour (24h)                 | 14       |
| `hh`   | Hour (12h), padded         | 02       |
| `h`    | Hour (12h)                 | 2        |
| `kk`   | Hour (1–24), padded        | 14       |
| `k`    | Hour (1–24)                | 14       |
| `mm`   | Minute, padded             | 05       |
| `m`    | Minute                     | 5        |
| `ss`   | Second, padded             | 07       |
| `s`    | Second                     | 7        |
| `SSS`  | Millisecond, padded        | 042      |
| `A`    | AM/PM, uppercase           | PM       |
| `a`    | am/pm, lowercase           | pm       |
| `X`    | Unix timestamp (seconds)   | 1787…    |
| `x`    | Unix timestamp (ms)        | 1787…000 |
| `Z`    | UTC offset with colon      | +05:30   |
| `ZZ`   | UTC offset without colon   | +0530    |

### Localized presets

Shorthand tokens that expand to common English layouts:

| Token  | Expands to                        | Example                              |
| ------ | --------------------------------- | ------------------------------------ |
| `LT`   | `h:mm A`                          | 2:05 PM                              |
| `LTS`  | `h:mm:ss A`                       | 2:05:07 PM                          |
| `L`    | `MM/DD/YYYY`                       | 08/09/2026                          |
| `LL`   | `MMMM D, YYYY`                     | August 9, 2026                      |
| `LLL`  | `MMMM D, YYYY h:mm A`              | August 9, 2026 2:05 PM              |
| `LLLL` | `dddd, MMMM D, YYYY h:mm A`        | Sunday, August 9, 2026 2:05 PM      |

### Convenience formatters

```ts
date.to12Hour(); // "02:05 PM"
date.to24Hour(); // "14:05"
```

## Relative Time

Human-readable distances, built in — no plugin required.

```ts
time().subtract(30, "seconds").fromNow(); // "a few seconds ago"
time().subtract(5, "minutes").fromNow(); // "5 minutes ago"
time().add(3, "days").fromNow(); // "in 3 days"
time().subtract(5, "minutes").fromNow(true); // "5 minutes" (no suffix)

// Relative to a specific date instead of now:
time("2026-08-19T10:00:00").from("2026-08-19T12:00:00"); // "2 hours ago"

// `to` / `toNow` are the inverse — how far the other date is from this one:
time("2026-08-19T12:00:00").to("2026-08-19T15:00:00"); // "in 3 hours"
time().add(1, "days").toNow(); // "a day ago"
```

### Calendar phrases

`.calendar(reference?)` gives a friendly, context-aware description (reference defaults to now):

```ts
const ref = time("2026-08-19T12:00:00");

time("2026-08-19T14:30:00").calendar(ref); // "Today at 2:30 PM"
time("2026-08-20T09:00:00").calendar(ref); // "Tomorrow at 9:00 AM"
time("2026-08-18T09:00:00").calendar(ref); // "Yesterday at 9:00 AM"
time("2026-08-24T10:00:00").calendar(ref); // "Monday at 10:00 AM"  (within a week)
time("2026-12-25T10:00:00").calendar(ref); // "12/25/2026"          (further away)
```

## Adding and Subtracting

```ts
date.add(2, "days");
date.subtract(1, "months");
date.add(3, "weeks");
```

Both accept an `amount` and a `TimeUnit`:

```ts
type TimeUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "quarters"
  | "years";
```

Sub-day units (`milliseconds`, `seconds`, `minutes`, `hours`) advance by **exact elapsed time**, so `add(2, "hours")` is always +7,200,000 ms and perfectly reversible. Day, week, month, and year units are **calendar-aware** — they preserve the wall-clock time across daylight-saving shifts ("same time tomorrow").

Adding months or years keeps the day within the target month instead of overflowing:

```ts
time("2026-01-31").add(1, "months").format("YYYY-MM-DD"); // "2026-02-28"
time("2028-01-31").add(1, "months").format("YYYY-MM-DD"); // "2028-02-29"
time("2024-02-29").add(1, "years").format("YYYY-MM-DD"); // "2025-02-28"
```

## Getters

Numeric getters return a `number` and the name getters return a `string`. **Month is 1–12** (January is `1`, not `0`) — friendlier than the native `Date`.

```ts
const d = time("2026-08-19T14:35:42.123");

d.year(); // 2026
d.month(); // 8   (August)
d.date(); // 19  (day of month)
d.day(); // 3   (day of week, 0 = Sunday)
d.hour(); // 14
d.minute(); // 35
d.second(); // 42
d.millisecond(); // 123
d.quarter(); // 3   (1–4)
d.week(); // 34  (ISO 8601 week number)
d.dayOfYear(); // 231
d.daysInMonth(); // 31
d.daysInYear(); // 365
d.utcOffset(); // minutes from UTC, e.g. 330 for +05:30
d.isoWeekday(); // 3   (ISO: Monday = 1 … Sunday = 7)
d.dayName(); // "Wednesday"   (pass true → "Wed")
d.monthName(); // "August"      (pass true → "Aug")
```

There's also a generic getter, if you prefer reading a component by name:

```ts
d.get("year"); // 2026
d.get("month"); // 8
d.get("quarter"); // 3
// unit: "year" | "month" | "date" | "day" | "hour" | "minute" | "second"
//     | "millisecond" | "quarter" | "week" | "isoWeekday" | "dayOfYear"
```

## Setting a Component

`.set(unit, value)` returns a new instance with a single component overwritten (month is 1–12).

```ts
const d = time("2026-08-19T14:30:00");

d.set("year", 2030).format(); // "2030-08-19 14:30:00"
d.set("month", 1).format(); // "2026-01-19 14:30:00"
d.set("hour", 0).format(); // "2026-08-19 00:30:00"
```

## Comparing Dates

Every comparison accepts a `Time`, `Date`, timestamp, or date string.

```ts
date.isBefore(other); // boolean
date.isAfter(other); // boolean
date.isSame(other); // boolean (exact millisecond)
date.isSameOrBefore(other); // boolean
date.isSameOrAfter(other); // boolean
```

`isSame` takes an optional granularity:

```ts
date.isSame("2026-08-19T09:00:00", "day"); // true  (same calendar day)
date.isSame("2026-01-01", "year"); // true  (same year)
```

`isBetween` supports inclusivity (`[`/`]` include the edge, `(`/`)` exclude it; default `"()"`):

```ts
date.isBetween("2026-08-01", "2026-08-31"); // true
date.isBetween("2026-08-19", "2026-08-31", "[)"); // include the start edge
```

Because `Time` implements `valueOf()`, native operators work too:

```ts
time("2026-08-19T10:00:00") < time("2026-08-19T12:00:00"); // true
```

## Calendar Queries

```ts
time().isToday(); // boolean
time().isTomorrow(); // boolean
time().isYesterday(); // boolean
time().add(1, "hours").isFuture(); // true
time().subtract(1, "hours").isPast(); // true
time("2026-08-22").isWeekend(); // true (Saturday)
time("2026-08-19").isWeekday(); // true (Wednesday)
time("2028-01-01").isLeapYear(); // true
```

## Start and End of a Unit

```ts
type StartEndUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";
```

```ts
const d = time("2026-08-19T14:35:42"); // a Wednesday

d.startOf("day").format(); // "2026-08-19 00:00:00"
d.startOf("week").format(); // "2026-08-16 00:00:00" (Sunday)
d.startOf("month").format(); // "2026-08-01 00:00:00"

d.endOf("day").format(); // "2026-08-19 23:59:59"
d.endOf("month").format(); // "2026-08-31 23:59:59"
```

Weeks start on Sunday. `endOf("month")` and `endOf("year")` account for actual month lengths and leap years.

`.round(unit)` snaps to the **nearest** boundary instead of down or up (ties round up):

```ts
time("2026-08-19T14:39").round("hour").to24Hour(); // "15:00"
time("2026-08-19T14:20").round("hour").to24Hour(); // "14:00"
```

## Ranges

`.range(end, unit?, step?)` returns an inclusive array of `Time` instances. Direction is inferred, so `end` can be earlier or later, and you can set the step size.

```ts
time("2026-08-19").range("2026-08-22"); // [19th, 20th, 21st, 22nd] (unit defaults to "days")
time("2026-01-15").range("2026-04-15", "months"); // 4 monthly instances
time("2026-08-19").range("2026-08-25", "days", 2); // every 2nd day
time("2026-08-22").range("2026-08-20"); // counts down: [22nd, 21st, 20th]
```

## Clamp

`.clamp(min, max)` constrains an instance to a range — handy for date pickers and bounds checking.

```ts
time("2026-01-01").clamp("2026-08-01", "2026-08-31").format("YYYY-MM-DD"); // "2026-08-01"
time("2026-12-01").clamp("2026-08-01", "2026-08-31").format("YYYY-MM-DD"); // "2026-08-31"
time("2026-08-15").clamp("2026-08-01", "2026-08-31").format("YYYY-MM-DD"); // "2026-08-15"
```

## Difference Between Dates

```ts
type DiffUnit =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "quarters"
  | "years";
```

Fixed-length units return a floating-point value; `months`, `quarters`, and `years` return whole counts truncated toward zero (the way people count calendar months).

```ts
const start = time("2026-08-19T10:00:00");
const end = time("2026-08-19T10:30:00");

end.diff(start, "hours"); // 0.5
start.diff(end, "hours"); // -0.5
time("2026-03-15").diff("2026-01-15", "months"); // 2
```

For a full human-readable breakdown, `.preciseDiff(other)` returns each calendar component (always non-negative, with real month lengths — never "32 days"):

```ts
time("2024-01-15T10:00:00").preciseDiff("2026-03-20T13:30:45");
// { years: 2, months: 2, days: 5, hours: 3, minutes: 30, seconds: 45 }
```

## Conversion & Serialization

```ts
const d = time("2026-08-19T14:30:00");

d.clone(); // a new, independent Time
d.toDate(); // a detached native Date
d.valueOf(); // milliseconds since epoch (also powers <, >, Number())
d.unix(); // seconds since epoch
d.toISOString(); // "2026-08-19T14:30:00.000Z"
d.toString(); // default format, used by String() and template literals
JSON.stringify({ at: d }); // d serializes to its ISO string

d.toObject();
// { year: 2026, month: 8, date: 19, hour: 14, minute: 30, second: 0, millisecond: 0 }
d.toArray(); // [2026, 8, 19, 14, 30, 0, 0]  (month is 1–12)
```

## Static Helpers

```ts
import { Time } from "timeatom";

Time.now(); // same as time()
Time.unix(1755612600); // from a Unix timestamp in seconds
Time.fromFormat("19/08/2026", "DD/MM/YYYY"); // parse with an explicit format
Time.isTime(value); // type guard: is this a Time instance?
Time.isValid("2026-13-45"); // false — validate without throwing
Time.min("2026-05-01", "2026-01-01", "2026-09-01"); // earliest
Time.max("2026-05-01", "2026-01-01", "2026-09-01"); // latest
```

## API Reference

| Method                                | Returns   | Description                                               |
| ------------------------------------- | --------- | -------------------------------------------------------- |
| `time(value?, format?)`               | `Time`    | Create a `Time` from a Date, timestamp, string (optionally with a format), or Time. |
| `Time.now()`                          | `Time`    | Current date/time.                                       |
| `Time.unix(seconds)`                  | `Time`    | From a Unix timestamp in seconds.                        |
| `Time.fromFormat(input, format)`      | `Time`    | Parse a string with an explicit format.                  |
| `Time.isValid(value)`                 | `boolean` | Whether the input parses to a valid date.                |
| `Time.isTime(value)`                  | `boolean` | Type guard for `Time` instances.                         |
| `Time.min(...values)` / `.max(...)`   | `Time`    | Earliest / latest of the inputs.                         |
| `.format(pattern?)`                   | `string`  | Format using the token table.                            |
| `.to12Hour()` / `.to24Hour()`         | `string`  | `"02:05 PM"` / `"14:05"`.                                 |
| `.fromNow(withoutSuffix?)` / `.from(other, …)` | `string` | Relative time from now / another date.          |
| `.toNow(withoutSuffix?)` / `.to(other, …)` | `string` | Inverse relative time.                              |
| `.calendar(reference?)`               | `string`  | Friendly phrase ("Today at 2:30 PM").                    |
| `.add(amount, unit)` / `.subtract(…)` | `Time`    | Date math.                                               |
| `.set(unit, value)` / `.get(unit)`    | `Time` / `number` | Set / read one component (month 1–12).           |
| `.startOf(unit)` / `.endOf(unit)`     | `Time`    | Snap to the start / end of a unit.                       |
| `.round(unit)`                        | `Time`    | Round to the nearest unit.                               |
| `.range(end, unit?, step?)`           | `Time[]`  | Inclusive array of instances between two dates.          |
| `.clamp(min, max)`                    | `Time`    | Constrain to a range.                                    |
| `.year()` … `.millisecond()`          | `number`  | Component getters (month 1–12).                          |
| `.quarter()` / `.week()` / `.isoWeekday()` | `number` | Quarter (1–4) / ISO week / ISO weekday (1–7).       |
| `.dayOfYear()` / `.daysInMonth()` / `.daysInYear()` | `number` | Calendar helpers.                          |
| `.utcOffset()`                        | `number`  | Minutes from UTC.                                        |
| `.dayName(short?)` / `.monthName(short?)` | `string` | Weekday / month name.                                 |
| `.isBefore/.isAfter/.isSame(…)`       | `boolean` | Comparisons (`isSame` takes a granularity).              |
| `.isSameOrBefore/.isSameOrAfter(…)`   | `boolean` | Inclusive comparisons.                                   |
| `.isBetween(start, end, inclusivity?)`| `boolean` | Range check.                                             |
| `.isToday/.isTomorrow/.isYesterday()` | `boolean` | Calendar-day checks.                                     |
| `.isPast()` / `.isFuture()`           | `boolean` | Whether it is before / after now.                        |
| `.isWeekend/.isWeekday/.isLeapYear()` | `boolean` | Calendar queries.                                        |
| `.diff(other, unit)`                  | `number`  | Difference in a unit.                                    |
| `.preciseDiff(other)`                 | `object`  | `{ years, months, days, hours, minutes, seconds }`.      |
| `.clone()` / `.toDate()`              | `Time`/`Date` | Copy / detach.                                       |
| `.valueOf()` / `.unix()`              | `number`  | Epoch milliseconds / seconds.                            |
| `.toObject()` / `.toArray()`          | `object`/`array` | Component object / array (month 1–12).            |
| `.toISOString()` / `.toJSON()` / `.toString()` | `string` | Serialization.                                  |

## Project Structure

```
src/
  index.ts          Public entry — the time() factory and exports
  Time.ts           The immutable Time class (thin orchestrator)
  types.ts          Shared public types
  constants.ts      Unit sizes, month & day names
  core/
    parse.ts        Input → Date normalization
    parseFormat.ts  Custom-format string parsing
    format.ts       Token formatting
    manipulate.ts   add / subtract, month & year overflow
    boundary.ts     startOf / endOf
    diff.ts         Calendar-aware differences
    preciseDiff.ts  Human-readable component breakdown
    relative.ts     Human-readable relative time
    calendar.ts     Friendly calendar phrases
    week.ts         ISO week & quarter helpers
```

The `Time` class stays a thin orchestrator; each concern lives in its own small, testable pure-function module under `core/`.

## License

MIT
