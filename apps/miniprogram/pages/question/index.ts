import { classifyQuestion } from "../../core/safety";
import type { SafetyDecision, Topic } from "../../core/types";
import { readingService } from "../../services/app-services";

const TOPICS: { value: Topic; label: string }[] = [
  { value: "relationship", label: "感情" },
  { value: "interpersonal", label: "人际" },
  { value: "career", label: "事业" },
  { value: "self", label: "自我" },
];

Page({
  data: {
    topics: TOPICS,
    selectedTopic: "self" as Topic,
    question: "",
    count: 0,
    decision: null as SafetyDecision | null,
    canAdoptRewrite: false,
    isBlocked: false,
  },

  selectTopic(event: WechatMiniprogram.TouchEvent) {
    this.setData({ selectedTopic: event.currentTarget.dataset.value as Topic });
  },

  updateQuestion(event: WechatMiniprogram.Input) {
    const question = event.detail.value;
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
      const reading = readingService.startQuestion(this.data.selectedTopic, question);
      wx.navigateTo({ url: `/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法开始解读", icon: "none" });
    }
  },
});
