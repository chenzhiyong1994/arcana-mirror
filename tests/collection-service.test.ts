import { describe, expect, it } from "vitest";
import { CollectionService } from "../apps/miniprogram/core/collection-service";
import { MemoryCardCollectionRepository } from "../apps/miniprogram/core/memory-collection-repository";

function createCollectionService() {
  const repository = new MemoryCardCollectionRepository();
  const service = new CollectionService({
    repository,
    now: () => new Date("2026-07-21T12:00:00.000Z"),
  });
  return { service, repository };
}

describe("CollectionService", () => {
  it("unlocks a card and tracks upright and reversed reveals", () => {
    const { service } = createCollectionService();
    service.recordReveal("major-09", "upright");
    service.recordReveal("major-09", "reversed");
    const card = service.listCatalog().find((item) => item.id === "major-09");
    expect(service.getProgress()).toEqual({ discovered: 1, total: 22 });
    expect(card?.revealCount).toBe(2);
    expect(card?.orientationProgress).toBe("正位 / 逆位");
  });

  it("clears collection progress independently", () => {
    const { service } = createCollectionService();
    service.recordReveal("major-21", "upright");
    service.clear();
    expect(service.getProgress().discovered).toBe(0);
  });
});
