import { getCard } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import type { Reading, Topic } from "../../core/types";
import { getMockMode, readingService } from "../../services/app-services";

const TOPIC_LABELS: Record<Topic, string> = {
  relationship: "感情",
  interpersonal: "人际",
  career: "事业",
  self: "自我",
};

function toView(reading: Reading, fromHistory: boolean) {
  const card = getCard(reading.cards[0].cardId);
  const interpretation = reading.interpretation;
  return {
    id: reading.id,
    isDaily: reading.type === "daily",
    saved: reading.saved,
    date: reading.businessDate,
    topic: reading.topic ? TOPIC_LABELS[reading.topic] : "每日一牌",
    question: reading.question ?? "",
    hideQuestion: fromHistory && Boolean(reading.question),
    card: {
      roman: card.roman,
      name: card.name,
      englishName: card.englishName,
      orientation: orientationLabel(reading.cards[0].orientation),
      keywords: card.keywords,
    },
    sourceLabel: interpretation?.source === "fallback" ? "基础牌义降级" : interpretation?.source === "static" ? "静态牌义" : "本地模拟 AI",
    isFallback: interpretation?.source === "fallback",
    reasonCode: interpretation?.reasonCode ?? "",
    content: interpretation?.content ?? null,
  };
}

Page({
  data: {
    id: "",
    loading: true,
    missing: false,
    fromHistory: false,
    questionExpanded: false,
    view: null as ReturnType<typeof toView> | null,
  },

  async onLoad(options: Record<string, string>) {
    const id = options.id ?? "";
    const fromHistory = options.from === "history";
    this.setData({ id, fromHistory, questionExpanded: !fromHistory });
    let reading = readingService.getById(id);
    if (!reading) {
      this.setData({ loading: false, missing: true });
      return;
    }
    if (reading.type === "question" && !reading.interpretation) {
      try {
        reading = await readingService.interpretQuestion(id, getMockMode());
      } catch {
        this.setData({ loading: false, missing: true });
        return;
      }
    }
    this.setData({ loading: false, view: toView(reading, fromHistory) });
  },

  onUnload() {
    if (this.data.id) readingService.discardQuestion(this.data.id);
  },

  toggleQuestion() {
    this.setData({ questionExpanded: !this.data.questionExpanded });
  },

  saveToHistory() {
    try {
      const reading = readingService.saveQuestionToHistory(this.data.id);
      this.setData({ view: toView(reading, false) });
      wx.showToast({ title: "已保存到本地历史", icon: "success" });
    } catch {
      wx.showToast({ title: "保存失败", icon: "none" });
    }
  },

  copyAction() {
    const action = this.data.view?.content?.microAction;
    if (action) wx.setClipboardData({ data: action });
  },

  finish() {
    if (this.data.id) readingService.discardQuestion(this.data.id);
    wx.reLaunch({ url: "/pages/home/index" });
  },

  returnHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
