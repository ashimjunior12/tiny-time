import { formatDate } from "./format.js";
import { startOf } from "./boundary.js";

/**
 * A friendly, moment-style calendar phrase relative to `reference`.
 *
 * Same day → "Today at 2:30 PM", ±1 day → "Tomorrow/Yesterday at …",
 * within the next/previous week → "Sunday at …" / "Last Sunday at …",
 * anything further → "MM/DD/YYYY".
 */
export function calendar(date: Date, reference: Date): string {
  const startReference = startOf(reference, "day").getTime();
  const startDate = startOf(date, "day").getTime();
  const dayDiff = Math.round((startDate - startReference) / 86_400_000);

  const at = formatDate(date, "h:mm A");

  if (dayDiff === 0) return `Today at ${at}`;
  if (dayDiff === 1) return `Tomorrow at ${at}`;
  if (dayDiff === -1) return `Yesterday at ${at}`;
  if (dayDiff > 1 && dayDiff < 7) return formatDate(date, "dddd [at] h:mm A");
  if (dayDiff < -1 && dayDiff > -7) {
    return formatDate(date, "[Last] dddd [at] h:mm A");
  }

  return formatDate(date, "MM/DD/YYYY");
}
