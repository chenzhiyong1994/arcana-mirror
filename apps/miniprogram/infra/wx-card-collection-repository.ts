import type { CardCollectionRepository, CardDiscovery } from "../core/types";

const COLLECTION_KEY = "arcana_mirror_collection_v1";

function isDiscovery(value: unknown): value is CardDiscovery {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CardDiscovery>;
  return typeof candidate.cardId === "string"
    && typeof candidate.firstRevealedAt === "string"
    && typeof candidate.lastRevealedAt === "string"
    && typeof candidate.revealCount === "number"
    && typeof candidate.uprightSeen === "boolean"
    && typeof candidate.reversedSeen === "boolean";
}

export class WxCardCollectionRepository implements CardCollectionRepository {
  list(): CardDiscovery[] {
    const raw = wx.getStorageSync<unknown>(COLLECTION_KEY);
    return Array.isArray(raw) ? raw.filter(isDiscovery) : [];
  }

  save(discovery: CardDiscovery): void {
    const discoveries = this.list();
    const index = discoveries.findIndex((item) => item.cardId === discovery.cardId);
    if (index >= 0) discoveries[index] = discovery;
    else discoveries.push(discovery);
    wx.setStorageSync(COLLECTION_KEY, discoveries);
  }

  clear(): void {
    wx.removeStorageSync(COLLECTION_KEY);
  }
}
