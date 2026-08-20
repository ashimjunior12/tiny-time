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
      // date.setDate(date.getMonth() + amount);
      Time.addMonths(date, amount);
    },

    years: (date, amount) => {
      // date.setDate(date.getFullYear() + amount);
      Time.addYears(date, amount);
    },
  };

  private static addMonths(date: Date, amount: number): void {
    const originalDate = date.getDate();

    date.setDate(1);
    date.setMonth(date.getMonth() + amount);

    const lastDayOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    date.setDate(Math.min(originalDate, lastDayOfMonth));
  }

  private static addYears(date: Date, amount: number): void {
    Time.addMonths(date, amount * 12);
  }

  // private formatToken(token: string): string {
  //   // convert one token to its value
  // }
  // format(pattern?: string): string {
  //   // process the pattern
  // }

  constructor(value?: string | Date) {
    this.date =
      value instanceof Date ? new Date(value.getTime())
      : value ? new Date(value)
      : new Date();
  }

  format(format?: string): string {
    const year = this.date.getFullYear();

    const month = String(this.date.getMonth() + 1).padStart(2, "0");

    const day = String(this.date.getDate()).padStart(2, "0");

    const hours = String(this.date.getHours()).padStart(2, "0");

    const minutes = String(this.date.getMinutes()).padStart(2, "0");

    const seconds = String(this.date.getSeconds()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;

      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      case "HH:mm:ss":
        return `${hours}:${minutes}:${seconds}`;

      case "YYYY/MM/DD":
        return `${year}/${month}/${day}`;

      default:
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }

  add(amount: number, unit: TimeUnit): Time {
    const newDate = new Date(this.date.getTime());

    Time.unitMap[unit](newDate, amount);

    return new Time(newDate);
  }

  subtract(amount: number, unit: TimeUnit): Time {
    return this.add(-amount, unit);
  }

  isLeapYear(date: Date | string): boolean {
    const year =
      typeof date === "string" ?
        new Date(date).getFullYear()
      : date.getFullYear();

    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
}
