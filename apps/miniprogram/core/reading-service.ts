import { TAROT_CARDS, getCard } from "./cards";
import { toShanghaiBusinessDate } from "./date";
import { buildFallbackInterpretation, buildStaticDailyInterpretation, validateInterpretation } from "./interpretation";
import { transitionReading } from "./reading-state";
import type {
  InterpretationProvider,
  MockMode,
  Orientation,
  Reading,
  ReadingRepository,
  Topic,
} from "./types";

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
    this.dependencies.repository.save(reading);
    return reading;
  }

  startQuestion(topic: Topic, question: string): Reading {
    const reading = this.createBaseReading("question", topic, question.trim());
    this.dependencies.repository.setWorking(reading);
    return reading;
  }

  async interpretQuestion(id: string, mode: MockMode): Promise<Reading> {
    const reading = this.getById(id);
    if (!reading) throw new Error("READING_NOT_FOUND");
    if (reading.type !== "question") return reading;
    if (reading.interpretation) return reading;

    transitionReading(reading, "generating");
    reading.updatedAt = this.now().toISOString();
    this.persistWorkingOrSaved(reading);
    const card = getCard(reading.cards[0].cardId);

    try {
      const raw = await this.dependencies.provider.generate(reading, card, mode);
      const validation = validateInterpretation(raw, reading);
      if (!validation.valid) {
        return this.completeWithFallback(reading, card.id, validation.reasonCode);
      }
      transitionReading(reading, "completed");
      reading.interpretation = { source: "mock", validationStatus: "valid", content: validation.content };
      reading.updatedAt = this.now().toISOString();
      this.persistWorkingOrSaved(reading);
      return reading;
    } catch (error) {
      const reasonCode = error instanceof Error ? error.message : "MOCK_PROVIDER_ERROR";
      return this.completeWithFallback(reading, card.id, reasonCode);
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
    this.dependencies.repository.save(reading);
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

  private createBaseReading(type: "daily" | "question", topic?: Topic, question?: string): Reading {
    const now = this.now();
    const cardIndex = Math.min(TAROT_CARDS.length - 1, Math.floor(this.normalizedRandom() * TAROT_CARDS.length));
    const orientation: Orientation = this.normalizedRandom() < 0.5 ? "upright" : "reversed";
    return {
      id: `${type}-${now.getTime()}-${Math.floor(this.normalizedRandom() * 1_000_000).toString(36)}`,
      type,
      status: "drawn",
      businessDate: toShanghaiBusinessDate(now),
      topic,
      question,
      cards: [{ cardId: TAROT_CARDS[cardIndex].id, orientation, drawOrder: 1 }],
      saved: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  private normalizedRandom(): number {
    const value = this.random();
    return Number.isFinite(value) && value >= 0 && value < 1 ? value : 0;
  }

  private completeWithFallback(reading: Reading, cardId: string, reasonCode: string): Reading {
    const card = getCard(cardId);
    transitionReading(reading, "fallback_completed");
    reading.interpretation = {
      source: "fallback",
      validationStatus: "fallback",
      reasonCode,
      content: buildFallbackInterpretation(reading, card, reasonCode),
    };
    reading.updatedAt = this.now().toISOString();
    this.persistWorkingOrSaved(reading);
    return reading;
  }

  private persistWorkingOrSaved(reading: Reading): void {
    if (reading.saved) this.dependencies.repository.save(reading);
    else this.dependencies.repository.setWorking(reading);
  }
}
