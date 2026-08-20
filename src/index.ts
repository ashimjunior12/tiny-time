import { Time } from "./Time.js";

export function time(value?: string | Date): Time {
  return new Time(value);
}

export { Time };

export type { TimeUnit } from "./Time.js";
