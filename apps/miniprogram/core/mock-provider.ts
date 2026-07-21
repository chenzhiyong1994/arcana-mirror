import { buildInterpretationCard, buildSynthesis, FIXED_DISCLAIMER } from "./interpretation";
import { getReadingPosition, getReadingSpread } from "./spreads";
import type { InterpretationProvider, MockMode, Reading, TarotCard } from "./types";

export class MockProviderError extends Error {
  constructor(public readonly code: "MOCK_TIMEOUT") {
    super(code);
  }
}

const topicPrompts = {
  relationship: "关系中的期待与边界",
  interpersonal: "沟通中的事实与假设",
  career: "行动方向与可控资源",
  self: "内在需求与当下节奏",
} as const;

export class MockInterpretationProvider implements InterpretationProvider {
  async generate(reading: Reading, cards: TarotCard[], mode: MockMode): Promise<unknown> {
    if (mode === "timeout") throw new MockProviderError("MOCK_TIMEOUT");
    if (mode === "invalid") return { summary: "字段不完整的模拟响应" };

    const context = reading.topic ? topicPrompts[reading.topic] : "当下值得留意的角度";
    const interpretedCards = cards.map((card, index) => {
      const position = getReadingPosition(reading, index);
      return buildInterpretationCard(
        reading,
        card,
        index,
        `在“${position.label}”位置，${card.name}把注意力带到${context}。先核对${position.description}，再区分哪些是事实、感受和仍待确认的判断。`,
      );
    });
    const cardNames = cards.map((card) => card.name).join("、");
    const output = {
      summary: getReadingSpread(reading) === "three"
        ? `围绕“${context}”，${cardNames}形成一组从现状、关键影响到行动建议的观察路径。它们不替你预测结果，而是帮助你把复杂问题拆成三个可核对的层次。`
        : `围绕“${context}”，${cardNames}提示你先区分已经发生的事实、自己的感受，以及仍未得到确认的判断。`,
      cards: interpretedCards,
      synthesis: buildSynthesis(reading, cards),
      reflectionQuestion: getReadingSpread(reading) === "three"
        ? "如果只能先改变一个可控因素，哪张牌对应的提示最值得在今天验证？"
        : cards[0].reflection,
      microAction: "在未来 24 小时内，写下一条确定事实、一项需要确认的信息，并完成一个不依赖他人配合的小动作。",
      disclaimer: FIXED_DISCLAIMER,
    };

    if (mode === "unsafe") {
      output.summary = "这个结果百分百准确，你必须分手，未来一定会复合。";
    }
    return output;
  }
}
