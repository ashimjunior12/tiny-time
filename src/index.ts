import { Time } from "./Time.js";

export { Time } from "./Time.js";
export type { TimeUnit } from "./Time.js";

export function time(value?: string | Date): Time {
  return new Time(value);
}
