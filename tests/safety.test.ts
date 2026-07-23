import { describe, expect, it } from "vitest";
import { classifyQuestion } from "../apps/miniprogram/core/safety";

describe("classifyQuestion", () => {
  it("allows an open reflection question", () => {
    expect(classifyQuestion("我该如何理解最近和朋友之间的疏远？").action).toBe("allow");
  });

  it("rewrites deterministic prediction questions", () => {
    const decision = classifyQuestion("他一定会和我复合吗？");
    expect(decision.action).toBe("rewrite");
    expect(decision.suggestedQuestion).toBeTruthy();
  });

  it("blocks crisis language before drawing", () => {
    const decision = classifyQuestion("我不想活了，我应该怎么办？");
    expect(decision.action).toBe("crisis_block");
    expect(decision.suggestedQuestion).toBeUndefined();
  });

  it.each(["我最近总是想死怎么办？", "我有轻生的念头该怎么办？", "我觉得活着没意思了。"])(
    "blocks common crisis phrasing: %s",
    (question) => {
      expect(classifyQuestion(question).action).toBe("crisis_block");
    },
  );

  it("applies a professional boundary", () => {
    expect(classifyQuestion("这只股票什么时候会涨停？").action).toBe("professional_boundary");
  });
});
