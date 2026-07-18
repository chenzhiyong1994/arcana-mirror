import { describe, expect, it } from "vitest";
import { TAROT_CARDS } from "../apps/miniprogram/core/cards";
import { FIXED_DISCLAIMER, validateInterpretation } from "../apps/miniprogram/core/interpretation";
import type { InterpretationContent, Reading } from "../apps/miniprogram/core/types";

const reading: Reading = {
  id: "question-test",
  type: "question",
  status: "drawn",
  businessDate: "2026-07-19",
  topic: "self",
  question: "我该如何理解最近的犹豫？",
  cards: [{ cardId: TAROT_CARDS[9].id, orientation: "upright", drawOrder: 1 }],
  saved: false,
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
};

const validOutput: InterpretationContent = {
  summary: "隐士提示你暂时离开外界噪音，区分真实需要与急于得到答案的焦虑，再决定下一步。",
  cards: [{ cardId: "major-09", cardName: "隐士", orientation: "upright", basis: "通过独处辨认真正重要的事。", contextualMeaning: "把安静观察作为整理犹豫的方法，而不是逃避行动。" }],
  reflectionQuestion: "减少一种外界声音后，你自己的判断是什么？",
  microAction: "今天留出十分钟，只记录事实和自己的感受。",
  disclaimer: FIXED_DISCLAIMER,
};

describe("validateInterpretation", () => {
  it("accepts output that matches the reading facts", () => {
    expect(validateInterpretation(validOutput, reading)).toEqual({ valid: true, content: validOutput });
  });

  it("rejects a different card or orientation", () => {
    const invalid = { ...validOutput, cards: [{ ...validOutput.cards[0], orientation: "reversed" as const }] };
    expect(validateInterpretation(invalid, reading)).toEqual({ valid: false, reasonCode: "CARD_FACT_MISMATCH" });
  });

  it("rejects unsafe deterministic language", () => {
    const invalid = { ...validOutput, summary: "这个结果百分百准确，你必须分手，然后一切都会好起来。" };
    expect(validateInterpretation(invalid, reading)).toEqual({ valid: false, reasonCode: "UNSAFE_OUTPUT" });
  });
});
