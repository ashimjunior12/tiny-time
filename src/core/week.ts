/**
 * ISO 8601 week number (1-53).
 *
 * Weeks start on Monday and week 1 is the week containing the year's first
 * Thursday, so late-December and early-January dates can belong to the
 * neighbouring year's week — matching the ISO standard.
 */
export function isoWeek(date: Date): number {
  // Work in UTC to avoid daylight-saving skew, stripped to the date.
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  // Shift to the Thursday of this week (Mon=1 … Sun=7).
  const isoDay = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - isoDay);

  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const days = (utc.getTime() - yearStart.getTime()) / 86_400_000;

  return Math.ceil((days + 1) / 7);
}

/** Quarter of the year for a date, 1 through 4. */
export function quarterOf(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}
