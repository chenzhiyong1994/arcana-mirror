import type { Reading, ReadingRepository } from "./types";

function cloneReading(reading: Reading): Reading {
  return JSON.parse(JSON.stringify(reading)) as Reading;
}

export class MemoryReadingRepository implements ReadingRepository {
  private saved = new Map<string, Reading>();
  private working?: Reading;

  listSaved(): Reading[] {
    return [...this.saved.values()]
      .map(cloneReading)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  findSavedById(id: string): Reading | undefined {
    const reading = this.saved.get(id);
    return reading ? cloneReading(reading) : undefined;
  }

  findDaily(businessDate: string): Reading | undefined {
    const reading = [...this.saved.values()].find((item) => item.type === "daily" && item.businessDate === businessDate);
    return reading ? cloneReading(reading) : undefined;
  }

  save(reading: Reading): void {
    this.saved.set(reading.id, cloneReading(reading));
  }

  delete(id: string): void {
    this.saved.delete(id);
    if (this.working?.id === id) this.working = undefined;
  }

  clearSaved(): void {
    this.saved.clear();
  }

  getWorking(): Reading | undefined {
    return this.working ? cloneReading(this.working) : undefined;
  }

  setWorking(reading: Reading): void {
    this.working = cloneReading(reading);
  }

  clearWorking(id?: string): void {
    if (!id || this.working?.id === id) this.working = undefined;
  }
}
