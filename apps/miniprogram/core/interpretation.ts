import { getCardDomainInsights } from "./card-domain-insights";
import { getReadingPosition, getReadingSpread } from "./spreads";
import type {
  InterpretationCard,
  InterpretationContent,
  Orientation,
  Reading,
  TarotCard,
} from "./types";

export const FIXED_DISCLAIMER = "本内容由本地模拟数据生成，仅供娱乐和自我反思；爱情、财运与事业内容不构成确定性预测或专业建议，重要决定请结合事实、专业意见和你自己的判断。";

const cardInsightProperties = {
  cardId: { type: "string" },
  cardName: { type: "string", minLength: 1, maxLength: 40 },
  orientation: { type: "string", enum: ["upright", "reversed"] },
  position: { type: "string", enum: ["focus", "situation", "influence", "action"] },
  positionLabel: { type: "string", minLength: 1, maxLength: 20 },
  basis: { type: "string", minLength: 1, maxLength: 320 },
  contextualMeaning: { type: "string", minLength: 1, maxLength: 420 },
  loveInsight: { type: "string", minLength: 1, maxLength: 320 },
  wealthInsight: { type: "string", minLength: 1, maxLength: 320 },
  careerInsight: { type: "string", minLength: 1, maxLength: 320 },
  selfGrowthInsight: { type: "string", minLength: 1, maxLength: 320 },
} as const;

export const interpretationJsonSchema = {
  type: "object",
  required: ["summary", "cards", "synthesis", "reflectionQuestion", "microAction", "disclaimer"],
  additionalProperties: false,
  properties: {
    summary: { type: "string", minLength: 20, maxLength: 480 },
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
          "loveInsight",
          "wealthInsight",
          "careerInsight",
          "selfGrowthInsight",
        ],
        additionalProperties: false,
        properties: cardInsightProperties,
      },
    },
    synthesis: { type: "string", minLength: 20, maxLength: 480 },
    reflectionQuestion: { type: "string", minLength: 1, maxLength: 200 },
    microAction: { type: "string", minLength: 1, maxLength: 200 },
    disclaimer: { type: "string", const: FIXED_DISCLAIMER },
  },
} as const;

