export type TimeUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years";

export class Time {
  private readonly date: Date;

  private static readonly unitMap: Record<
    TimeUnit,
    (date: Date, amount: number) => void
  > = {
    seconds: (date, amount) => {
      date.setSeconds(date.getSeconds() + amount);
    },

    minutes: (date, amount) => {
      date.setMinutes(date.getMinutes() + amount);
    },

    hours: (date, amount) => {
      date.setHours(date.getHours() + amount);
    },

    days: (date, amount) => {
      date.setDate(date.getDate() + amount);
    },

    months: (date, amount) => {
      Time.addMonths(date, amount);
    },

    years: (date, amount) => {
      Time.addYears(date, amount);
    },
  };

  private static parse(value?: string | Date): Date {
    if (value === undefined) {
      return new Date();
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    const date = new Date(value);
    return date;
  }

  constructor(value?: string | Date) {
    this.date = Time.parse(value);
    this.validateDate();
  }

  /**
   * Adds months while keeping the day within the target month.
   *
   * Example:
   * 2026-01-31 + 1 month → 2026-02-28
   */
  private static addMonths(date: Date, amount: number): void {
    const originalDay = date.getDate();

    // Prevent JavaScript Date from overflowing
    // when the current day doesn't exist in the target month.
    date.setDate(1);

    date.setMonth(date.getMonth() + amount);

    const lastDayOfTargetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    date.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  }

  /**
   * Adds years while correctly handling leap days.
   *
   * Example:
   * 2028-02-29 + 1 year → 2029-02-28
   */
  private static addYears(date: Date, amount: number): void {
    Time.addMonths(date, amount * 12);
  }

  private static pad(value: number): string {
    return String(value).padStart(2, "0");
  }

  private validateDate(): void {
    if (Number.isNaN(this.date.getTime())) {
      throw new Error("Invalid date");
    }
  }

  /**
   * Formats the current date/time.
   *
   * Supported tokens:
   *
   * YYYY → 2026
   * YY   → 26
   * MM   → 08
   * DD   → 19
   * HH   → 14
   * hh   → 02
   * mm   → 30
   * ss   → 45
   * A    → PM
   * a    → pm
   */
  format(pattern = "YYYY-MM-DD HH:mm:ss"): string {
    const hours = this.date.getHours();

    const hour12 = hours % 12 || 12;

    const period = hours < 12 ? "AM" : "PM";

    const tokens: Record<string, string> = {
      YYYY: String(this.date.getFullYear()),
      YY: String(this.date.getFullYear()).slice(-2),

      MM: Time.pad(this.date.getMonth() + 1),
      DD: Time.pad(this.date.getDate()),

      HH: Time.pad(hours),
      hh: Time.pad(hour12),

      mm: Time.pad(this.date.getMinutes()),
      ss: Time.pad(this.date.getSeconds()),

      A: period,
      a: period.toLowerCase(),
    };

    const tokenRegex = new RegExp(
      Object.keys(tokens)
        .sort((a, b) => b.length - a.length)
        .join("|"),
      "g",
    );

    return pattern.replace(tokenRegex, (token) => tokens[token]);
  }

  /**
   * Adds an amount of time/date units.
   */
  add(amount: number, unit: TimeUnit): Time {
    const newDate = new Date(this.date.getTime());

    Time.unitMap[unit](newDate, amount);

    return new Time(newDate);
  }

  /**
   * Subtracts an amount of time/date units.
   */
  subtract(amount: number, unit: TimeUnit): Time {
    return this.add(-amount, unit);
  }

  /**
   * Checks whether the current year is a leap year.
   */
  isLeapYear(): boolean {
    const year = this.date.getFullYear();

    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Returns the current time in 12-hour format.
   *
   * Example:
   * 14:30 → "02:30 PM"
   */
  to12Hour(): string {
    return this.format("hh:mm A");
  }

  /**
   * Returns the current time in 24-hour format.
   *
   * Example:
   * 14:30 → "14:30"
   */
  to24Hour(): string {
    return this.format("HH:mm");
  }
}
