import type { InterpretationContent, Orientation, Reading, TarotCard } from "./types";

export const FIXED_DISCLAIMER = "本内容由本地模拟数据生成，仅供娱乐和自我反思；重要决定请结合事实、专业意见和你自己的判断。";

export const interpretationJsonSchema = {
  type: "object",
  required: ["summary", "cards", "reflectionQuestion", "microAction", "disclaimer"],
  additionalProperties: false,
  properties: {
    summary: { type: "string", minLength: 20, maxLength: 240 },
    cards: {
      type: "array",
      minItems: 1,
      maxItems: 1,
      items: {
        type: "object",
        required: ["cardId", "cardName", "orientation", "basis", "contextualMeaning"],
        additionalProperties: false,
        properties: {
          cardId: { type: "string" },
          cardName: { type: "string", minLength: 1, maxLength: 40 },
          orientation: { type: "string", enum: ["upright", "reversed"] },
          basis: { type: "string", minLength: 1, maxLength: 240 },
          contextualMeaning: { type: "string", minLength: 1, maxLength: 320 },
        },
      },
    },
    reflectionQuestion: { type: "string", minLength: 1, maxLength: 160 },
    microAction: { type: "string", minLength: 1, maxLength: 160 },
    disclaimer: { type: "string", const: FIXED_DISCLAIMER },
  },
} as const;

function isStringInRange(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

export function validateInterpretation(
  value: unknown,
  reading: Reading,
): { valid: true; content: InterpretationContent } | { valid: false; reasonCode: string } {
  if (!value || typeof value !== "object") return { valid: false, reasonCode: "INVALID_OBJECT" };
  const candidate = value as Partial<InterpretationContent>;
  if (!isStringInRange(candidate.summary, 20, 240)) return { valid: false, reasonCode: "INVALID_SUMMARY" };
  if (!Array.isArray(candidate.cards) || candidate.cards.length !== reading.cards.length) return { valid: false, reasonCode: "CARD_COUNT_MISMATCH" };
  for (let index = 0; index < candidate.cards.length; index += 1) {
    const outputCard = candidate.cards[index];
    const fact = reading.cards[index];
    if (!outputCard || outputCard.cardId !== fact.cardId || outputCard.orientation !== fact.orientation) {
      return { valid: false, reasonCode: "CARD_FACT_MISMATCH" };
    }
    if (!isStringInRange(outputCard.cardName, 1, 40) || !isStringInRange(outputCard.basis, 1, 240) || !isStringInRange(outputCard.contextualMeaning, 1, 320)) {
      return { valid: false, reasonCode: "INVALID_CARD_CONTENT" };
    }
  }
  if (!isStringInRange(candidate.reflectionQuestion, 1, 160)) return { valid: false, reasonCode: "INVALID_REFLECTION" };
  if (!isStringInRange(candidate.microAction, 1, 160)) return { valid: false, reasonCode: "INVALID_ACTION" };
  if (candidate.disclaimer !== FIXED_DISCLAIMER) return { valid: false, reasonCode: "INVALID_DISCLAIMER" };
  const serialized = JSON.stringify(candidate);
  if (/(百分百|命中注定|必须分手|一定会复合|停止治疗)/u.test(serialized)) return { valid: false, reasonCode: "UNSAFE_OUTPUT" };
  return { valid: true, content: candidate as InterpretationContent };
}

export function buildFallbackInterpretation(reading: Reading, card: TarotCard, _reasonCode: string): InterpretationContent {
  const orientation = reading.cards[0].orientation;
  const basis = orientation === "upright" ? card.upright : card.reversed;
  return {
    summary: `个性化模拟解读暂时不可用。先回到${card.name}的受控牌义：${basis}`,
    cards: [{ cardId: card.id, cardName: card.name, orientation, basis, contextualMeaning: "这份基础解读不推断你的具体处境，请只把它作为整理问题的一个观察角度。" }],
    reflectionQuestion: card.reflection,
    microAction: "在 24 小时内写下一个已知事实和一个仍需确认的信息，再决定下一步。",
    disclaimer: FIXED_DISCLAIMER,
  };
}

export function buildStaticDailyInterpretation(reading: Reading, card: TarotCard): InterpretationContent {
  const orientation = reading.cards[0].orientation;
  const basis = orientation === "upright" ? card.upright : card.reversed;
  return {
    summary: `今天的牌是${card.name}${orientation === "upright" ? "正位" : "逆位"}。${basis}`,
    cards: [{ cardId: card.id, cardName: card.name, orientation, basis, contextualMeaning: "把它当作今天值得留意的一个角度，而不是对未来的判断。" }],
    reflectionQuestion: card.reflection,
    microAction: "今天找一个安静的三分钟，记录你对这个问题的第一反应。",
    disclaimer: FIXED_DISCLAIMER,
  };
}

export function orientationLabel(orientation: Orientation): string {
  return orientation === "upright" ? "正位" : "逆位";
}
