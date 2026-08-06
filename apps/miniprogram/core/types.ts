export type Topic = "relationship" | "interpersonal" | "career" | "self";
export type Orientation = "upright" | "reversed";
export type ReadingType = "daily" | "question";
export type ReadingFocusMode = "life" | "question";
export type ReadingDirection = "wealth" | "career" | "love";
export type SpreadType = "single" | "three";
export type SpreadPosition = "focus" | "situation" | "influence" | "action";
export type Arcana = "major" | "minor";
export type MinorSuit = "wands" | "cups" | "swords" | "pentacles";
export type MinorRank =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "page"
  | "knight"
  | "queen"
  | "king";
export type ReadingStatus =
  | "drawn"
  | "generating"
  | "completed"
  | "fallback_completed"
  | "blocked"
  | "failed";
export type InterpretationSource = "static" | "ai" | "mock" | "fallback";
export type MockMode = "success" | "timeout" | "invalid" | "unsafe";

export interface TarotCard {
  id: string;
  sequence: number;
  /**
   * 顶部牌面标记：大阿尔卡那为 0—XXI 序列编号；
   * 小阿尔卡那为花色内牌阶 A、II—X 或宫廷身份，不是 22—77 全局序号。
   */
  roman: string;
  name: string;
  englishName: string;
  arcana: Arcana;
  suit?: MinorSuit;
  rank?: MinorRank;
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
  topicLabel: string;
  topicInsight: string;
  directionInsights?: Array<{
    key: ReadingDirection;
    label: string;
    content: string;
  }>;
  /** Legacy v0.2 fields are optional so saved local records remain readable. */
  loveInsight?: string;
  wealthInsight?: string;
  careerInsight?: string;
  selfGrowthInsight?: string;
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
  /** Optional only for compatibility with readings created before life guidance was added. */
  focusMode?: ReadingFocusMode;
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
  readonly source: "ai" | "mock";
  generate(reading: Reading, cards: TarotCard[]): Promise<unknown>;
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
