export type Topic = "relationship" | "interpersonal" | "career" | "self";
export type Orientation = "upright" | "reversed";
export type ReadingType = "daily" | "question";
export type SpreadType = "single" | "three";
export type SpreadPosition = "focus" | "situation" | "influence" | "action";
export type ReadingStatus =
  | "drawn"
  | "generating"
  | "completed"
  | "fallback_completed"
  | "blocked"
  | "failed";
export type InterpretationSource = "static" | "mock" | "fallback";
export type MockMode = "success" | "timeout" | "invalid" | "unsafe";

export interface TarotCard {
  id: string;
  sequence: number;
  roman: string;
  name: string;
  englishName: string;
  keywords: string[];
  upright: string;
  reversed: string;
  reflection: string;
}

export interface DrawnCard {
  cardId: string;
  orientation: Orientation;
  drawOrder: number;
}

export interface InterpretationCard {
  cardId: string;
  cardName: string;
  orientation: Orientation;
  position: SpreadPosition;
  positionLabel: string;
  basis: string;
  contextualMeaning: string;
  loveInsight: string;
  wealthInsight: string;
  careerInsight: string;
  selfGrowthInsight: string;
}

export interface InterpretationContent {
  summary: string;
  cards: InterpretationCard[];
  synthesis: string;
  reflectionQuestion: string;
  microAction: string;
  disclaimer: string;
}

export interface Interpretation {
  source: InterpretationSource;
  validationStatus: "valid" | "fallback";
  reasonCode?: string;
  content: InterpretationContent;
}

export type SafetyAction =
  | "allow"
  | "rewrite"
  | "professional_boundary"
  | "crisis_block"
  | "abuse_block";

export interface SafetyDecision {
  action: SafetyAction;
  reasonCode: string;
  message: string;
  suggestedQuestion?: string;
}

export interface Reading {
  id: string;
  type: ReadingType;
  /** Optional only for compatibility with local v0.1 records. */
  spread?: SpreadType;
  status: ReadingStatus;
  businessDate: string;
  topic?: Topic;
  question?: string;
  cards: DrawnCard[];
  interpretation?: Interpretation;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingRepository {
  listSaved(): Reading[];
  findSavedById(id: string): Reading | undefined;
  findDaily(businessDate: string): Reading | undefined;
  save(reading: Reading): void;
  delete(id: string): void;
  clearSaved(): void;
  getWorking(): Reading | undefined;
  setWorking(reading: Reading): void;
  clearWorking(id?: string): void;
}

export interface InterpretationProvider {
  generate(reading: Reading, cards: TarotCard[], mode: MockMode): Promise<unknown>;
}

export interface CardDiscovery {
  cardId: string;
  firstRevealedAt: string;
  lastRevealedAt: string;
  revealCount: number;
  uprightSeen: boolean;
  reversedSeen: boolean;
}

export interface CardCollectionRepository {
  list(): CardDiscovery[];
  save(discovery: CardDiscovery): void;
  clear(): void;
}
