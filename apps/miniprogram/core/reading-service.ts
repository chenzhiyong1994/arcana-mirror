import { TAROT_CARDS, getCard } from "./cards";
import { toShanghaiBusinessDate } from "./date";
import { buildFallbackInterpretation, buildStaticDailyInterpretation, validateInterpretation } from "./interpretation";
import { transitionReading } from "./reading-state";
import type {
  InterpretationProvider,
  Orientation,
  Reading,
  ReadingRepository,
  SpreadType,
  Topic,
} from "./types";

export const RECENT_READING_LIMIT = 30;

export interface ReadingServiceDependencies {
  repository: ReadingRepository;
  provider: InterpretationProvider;
  now?: () => Date;
  random?: () => number;
}

export class ReadingService {
  private readonly now: () => Date;
  private readonly random: () => number;

  constructor(private readonly dependencies: ReadingServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date());
    this.random = dependencies.random ?? Math.random;
  }

  getTodayReading(): Reading | undefined {
    return this.dependencies.repository.findDaily(toShanghaiBusinessDate(this.now()));
  }

  startDaily(): Reading {
    const existing = this.getTodayReading();
    if (existing) return existing;

    const reading = this.createBaseReading("daily");
    const card = getCard(reading.cards[0].cardId);
    transitionReading(reading, "completed");
    reading.saved = true;
    reading.interpretation = {
      source: "static",
      validationStatus: "valid",
      content: buildStaticDailyInterpretation(reading, card),
    };
    this.saveRecent(reading);
    return reading;
  }

  startQuestion(question: string, spread: SpreadType = "single"): Reading {
    const reading = this.createBaseReading("question", undefined, question.trim(), spread, "question");
    this.dependencies.repository.setWorking(reading);
    return reading;
  }

  startLifeReading(spread: SpreadType = "single"): Reading {
    const reading = this.createBaseReading("question", undefined, undefined, spread, "life");
    this.dependencies.repository.setWorking(reading);
    return reading;
  }

  async interpretQuestion(id: string): Promise<Reading> {
    const reading = this.getById(id);
    if (!reading) throw new Error("READING_NOT_FOUND");
    if (reading.type !== "question") return reading;
    if (reading.interpretation) return reading;

    transitionReading(reading, "generating");
    reading.updatedAt = this.now().toISOString();
    this.persistWorkingOrSaved(reading);
    const cards = reading.cards.map((drawn) => getCard(drawn.cardId));

    try {
      const raw = await this.dependencies.provider.generate(reading, cards);
      const validation = validateInterpretation(raw, reading);
      if (!validation.valid) {
        return this.completeWithFallback(reading, cards, validation.reasonCode);
      }
      transitionReading(reading, "completed");
      reading.interpretation = {
        source: this.dependencies.provider.source,
        validationStatus: "valid",
        content: validation.content,
      };
      reading.updatedAt = this.now().toISOString();
      this.keepCompletedQuestion(reading);
      return reading;
    } catch (error) {
      const reasonCode = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
      return this.completeWithFallback(reading, cards, reasonCode);
    }
  }

  saveQuestionToHistory(id: string): Reading {
    const reading = this.getById(id);
    if (
      !reading ||
      reading.type !== "question" ||
      !reading.interpretation ||
      !["completed", "fallback_completed"].includes(reading.status)
    ) throw new Error("READING_NOT_SAVABLE");
    reading.saved = true;
    reading.updatedAt = this.now().toISOString();
    this.saveRecent(reading);
    this.dependencies.repository.clearWorking(id);
    return reading;
  }

  discardQuestion(id: string): void {
    const saved = this.dependencies.repository.findSavedById(id);
    if (!saved) this.dependencies.repository.clearWorking(id);
  }

  getById(id: string): Reading | undefined {
    return this.dependencies.repository.findSavedById(id) ??
      (this.dependencies.repository.getWorking()?.id === id ? this.dependencies.repository.getWorking() : undefined);
  }

  listHistory(): Reading[] {
    return this.dependencies.repository.listSaved();
  }

  deleteHistory(id: string): void {
    this.dependencies.repository.delete(id);
  }

  clearHistory(): void {
    this.dependencies.repository.clearSaved();
  }

  private createBaseReading(
    type: "daily" | "question",
    topic?: Topic,
    question?: string,
    spread: SpreadType = "single",
    focusMode?: Reading["focusMode"],
  ): Reading {
    const now = this.now();
    const resolvedSpread: SpreadType = type === "daily" ? "single" : spread;
    const cards = this.drawCards(resolvedSpread === "three" ? 3 : 1);
    return {
      id: `${type}-${now.getTime()}-${Math.floor(this.normalizedRandom() * 1_000_000).toString(36)}`,
      type,
      spread: resolvedSpread,
      status: "drawn",
      businessDate: toShanghaiBusinessDate(now),
      focusMode,
      topic,
      question,
      cards,
      saved: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  private normalizedRandom(): number {
    const value = this.random();
    return Number.isFinite(value) && value >= 0 && value < 1 ? value : 0;
  }

  private drawCards(count: number): Reading["cards"] {
    const used = new Set<number>();
    const cards: Reading["cards"] = [];
    for (let drawOrder = 1; drawOrder <= count; drawOrder += 1) {
      let cardIndex = Math.min(TAROT_CARDS.length - 1, Math.floor(this.normalizedRandom() * TAROT_CARDS.length));
      while (used.has(cardIndex)) cardIndex = (cardIndex + 1) % TAROT_CARDS.length;
      used.add(cardIndex);
      const orientation: Orientation = this.normalizedRandom() < 0.5 ? "upright" : "reversed";
      cards.push({ cardId: TAROT_CARDS[cardIndex].id, orientation, drawOrder });
    }
    return cards;
  }

  private completeWithFallback(reading: Reading, cards: ReturnType<typeof getCard>[], reasonCode: string): Reading {
    transitionReading(reading, "fallback_completed");
    reading.interpretation = {
      source: "fallback",
      validationStatus: "fallback",
      reasonCode,
      content: buildFallbackInterpretation(reading, cards, reasonCode),
    };
    reading.updatedAt = this.now().toISOString();
    this.keepCompletedQuestion(reading);
    return reading;
  }

  private keepCompletedQuestion(reading: Reading): void {
    reading.saved = true;
    this.saveRecent(reading);
    this.dependencies.repository.clearWorking(reading.id);
  }

  private saveRecent(reading: Reading): void {
    this.dependencies.repository.save(reading);
    this.dependencies.repository.listSaved()
      .slice(RECENT_READING_LIMIT)
      .forEach((expired) => this.dependencies.repository.delete(expired.id));
  }

  private persistWorkingOrSaved(reading: Reading): void {
    if (reading.saved) this.dependencies.repository.save(reading);
    else this.dependencies.repository.setWorking(reading);
  }
}