function isStringInRange(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isValidCardContent(card: InterpretationCard): boolean {
  return isStringInRange(card.cardName, 1, 40)
    && isStringInRange(card.positionLabel, 1, 20)
    && isStringInRange(card.basis, 1, 320)
    && isStringInRange(card.contextualMeaning, 1, 420)
    && isStringInRange(card.loveInsight, 1, 320)
    && isStringInRange(card.wealthInsight, 1, 320)
    && isStringInRange(card.careerInsight, 1, 320)
    && isStringInRange(card.selfGrowthInsight, 1, 320);
}

export function validateInterpretation(
  value: unknown,
  reading: Reading,
): { valid: true; content: InterpretationContent } | { valid: false; reasonCode: string } {
  if (!value || typeof value !== "object") return { valid: false, reasonCode: "INVALID_OBJECT" };
  const candidate = value as Partial<InterpretationContent>;
  if (!isStringInRange(candidate.summary, 20, 480)) return { valid: false, reasonCode: "INVALID_SUMMARY" };
  if (!Array.isArray(candidate.cards) || candidate.cards.length !== reading.cards.length) {
    return { valid: false, reasonCode: "CARD_COUNT_MISMATCH" };
  }
  for (let index = 0; index < candidate.cards.length; index += 1) {
    const outputCard = candidate.cards[index];
    const fact = reading.cards[index];
    const position = getReadingPosition(reading, index);
    if (
      !outputCard
      || outputCard.cardId !== fact.cardId
      || outputCard.orientation !== fact.orientation
      || outputCard.position !== position.key
      || outputCard.positionLabel !== position.label
    ) {
      return { valid: false, reasonCode: "CARD_FACT_MISMATCH" };
    }
    if (!isValidCardContent(outputCard)) return { valid: false, reasonCode: "INVALID_CARD_CONTENT" };
  }
  if (!isStringInRange(candidate.synthesis, 20, 480)) return { valid: false, reasonCode: "INVALID_SYNTHESIS" };
  if (!isStringInRange(candidate.reflectionQuestion, 1, 200)) return { valid: false, reasonCode: "INVALID_REFLECTION" };
  if (!isStringInRange(candidate.microAction, 1, 200)) return { valid: false, reasonCode: "INVALID_ACTION" };
  if (candidate.disclaimer !== FIXED_DISCLAIMER) return { valid: false, reasonCode: "INVALID_DISCLAIMER" };
  const serialized = JSON.stringify(candidate);
  if (/(百分百|命中注定|必须分手|一定会复合|停止治疗|稳赚|保证盈利|必定发财)/u.test(serialized)) {
    return { valid: false, reasonCode: "UNSAFE_OUTPUT" };
  }
  return { valid: true, content: candidate as InterpretationContent };
}

export function buildDimensionInsights(card: TarotCard, orientation: Orientation) {
  const orientationWord = orientationLabel(orientation);
  const basis = orientation === "upright" ? card.upright : card.reversed;
  const domain = getCardDomainInsights(card.id);
  return {
    basis,
    loveInsight: `爱情观察：${domain.love}${orientationWord}进一步提醒：${basis}`,
    wealthInsight: `财运观察：${domain.wealth}这不是涨跌或收益预测；${orientationWord}进一步提醒：${basis}`,
    careerInsight: `事业观察：${domain.career}${orientationWord}进一步提醒：${basis}`,
    selfGrowthInsight: `自我成长：${domain.selfGrowth}${orientationWord}进一步提醒：${basis}`,
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
  const insights = buildDimensionInsights(card, drawn.orientation);
  return {
    cardId: card.id,
    cardName: card.name,
    orientation: drawn.orientation,
    position: position.key,
    positionLabel: position.label,
    basis: insights.basis,
    contextualMeaning: contextualMeaning ?? `${position.label}位置的${card.name}提醒你：先从${position.description}入手，把牌义与已经发生的事实对照，而不是急着把它变成结论。`,
    loveInsight: insights.loveInsight,
    wealthInsight: insights.wealthInsight,
    careerInsight: insights.careerInsight,
    selfGrowthInsight: insights.selfGrowthInsight,
  };
}

export function buildSynthesis(reading: Reading, cards: TarotCard[]): string {
  if (getReadingSpread(reading) === "three") {
    return `把三张牌连起来看：${cards[0].name}描述现状，${cards[1].name}提示关键影响，${cards[2].name}把注意力带回可执行的行动。三者共同强调先核对事实，再调整节奏，最后选择一个你能够承担的小步骤。`;
  }
  return `${cards[0].name}提供的是一个观察角度：把牌义放回真实处境，分别检查感情、财务、事业与内在需要，再决定哪一项最值得先行动。`;
}

export function buildFallbackInterpretation(reading: Reading, cards: TarotCard[], _reasonCode: string): InterpretationContent {
  const interpretedCards = cards.map((card, index) => buildInterpretationCard(
    reading,
    card,
    index,
    "个性化模拟解读暂时不可用。这份基础解读不推断你的具体处境，请只把它作为整理问题的一个观察角度。",
  ));
  return {
    summary: `个性化模拟解读暂时不可用。先回到${cards.map((card) => card.name).join("、")}的受控牌义，逐张核对已经发生的事实与自己的感受。`,
    cards: interpretedCards,
    synthesis: buildSynthesis(reading, cards),
    reflectionQuestion: getReadingSpread(reading) === "three"
      ? "现状、关键影响和行动建议之间，哪一处最贴近你已经确认的事实？"
      : cards[0].reflection,
    microAction: "在 24 小时内写下一个已知事实、一个仍需确认的信息，以及一个不依赖他人配合的小动作。",
    disclaimer: FIXED_DISCLAIMER,
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
    synthesis: `${card.name}今天更像一面镜子。你可以从感情、财务、事业和自我照顾四个方向中，只选择最贴近现实的一项来观察。`,
    reflectionQuestion: card.reflection,
    microAction: "今天找一个安静的三分钟，记录你对这张牌的第一反应，再写下一条可以核实的事实。",
    disclaimer: FIXED_DISCLAIMER,
  };
}

export function orientationLabel(orientation: Orientation): string {
  return orientation === "upright" ? "正位" : "逆位";
}
