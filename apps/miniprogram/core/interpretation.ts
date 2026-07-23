import { getCardDomainInsights } from "./card-domain-insights";
import { getCard } from "./cards";
import { getReadingPosition, getReadingSpread } from "./spreads";
import type {
  InterpretationCard,
  InterpretationContent,
  Orientation,
  Reading,
  TarotCard,
  Topic,
} from "./types";

export const FIXED_DISCLAIMER = "本内容由 AI 结合牌面生成，仅供娱乐和自我反思；感情、事业与个人成长内容不构成确定性预测或专业建议，重要决定请结合事实、专业意见和你自己的判断。";
export const LOCAL_DISCLAIMER = "本内容依据本地牌义生成，仅供娱乐和自我反思；感情、事业与个人成长内容不构成确定性预测或专业建议，重要决定请结合事实、专业意见和你自己的判断。";

const cardInsightProperties = {
  cardId: { type: "string" },
  cardName: { type: "string", minLength: 1, maxLength: 40 },
  orientation: { type: "string", enum: ["upright", "reversed"] },
  position: { type: "string", enum: ["focus", "situation", "influence", "action"] },
  positionLabel: { type: "string", minLength: 1, maxLength: 20 },
  basis: { type: "string", minLength: 1, maxLength: 220 },
  contextualMeaning: { type: "string", minLength: 1, maxLength: 280 },
  topicLabel: { type: "string", minLength: 1, maxLength: 12 },
  topicInsight: { type: "string", minLength: 1, maxLength: 240 },
} as const;

export const interpretationJsonSchema = {
  type: "object",
  required: ["summary", "cards", "synthesis", "reflectionQuestion", "microAction", "disclaimer"],
  additionalProperties: false,
  properties: {
    summary: { type: "string", minLength: 20, maxLength: 260 },
    cards: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        required: [
          "cardId",
          "cardName",
          "orientation",
          "position",
          "positionLabel",
          "basis",
          "contextualMeaning",
          "topicLabel",
          "topicInsight",
        ],
        additionalProperties: false,
        properties: cardInsightProperties,
      },
    },
    synthesis: { type: "string", minLength: 20, maxLength: 320 },
    reflectionQuestion: { type: "string", minLength: 1, maxLength: 120 },
    microAction: { type: "string", minLength: 1, maxLength: 120 },
    disclaimer: { type: "string", const: FIXED_DISCLAIMER },
  },
} as const;

