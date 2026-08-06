import { describe, expect, it } from "vitest";
import { TAROT_CARDS } from "../apps/miniprogram/core/cards";
import { MemoryReadingRepository } from "../apps/miniprogram/core/memory-repository";
import { MockInterpretationProvider } from "../apps/miniprogram/core/mock-provider";
import { ReadingService } from "../apps/miniprogram/core/reading-service";
import type { MockMode } from "../apps/miniprogram/core/types";

function createService(randomValues = [0.4, 0.4, 0.4], mode: MockMode = "success") {
  const repository = new MemoryReadingRepository();
  let index = 0;
  const service = new ReadingService({
    repository,
    provider: new MockInterpretationProvider(mode),
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

  it("automatically keeps a completed question in recent history", async () => {
    const { service, repository } = createService();
    const reading = service.startQuestion("我该如何理解最近的犹豫？");
    const interpreted = await service.interpretQuestion(reading.id);
    expect(interpreted.interpretation?.source).toBe("mock");
    expect(interpreted.saved).toBe(true);
    expect(service.listHistory()).toHaveLength(1);
    expect(repository.getWorking()).toBeUndefined();
  });

  it("starts a three-card life reading without asking for a question", () => {
    const { service } = createService([0.1, 0.2, 0.3, 0.8, 0.6, 0.3, 0.4]);
    const reading = service.startLifeReading("three");

    expect(reading.focusMode).toBe("life");
    expect(reading.question).toBeUndefined();
    expect(reading.cards).toHaveLength(3);
  });

  it("keeps wealth, career and love behind three fixed directions for life readings", async () => {
    const { service } = createService();
    const reading = service.startLifeReading();
    const interpreted = await service.interpretQuestion(reading.id);

    expect(interpreted.interpretation?.content.cards[0].directionInsights?.map((item) => item.label)).toEqual([
      "财运",
      "事业",
      "爱情",
    ]);
  });

  it("keeps only the 30 most recent completed readings", async () => {
    const repository = new MemoryReadingRepository();
    let tick = 0;
    const service = new ReadingService({
      repository,
      provider: new MockInterpretationProvider("success"),
      now: () => new Date(Date.UTC(2026, 6, 19, 3, 0, tick++)),
      random: () => 0.4,
    });
    const ids: string[] = [];

    for (let index = 0; index < 31; index += 1) {
      const reading = service.startQuestion(`第 ${index + 1} 次照见`);
      ids.push(reading.id);
      await service.interpretQuestion(reading.id);
    }

    const history = service.listHistory();
    expect(history).toHaveLength(30);
    expect(history[0].id).toBe(ids[30]);
    expect(history.some((reading) => reading.id === ids[0])).toBe(false);
  });

  it("draws three unique cards and returns position-aware focused interpretations", async () => {
    const { service } = createService([0.1, 0.2, 0.1, 0.8, 0.6, 0.3, 0.4]);
    const reading = service.startQuestion("我该如何理解这段关系的变化？", "three");
    expect(reading.cards).toHaveLength(3);
    expect(new Set(reading.cards.map((card) => card.cardId)).size).toBe(3);
    const interpreted = await service.interpretQuestion(reading.id);
    expect(interpreted.interpretation?.content.cards.map((card) => card.positionLabel)).toEqual([
      "现状",
      "关键影响",
      "行动建议",
    ]);
    expect(interpreted.interpretation?.content.cards[0].topicLabel).toBe("你的问题");
    expect(interpreted.interpretation?.content.cards[0].topicInsight).toBeTruthy();
    expect(interpreted.interpretation?.content.cards[0].wealthInsight).toBeUndefined();
  });

  it("rejects saving a question before an interpretation exists", () => {
    const { service } = createService();
    const reading = service.startQuestion("我该如何理解最近的犹豫？");
    expect(() => service.saveQuestionToHistory(reading.id)).toThrow("READING_NOT_SAVABLE");
  });

  it("keeps auto-saved history when the completed flow ends", async () => {
    const { service, repository } = createService();
    const reading = service.startQuestion("我该如何理解最近的犹豫？");
    await service.interpretQuestion(reading.id);
    service.discardQuestion(reading.id);
    expect(repository.getWorking()).toBeUndefined();
    expect(service.listHistory()).toHaveLength(1);
  });

  it.each(["timeout", "invalid", "unsafe"] as const)("falls back for mock mode %s", async (mode) => {
    const { service } = createService([0.4, 0.4, 0.4], mode);
    const reading = service.startQuestion("我该如何看待现在工作的停滞？");
    const interpreted = await service.interpretQuestion(reading.id);
    expect(interpreted.status).toBe("fallback_completed");
    expect(interpreted.interpretation?.source).toBe("fallback");
  });

  it("falls back with all three card facts preserved", async () => {
    const { service } = createService([0.1, 0.2, 0.3, 0.8, 0.6, 0.3, 0.4], "invalid");
    const reading = service.startQuestion("我该如何看待现在工作的停滞？", "three");
    const interpreted = await service.interpretQuestion(reading.id);
    expect(interpreted.interpretation?.content.cards).toHaveLength(3);
    expect(interpreted.interpretation?.content.cards.map((card) => card.cardId)).toEqual(
      reading.cards.map((card) => card.cardId),
    );
  });

  it("can draw every card with injected random values", () => {
    const seen = new Set<string>();
    for (let index = 0; index < TAROT_CARDS.length; index += 1) {
      const cardRandom = (index + 0.1) / TAROT_CARDS.length;
      const { service } = createService([cardRandom, 0.25, 0.25]);
      seen.add(service.startQuestion("我该如何理解当下的选择？").cards[0].cardId);
    }
    expect(seen.size).toBe(TAROT_CARDS.length);
  });

  it("deletes saved local history", async () => {
    const { service } = createService();
    const reading = service.startQuestion("我该如何理解这段关系的变化？");
    await service.interpretQuestion(reading.id);
    service.saveQuestionToHistory(reading.id);
    service.deleteHistory(reading.id);
    expect(service.listHistory()).toHaveLength(0);
  });

  it("clears all saved local history", async () => {
    const { service } = createService();
    service.startDaily();
    const reading = service.startQuestion("我该如何理解这段关系的变化？");
    await service.interpretQuestion(reading.id);
    service.saveQuestionToHistory(reading.id);
    expect(service.listHistory()).toHaveLength(2);
    service.clearHistory();
    expect(service.listHistory()).toHaveLength(0);
  });
});
