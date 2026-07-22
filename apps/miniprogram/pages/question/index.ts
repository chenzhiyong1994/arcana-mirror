import { classifyQuestion } from "../../core/safety";
import type { SafetyDecision, SpreadType, Topic } from "../../core/types";
import { readingService } from "../../services/app-services";

const TOPICS: { value: Topic; label: string }[] = [
  { value: "relationship", label: "感情" },
  { value: "interpersonal", label: "人际" },
  { value: "career", label: "事业" },
  { value: "self", label: "自我" },
];

const SPREADS: { value: SpreadType; label: string; description: string }[] = [
  { value: "single", label: "单牌", description: "聚焦一个核心观察角度" },
  { value: "three", label: "三牌", description: "现状 · 关键影响 · 行动建议" },
];

Page({
  data: {
    topics: TOPICS,
    spreads: SPREADS,
    selectedSpread: "single" as SpreadType,
    selectedTopic: "self" as Topic,
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

  selectTopic(event: WechatMiniprogram.TouchEvent) {
    wx.vibrateShort({ type: "light" });
    this.setData({ selectedTopic: event.currentTarget.dataset.value as Topic });
  },

  updateQuestion(event: WechatMiniprogram.Input) {
    const question = event.detail.value.slice(0, 200);
    this.setData({ question, count: question.length, decision: null, isBlocked: false });
  },

  submitQuestion() {
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

  adoptRewrite() {
    const suggested = this.data.decision?.suggestedQuestion;
    if (!suggested) return;
    this.setData({ question: suggested, count: suggested.length, decision: null, canAdoptRewrite: false });
    this.continueWithQuestion(suggested);
  },

  continueWithQuestion(question: string) {
    try {
      const reading = readingService.startQuestion(this.data.selectedTopic, question, this.data.selectedSpread);
      wx.navigateTo({ url: `/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法开始解读", icon: "none" });
    }
  },
});
