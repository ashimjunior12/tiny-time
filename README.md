# Time

A lightweight, dependency free date and time utility for JavaScript and TypeScript. It wraps the native `Date` object with an immutable, chainable API for formatting, adding or subtracting time, comparing dates, and finding differences between them.

## Installation

```bash
npm install timeatom
```

## Quick Start

```ts
import { time } from "timeatom";

const now = time();
const someDate = time("2026-08-19T14:30:00");
const fromDateObject = time(new Date());

console.log(someDate.format()); // "2026-08-19 14:30:00"
```

The `time()` function accepts a `Date` object, a date string, or no argument at all (defaults to the current date and time), and always returns a new `Time` instance.

## Immutability

Every method that changes a date, such as `add`, `subtract`, `startOf`, and `endOf`, returns a brand new `Time` instance. The original instance is never modified.

```ts
const date = time("2026-08-19T14:30:00");
const future = date.add(2, "days");

date.format(); // "2026-08-19 14:30:00" (unchanged)
future.format(); // "2026-08-21 14:30:00"
```

If you pass in a `Date` object, it is cloned internally, so mutating the original `Date` afterward will not affect the `Time` instance.

## Formatting

Use `.format(pattern)` to turn a `Time` instance into a string. If no pattern is given, it defaults to `"YYYY-MM-DD HH:mm:ss"`.

### Supported Tokens

| Token | Meaning              | Example |
| ----- | -------------------- | ------- |
| YYYY  | Full year            | 2026    |
| YY    | Two digit year       | 26      |
| MM    | Month (01 to 12)     | 08      |
| DD    | Day of month         | 19      |
| HH    | Hour, 24 hour format | 14      |
| hh    | Hour, 12 hour format | 02      |
| mm    | Minutes              | 30      |
| ss    | Seconds              | 45      |
| A     | AM or PM, uppercase  | PM      |
| a     | am or pm, lowercase  | pm      |

```ts
const date = time("2026-08-19T14:30:00");

date.format(); // "2026-08-19 14:30:00"
date.format("YYYY/MM/DD"); // "2026/08/19"
date.format("hh:mm A"); // "02:30 PM"
```

### Convenience Formatters

```ts
date.to12Hour(); // "02:30 PM"
date.to24Hour(); // "14:30"
```

## Adding and Subtracting Time

```ts
date.add(2, "days");
date.subtract(1, "months");
```

Both methods accept an `amount` and a `unit` of type `TimeUnit`:

```ts
type TimeUnit = "seconds" | "minutes" | "hours" | "days" | "months" | "years";
```

### Month and Year Overflow Handling

Adding months or years keeps the resulting day within the bounds of the target month, instead of letting native `Date` overflow into the next month.

```ts
time("2026-01-31").add(1, "months").format("YYYY-MM-DD"); // "2026-02-28"
time("2028-01-31").add(1, "months").format("YYYY-MM-DD"); // "2028-02-29"
time("2024-02-29").add(1, "years").format("YYYY-MM-DD"); // "2025-02-28"
time("2028-02-29").subtract(1, "years").format("YYYY-MM-DD"); // "2027-02-28"
```

## Comparing Dates

```ts
date.isBefore(otherDate); // boolean
date.isAfter(otherDate); // boolean
date.isSame(otherDate); // boolean
```

Each of these accepts another `Time` instance, a `Date` object, or a date string.

```ts
const date = time("2026-08-19T14:30:00");

date.isBefore("2026-08-20T14:30:00"); // true
```

## Start and End of a Unit

`.startOf(unit)` and `.endOf(unit)` return a new `Time` instance set to the very beginning or end of the given unit.

```ts
type StartEndUnit = "second" | "minute" | "hour" | "day" | "month" | "year";
```

```ts
const date = time("2026-08-19T14:35:42");

date.startOf("day").format(); // "2026-08-19 00:00:00"
date.startOf("month").format(); // "2026-08-01 00:00:00"
date.startOf("year").format(); // "2026-01-01 00:00:00"

date.endOf("day").format(); // "2026-08-19 23:59:59"
date.endOf("month").format(); // "2026-08-31 23:59:59"
date.endOf("year").format(); // "2026-12-31 23:59:59"
```

`endOf("month")` and `endOf("year")` correctly account for the actual number of days in the month or year, including leap years.

```ts
time("2028-02-15T14:35:42").endOf("month").format(); // "2028-02-29 23:59:59"
```

## Finding the Difference Between Dates

```ts
end.diff(start, unit); // number
```

```ts
type DiffUnit = "seconds" | "minutes" | "hours" | "days";
```

The result is a floating point number of the given unit. It is calculated by subtracting the two timestamps in milliseconds and dividing by the length of the unit, so partial and negative differences are both supported.

```ts
const start = time("2026-08-19T10:00:00");
const end = time("2026-08-19T10:30:00");

end.diff(start, "hours"); // 0.5
start.diff(end, "hours"); // -0.5
```

## Leap Year Check

```ts
time("2028-01-01").isLeapYear(); // true
time("2025-01-01").isLeapYear(); // false
```

## Error Handling

Passing a string that cannot be parsed into a valid date throws an error.

```ts
time("invalid-date"); // throws: Invalid date
```

## API Reference

| Method                    | Description                                                                     | Returns   |
| ------------------------- | ------------------------------------------------------------------------------- | --------- |
| `time(value?)`            | Creates a new `Time` instance from a `Date`, string, or nothing (current time). | `Time`    |
| `.format(pattern?)`       | Formats the date using the token table above.                                   | `string`  |
| `.to12Hour()`             | Formats as 12 hour time, e.g. `"02:30 PM"`.                                     | `string`  |
| `.to24Hour()`             | Formats as 24 hour time, e.g. `"14:30"`.                                        | `string`  |
| `.add(amount, unit)`      | Returns a new instance with time added.                                         | `Time`    |
| `.subtract(amount, unit)` | Returns a new instance with time subtracted.                                    | `Time`    |
| `.isLeapYear()`           | Checks if the instance's year is a leap year.                                   | `boolean` |
| `.isBefore(other)`        | Checks if the instance is before another date.                                  | `boolean` |
| `.isAfter(other)`         | Checks if the instance is after another date.                                   | `boolean` |
| `.isSame(other)`          | Checks if the instance is the same as another date.                             | `boolean` |
| `.startOf(unit)`          | Returns a new instance set to the start of the given unit.                      | `Time`    |
| `.endOf(unit)`            | Returns a new instance set to the end of the given unit.                        | `Time`    |
| `.diff(other, unit)`      | Returns the numeric difference between two dates in the given unit.             | `number`  |

## Types

```ts
export type TimeUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years";

export type StartEndUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year";

export type DiffUnit = "seconds" | "minutes" | "hours" | "days";
```
