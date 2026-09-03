import { Time } from "./Time.js";

export { Time };
export type { TimeUnit } from "./types.js";

export function time(value?: string | Date): Time {
  return new Time(value);
}
