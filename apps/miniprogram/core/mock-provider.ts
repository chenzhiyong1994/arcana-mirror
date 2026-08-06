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
  readonly source = "mock" as const;

  constructor(private readonly mode: MockMode = "success") {}

  async generate(reading: Reading, cards: TarotCard[]): Promise<unknown> {
    const mode = this.mode;
    if (mode === "timeout") throw new MockProviderError("MOCK_TIMEOUT");
    if (mode === "invalid") return { summary: "字段不完整的模拟响应" };

    const isLifeReading = reading.focusMode === "life";
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
      summary: isLifeReading
        ? getReadingSpread(reading) === "three"
          ? `${cardNames}把当下铺成现状、关键影响和下一步。依次看过生活三面，再留下最贴近现实的一条。`
          : `${cardNames}邀请你从生活三面观察当下。逐项对照事实，不必一次带走所有含义。`
        : getReadingSpread(reading) === "three"
          ? `围绕“${context}”，${cardNames}把问题拆成现状、关键影响和下一步。先看清真正的张力，再把注意力带回你能选择的部分。`
          : `围绕“${context}”，${cardNames}邀请你区分事实、感受和仍待确认的判断。`,
      cards: interpretedCards,
      synthesis: buildSynthesis(reading, cards),
      reflectionQuestion: getReadingSpread(reading) === "three"
        ? "如果只能先改变一个可控因素，哪张牌对应的提示最值得在今天验证？"
        : cards[0].reflection,
      microAction: "写下一条确定事实，并完成一个不依赖他人配合的小动作。",
      disclaimer: FIXED_DISCLAIMER,
    };

    if (mode === "unsafe") {
      output.summary = "这个结果百分百准确，你必须分手，未来一定会复合。";
    }
    return output;
  }
}
