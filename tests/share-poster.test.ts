import { describe, expect, it } from "vitest";

import { wrapPosterText } from "../apps/miniprogram/services/share-poster";

describe("wrapPosterText", () => {
  const measure = (value: string) => value.length * 10;

  it("按宽度拆分中文并保留全部内容", () => {
    expect(wrapPosterText("看见真实需要", 40, 4, measure)).toEqual([
      "看见真实",
      "需要",
    ]);
  });

  it("超过最大行数时用省略号收尾", () => {
    expect(wrapPosterText("一二三四五六七八九", 40, 2, measure)).toEqual([
      "一二三四",
      "五六七…",
    ]);
  });

  it("折叠空白且不输出空行", () => {
    expect(wrapPosterText("  今天   先走一步  ", 60, 3, measure)).toEqual([
      "今天 先走一",
      "步",
    ]);
    expect(wrapPosterText("   ", 60, 3, measure)).toEqual([]);
  });
});