function isStringInRange(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isValidCardContent(card: InterpretationCard): boolean {
  return isStringInRange(card.cardName, 1, 40)
    && isStringInRange(card.positionLabel, 1, 20)
    && isStringInRange(card.basis, 1, 220)
    && isStringInRange(card.contextualMeaning, 1, 280)
    && isStringInRange(card.topicLabel, 1, 12)
    && isStringInRange(card.topicInsight, 1, 240);
}

export function validateInterpretation(
  value: unknown,
  reading: Reading,
): { valid: true; content: InterpretationContent } | { valid: false; reasonCode: string } {
  if (!value || typeof value !== "object") return { valid: false, reasonCode: "INVALID_OBJECT" };
  const candidate = value as Partial<InterpretationContent>;
  if (!isStringInRange(candidate.summary, 20, 260)) return { valid: false, reasonCode: "INVALID_SUMMARY" };
  if (!Array.isArray(candidate.cards) || candidate.cards.length !== reading.cards.length) {
    return { valid: false, reasonCode: "CARD_COUNT_MISMATCH" };
  }
  for (let index = 0; index < candidate.cards.length; index += 1) {
    const outputCard = candidate.cards[index];
    const fact = reading.cards[index];
    const card = getCard(fact.cardId);
    const position = getReadingPosition(reading, index);
    const controlledMeaning = fact.orientation === "upright" ? card.upright : card.reversed;
    if (
      !outputCard
      || outputCard.cardId !== fact.cardId
      || outputCard.cardName !== card.name
      || outputCard.orientation !== fact.orientation
      || outputCard.position !== position.key
      || outputCard.positionLabel !== position.label
      || outputCard.basis !== controlledMeaning
    ) {
      return { valid: false, reasonCode: "CARD_FACT_MISMATCH" };
    }
    if (!isValidCardContent(outputCard)) return { valid: false, reasonCode: "INVALID_CARD_CONTENT" };
    if (outputCard.topicLabel !== topicLabels[reading.topic ?? "self"]) {
      return { valid: false, reasonCode: "TOPIC_MISMATCH" };
    }
  }
  if (!isStringInRange(candidate.synthesis, 20, 320)) return { valid: false, reasonCode: "INVALID_SYNTHESIS" };
  if (!isStringInRange(candidate.reflectionQuestion, 1, 120)) return { valid: false, reasonCode: "INVALID_REFLECTION" };
  if (!isStringInRange(candidate.microAction, 1, 120)) return { valid: false, reasonCode: "INVALID_ACTION" };
  if (candidate.disclaimer !== FIXED_DISCLAIMER) return { valid: false, reasonCode: "INVALID_DISCLAIMER" };
  const serialized = JSON.stringify(candidate);
  if (/(百分百|命中注定|必须分手|一定会复合|停止治疗|不用就医|稳赚|保证盈利|必定发财|转运消灾|替你决定)/u.test(serialized)) {
    return { valid: false, reasonCode: "UNSAFE_OUTPUT" };
  }
  return { valid: true, content: candidate as InterpretationContent };
}

const topicLabels: Record<Topic, string> = {
  relationship: "感情",
  interpersonal: "人际",
  career: "事业",
  self: "自我",
};

export function buildTopicInsight(card: TarotCard, orientation: Orientation, topic: Topic = "self") {
  const domain = getCardDomainInsights(card.id);
  const topicInsight = topic === "relationship"
    ? domain.love
    : topic === "career"
      ? domain.career
      : topic === "interpersonal"
        ? `${domain.love}把重点放在沟通、边界和可核实的互动，而不是替对方下结论。`
        : domain.selfGrowth;
  return {
    topicLabel: topicLabels[topic],
    topicInsight,
    basis: orientation === "upright" ? card.upright : card.reversed,
  };
}

export function buildInterpretationCard(
  reading: Reading,
  card: TarotCard,
  index: number,
  contextualMeaning?: string,
): InterpretationCard {
  const drawn = reading.cards[index];
  const position = getReadingPosition(reading, index);
  const insights = buildTopicInsight(card, drawn.orientation, reading.topic ?? "self");
  return {
    cardId: card.id,
    cardName: card.name,
    orientation: drawn.orientation,
    position: position.key,
    positionLabel: position.label,
    basis: insights.basis,
    contextualMeaning: contextualMeaning ?? `${position.label}位置的${card.name}提醒你：先从${position.description}入手，把牌义与已经发生的事实对照，而不是急着把它变成结论。`,
    topicLabel: insights.topicLabel,
    topicInsight: insights.topicInsight,
  };
}

export function buildSynthesis(reading: Reading, cards: TarotCard[]): string {
  if (getReadingSpread(reading) === "three") {
    return `${cards[0].name}呈现眼前局面，${cards[1].name}指出真正牵动它的力量，${cards[2].name}把答案落到下一步。先看清，再选择，不必一次解决全部。`;
  }
  return `${cards[0].name}提供的是一个观察角度。把它放回真实处境，留下最贴近事实的一句，再决定下一步。`;
}

export function buildFallbackInterpretation(reading: Reading, cards: TarotCard[], _reasonCode: string): InterpretationContent {
  const interpretedCards = cards.map((card, index) => buildInterpretationCard(
    reading,
    card,
    index,
    "AI 个性化解读暂时不可用。这份基础解读不推断你的具体处境，请只把它作为整理问题的一个观察角度。",
  ));
  return {
    summary: `AI 个性化解读暂时不可用。先回到${cards.map((card) => card.name).join("、")}的受控牌义，逐张核对已经发生的事实与自己的感受。`,
    cards: interpretedCards,
    synthesis: buildSynthesis(reading, cards),
    reflectionQuestion: getReadingSpread(reading) === "three"
      ? "现状、关键影响和行动建议之间，哪一处最贴近你已经确认的事实？"
      : cards[0].reflection,
    microAction: "写下一条已知事实，再完成一个不依赖他人配合的小动作。",
    disclaimer: LOCAL_DISCLAIMER,
  };
}

export function buildStaticDailyInterpretation(reading: Reading, card: TarotCard): InterpretationContent {
  const orientation = reading.cards[0].orientation;
  const basis = orientation === "upright" ? card.upright : card.reversed;
  return {
    summary: `今天的牌是${card.name}${orientationLabel(orientation)}。${basis}`,
    cards: [buildInterpretationCard(
      reading,
      card,
      0,
      "把它当作今天值得留意的一个角度，而不是对未来的判断。观察它和当下事实在哪里相遇。",
    )],
    synthesis: `${card.name}今天更像一面镜子。只留下最贴近现实的一句，不必把所有含义都带走。`,
    reflectionQuestion: card.reflection,
    microAction: "留出三分钟，写下第一反应和一条可以核实的事实。",
    disclaimer: LOCAL_DISCLAIMER,
  };
}

export function orientationLabel(orientation: Orientation): string {
  return orientation === "upright" ? "正位" : "逆位";
}
