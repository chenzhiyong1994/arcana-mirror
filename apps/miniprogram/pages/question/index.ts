import { classifyQuestion } from "../../core/safety";
import type { SafetyDecision, SpreadType } from "../../core/types";
import { readingService } from "../../services/app-services";

type FocusMode = "life" | "question";

const SPREADS: { value: SpreadType; label: string; description: string }[] = [
  { value: "single", label: "单牌", description: "聚焦一个核心观察角度" },
  { value: "three", label: "三牌", description: "现状 · 关键影响 · 行动建议" },
];

const FOCUS_MODES: { value: FocusMode; label: string; description: string }[] = [
  { value: "life", label: "生活指引", description: "财运 · 事业 · 爱情" },
  { value: "question", label: "具体问题", description: "写下此刻困扰" },
];

Page({
  data: {
    spreads: SPREADS,
    focusModes: FOCUS_MODES,
    selectedFocusMode: "life" as FocusMode,
    selectedSpread: "single" as SpreadType,
    question: "",
    count: 0,
    decision: null as SafetyDecision | null,
    canAdoptRewrite: false,
    isBlocked: false,
  },

  onLoad(options: Record<string, string>) {
    this.setData({ selectedSpread: options.spread === "three" ? "three" : "single" });
  },

  selectSpread(event: WechatMiniprogram.TouchEvent) {
    wx.vibrateShort({ type: "light" });
    this.setData({ selectedSpread: event.currentTarget.dataset.value as SpreadType });
  },

  selectFocusMode(event: WechatMiniprogram.TouchEvent) {
    const selectedFocusMode = event.currentTarget.dataset.value as FocusMode;
    if (selectedFocusMode === this.data.selectedFocusMode) return;
    wx.vibrateShort({ type: "light" });
    this.setData({
      selectedFocusMode,
      decision: null,
      canAdoptRewrite: false,
      isBlocked: false,
    });
  },

  updateQuestion(event: WechatMiniprogram.Input) {
    const question = event.detail.value.slice(0, 200);
    this.setData({ question, count: question.length, decision: null, isBlocked: false });
  },

  submitReading() {
    if (this.data.selectedFocusMode === "life") {
      this.continueWithLifeReading();
      return;
    }
    const decision = classifyQuestion(this.data.question);
    if (decision.action === "allow") {
      this.continueWithQuestion(this.data.question);
      return;
    }
    this.setData({
      decision,
      canAdoptRewrite: Boolean(decision.suggestedQuestion),
      isBlocked: decision.action === "crisis_block" || decision.action === "abuse_block",
    });
  },

  continueWithLifeReading() {
    try {
      const reading = readingService.startLifeReading(this.data.selectedSpread);
      wx.navigateTo({ url: `/packages/deck/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法开始解读", icon: "none" });
    }
  },

  adoptRewrite() {
    const suggested = this.data.decision?.suggestedQuestion;
    if (!suggested) return;
    this.setData({ question: suggested, count: suggested.length, decision: null, canAdoptRewrite: false });
    this.continueWithQuestion(suggested);
  },

  continueWithQuestion(question: string) {
    try {
      const reading = readingService.startQuestion(question, this.data.selectedSpread);
      wx.navigateTo({ url: `/packages/deck/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法开始解读", icon: "none" });
    }
  },
});
