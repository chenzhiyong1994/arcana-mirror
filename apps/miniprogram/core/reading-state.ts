import type { Reading, ReadingStatus } from "./types";

const ALLOWED_TRANSITIONS: Record<ReadingStatus, readonly ReadingStatus[]> = {
  drawn: ["generating", "completed"],
  generating: ["completed", "fallback_completed", "failed"],
  completed: [],
  fallback_completed: [],
  blocked: [],
  failed: [],
};

export function transitionReading(reading: Reading, nextStatus: ReadingStatus): void {
  if (reading.status === nextStatus) return;
  if (!ALLOWED_TRANSITIONS[reading.status].includes(nextStatus)) {
    throw new Error(`ILLEGAL_READING_TRANSITION:${reading.status}->${nextStatus}`);
  }
  reading.status = nextStatus;
}
