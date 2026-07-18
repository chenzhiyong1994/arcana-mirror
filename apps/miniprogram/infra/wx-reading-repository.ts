import type { Reading, ReadingRepository } from "../core/types";

const HISTORY_KEY = "arcana_mirror_history_v1";
const WORKING_KEY = "arcana_mirror_working_v1";

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Reading>;
  return typeof candidate.id === "string" && Array.isArray(candidate.cards) && typeof candidate.saved === "boolean";
}

export class WxReadingRepository implements ReadingRepository {
  listSaved(): Reading[] {
    const raw = wx.getStorageSync<unknown>(HISTORY_KEY);
    if (!Array.isArray(raw)) return [];
    return raw.filter(isReading).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  findSavedById(id: string): Reading | undefined {
    return this.listSaved().find((item) => item.id === id);
  }

  findDaily(businessDate: string): Reading | undefined {
    return this.listSaved().find((item) => item.type === "daily" && item.businessDate === businessDate);
  }

  save(reading: Reading): void {
    const readings = this.listSaved();
    const index = readings.findIndex((item) => item.id === reading.id);
    if (index >= 0) readings[index] = reading;
    else readings.push(reading);
    wx.setStorageSync(HISTORY_KEY, readings);
  }

  delete(id: string): void {
    wx.setStorageSync(HISTORY_KEY, this.listSaved().filter((item) => item.id !== id));
    this.clearWorking(id);
  }

  clearSaved(): void {
    wx.removeStorageSync(HISTORY_KEY);
  }

  getWorking(): Reading | undefined {
    const raw = wx.getStorageSync<unknown>(WORKING_KEY);
    return isReading(raw) ? raw : undefined;
  }

  setWorking(reading: Reading): void {
    wx.setStorageSync(WORKING_KEY, reading);
  }

  clearWorking(id?: string): void {
    const current = this.getWorking();
    if (!id || current?.id === id) wx.removeStorageSync(WORKING_KEY);
  }
}
