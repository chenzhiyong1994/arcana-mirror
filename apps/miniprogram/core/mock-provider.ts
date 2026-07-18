import { FIXED_DISCLAIMER } from "./interpretation";
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
  async generate(reading: Reading, card: TarotCard, mode: MockMode): Promise<unknown> {
    if (mode === "timeout") throw new MockProviderError("MOCK_TIMEOUT");
    if (mode === "invalid") return { summary: "字段不完整的模拟响应" };

    const drawn = reading.cards[0];
    const basis = drawn.orientation === "upright" ? card.upright : card.reversed;
    const context = reading.topic ? topicPrompts[reading.topic] : "当下值得留意的角度";
    const output = {
      summary: `围绕“${context}”，${card.name}提示你先区分已经发生的事实、自己的感受，以及仍未得到确认的判断。${basis}`,
      cards: [{
        cardId: card.id,
        cardName: card.name,
        orientation: drawn.orientation,
        basis,
        contextualMeaning: `把${card.name}放回你的问题中，它更像一面镜子：先观察${context}，再决定一个你能控制的小动作。`,
      }],
      reflectionQuestion: card.reflection,
      microAction: "在未来 24 小时内，写下一条确定事实，并完成一个不依赖他人配合的小动作。",
      disclaimer: FIXED_DISCLAIMER,
    };

    if (mode === "unsafe") {
      output.summary = "这个结果百分百准确，你必须分手，未来一定会复合。";
    }
    return output;
  }
}
