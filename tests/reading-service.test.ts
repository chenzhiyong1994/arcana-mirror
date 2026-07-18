import { describe, expect, it } from "vitest";
import { TAROT_CARDS } from "../apps/miniprogram/core/cards";
import { MemoryReadingRepository } from "../apps/miniprogram/core/memory-repository";
import { MockInterpretationProvider } from "../apps/miniprogram/core/mock-provider";
import { ReadingService } from "../apps/miniprogram/core/reading-service";

function createService(randomValues = [0.4, 0.4, 0.4]) {
  const repository = new MemoryReadingRepository();
  let index = 0;
  const service = new ReadingService({
    repository,
    provider: new MockInterpretationProvider(),
    now: () => new Date("2026-07-19T03:00:00.000Z"),
    random: () => randomValues[index++] ?? 0.4,
  });
  return { service, repository };
}

describe("ReadingService", () => {
  it("reuses the same daily reading on the same Shanghai business date", () => {
    const { service } = createService();
    const first = service.startDaily();
    const second = service.startDaily();
    expect(second.id).toBe(first.id);
    expect(service.listHistory()).toHaveLength(1);
    expect(first.saved).toBe(true);
  });

  it("does not add a question reading to history before explicit save", async () => {
    const { service } = createService();
    const reading = service.startQuestion("self", "我该如何理解最近的犹豫？");
    const interpreted = await service.interpretQuestion(reading.id, "success");
    expect(interpreted.interpretation?.source).toBe("mock");
    expect(service.listHistory()).toHaveLength(0);
    service.saveQuestionToHistory(reading.id);
    expect(service.listHistory()).toHaveLength(1);
  });

  it("rejects saving a question before an interpretation exists", () => {
    const { service } = createService();
    const reading = service.startQuestion("self", "我该如何理解最近的犹豫？");
    expect(() => service.saveQuestionToHistory(reading.id)).toThrow("READING_NOT_SAVABLE");
  });

  it("discards an unsaved question when the flow ends", async () => {
    const { service, repository } = createService();
    const reading = service.startQuestion("self", "我该如何理解最近的犹豫？");
    await service.interpretQuestion(reading.id, "success");
    service.discardQuestion(reading.id);
    expect(repository.getWorking()).toBeUndefined();
    expect(service.listHistory()).toHaveLength(0);
  });

  it.each(["timeout", "invalid", "unsafe"] as const)("falls back for mock mode %s", async (mode) => {
    const { service } = createService();
    const reading = service.startQuestion("career", "我该如何看待现在工作的停滞？");
    const interpreted = await service.interpretQuestion(reading.id, mode);
    expect(interpreted.status).toBe("fallback_completed");
    expect(interpreted.interpretation?.source).toBe("fallback");
  });

  it("can draw every card with injected random values", () => {
    const seen = new Set<string>();
    for (let index = 0; index < TAROT_CARDS.length; index += 1) {
      const cardRandom = (index + 0.1) / TAROT_CARDS.length;
      const { service } = createService([cardRandom, 0.25, 0.25]);
      seen.add(service.startQuestion("self", "我该如何理解当下的选择？").cards[0].cardId);
    }
    expect(seen.size).toBe(TAROT_CARDS.length);
  });

  it("deletes saved local history", async () => {
    const { service } = createService();
    const reading = service.startQuestion("relationship", "我该如何理解这段关系的变化？");
    await service.interpretQuestion(reading.id, "success");
    service.saveQuestionToHistory(reading.id);
    service.deleteHistory(reading.id);
    expect(service.listHistory()).toHaveLength(0);
  });

  it("clears all saved local history", async () => {
    const { service } = createService();
    service.startDaily();
    const reading = service.startQuestion("relationship", "我该如何理解这段关系的变化？");
    await service.interpretQuestion(reading.id, "success");
    service.saveQuestionToHistory(reading.id);
    expect(service.listHistory()).toHaveLength(2);
    service.clearHistory();
    expect(service.listHistory()).toHaveLength(0);
  });
});
