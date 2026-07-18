const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function toShanghaiBusinessDate(date: Date): string {
  return new Date(date.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}
