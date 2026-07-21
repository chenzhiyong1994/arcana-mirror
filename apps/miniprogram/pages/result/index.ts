import { getCard, getCardImagePath } from "../../core/cards";
import { buildDimensionInsights, orientationLabel } from "../../core/interpretation";
import { getReadingPosition, getReadingSpread } from "../../core/spreads";
import type { InterpretationCard, Reading, Topic } from "../../core/types";
import { getMockMode, readingService } from "../../services/app-services";

const TOPIC_LABELS: Record<Topic, string> = {
  relationship: "感情",
  interpersonal: "人际",
  career: "事业",
  self: "自我",
};

function toView(reading: Reading, fromHistory: boolean) {
  const interpretation = reading.interpretation;
  const isThree = getReadingSpread(reading) === "three";
  const cards = reading.cards.map((drawn, index) => {
    const card = getCard(drawn.cardId);
    const output = interpretation?.content.cards[index] as Partial<InterpretationCard> | undefined;
    const fallback = buildDimensionInsights(card, drawn.orientation);
    const position = getReadingPosition(reading, index);
    return {
      cardId: card.id,
      roman: card.roman,
      name: card.name,
      englishName: card.englishName,
      orientation: drawn.orientation,
      orientationLabel: orientationLabel(drawn.orientation),
      positionLabel: output?.positionLabel ?? position.label,
      imagePath: getCardImagePath(card.id),
      keywords: card.keywords,
      basis: output?.basis ?? fallback.basis,
      contextualMeaning: output?.contextualMeaning ?? `${position.label}位置提醒你把牌义与现实事实对照。`,
      loveInsight: output?.loveInsight ?? fallback.loveInsight,
      wealthInsight: output?.wealthInsight ?? fallback.wealthInsight,
      careerInsight: output?.careerInsight ?? fallback.careerInsight,
      selfGrowthInsight: output?.selfGrowthInsight ?? fallback.selfGrowthInsight,
    };
  });
  const content = interpretation?.content;
  return {
    id: reading.id,
    isDaily: reading.type === "daily",
    isThree,
    saved: reading.saved,
    date: reading.businessDate,
    topic: reading.topic ? TOPIC_LABELS[reading.topic] : "每日一牌",
    title: isThree ? "三牌综合解读" : `${cards[0].name} · ${cards[0].orientationLabel}`,
    question: reading.question ?? "",
    hideQuestion: fromHistory && Boolean(reading.question),
    cards,
    sourceLabel: interpretation?.source === "fallback" ? "基础牌义降级" : interpretation?.source === "static" ? "静态牌义" : "本地模拟 AI",
    isFallback: interpretation?.source === "fallback",
    reasonCode: interpretation?.reasonCode ?? "",
    content: content ? {
      summary: content.summary,
      synthesis: content.synthesis || (isThree
        ? `把${cards.map((card) => card.name).join("、")}按现状、关键影响和行动建议连起来观察。`
        : `把${cards[0].name}放回现实处境，选择最值得验证的一个角度。`),
      reflectionQuestion: content.reflectionQuestion,
      microAction: content.microAction,
      disclaimer: content.disclaimer,
    } : null,
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
