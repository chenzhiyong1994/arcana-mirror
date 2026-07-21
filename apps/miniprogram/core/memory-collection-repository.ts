import type { CardCollectionRepository, CardDiscovery } from "./types";

function cloneDiscovery(discovery: CardDiscovery): CardDiscovery {
  return { ...discovery };
}

export class MemoryCardCollectionRepository implements CardCollectionRepository {
  private discoveries = new Map<string, CardDiscovery>();

  list(): CardDiscovery[] {
    return [...this.discoveries.values()].map(cloneDiscovery);
  }

  save(discovery: CardDiscovery): void {
    this.discoveries.set(discovery.cardId, cloneDiscovery(discovery));
  }

  clear(): void {
    this.discoveries.clear();
  }
}
