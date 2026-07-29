import { getCard, getCardImagePath } from "../../../../core/cards";
import { buildTopicInsight, orientationLabel } from "../../../../core/interpretation";
import { getReadingPosition, getReadingSpread } from "../../../../core/spreads";
import type { InterpretationCard, Reading, Topic } from "../../../../core/types";
import { readingService } from "../../../../services/app-services";
import { createSharePoster } from "../../../../services/share-poster";

const TOPIC_LABELS: Record<Topic, string> = {
  relationship: "感情",
  interpersonal: "人际",
  career: "事业",
  self: "自我",
};

function toView(reading: Reading) {
  const interpretation = reading.interpretation;
  const isThree = getReadingSpread(reading) === "three";
  const cards = reading.cards.map((drawn, index) => {
    const card = getCard(drawn.cardId);
    const output = interpretation?.content.cards[index] as Partial<InterpretationCard> | undefined;
    const fallback = buildTopicInsight(card, drawn.orientation, reading.topic);
    const position = getReadingPosition(reading, index);
    return {
      cardId: card.id,
      arcana: card.arcana,
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
      topicLabel: output?.topicLabel ?? fallback.topicLabel,
      topicInsight: output?.topicInsight
        ?? (reading.topic === "relationship" ? output?.loveInsight : reading.topic === "career" ? output?.careerInsight : output?.selfGrowthInsight)
        ?? fallback.topicInsight,
    };
  });
  const content = interpretation?.content;
  return {
    id: reading.id,
    isDaily: reading.type === "daily",
    isThree,
    date: reading.businessDate,
    topic: reading.type === "daily" ? "每日一牌" : reading.topic ? TOPIC_LABELS[reading.topic] : "主题解读",
    title: isThree ? "三牌综合解读" : `${cards[0].name} · ${cards[0].orientationLabel}`,
    question: reading.question ?? "",
    cards,
    sourceLabel: interpretation?.source === "fallback"
      ? "基础解读"
      : interpretation?.source === "static"
        ? "本地牌义"
        : interpretation?.source === "ai"
          ? "AI 个性化解读"
          : "兼容解读",
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
    questionExpanded: false,
    activeCardIndex: 0,
    activeCard: null as ReturnType<typeof toView>["cards"][number] | null,
    detailsExpanded: false,
    previewCard: null as ReturnType<typeof toView>["cards"][number] | null,
    previewVisible: false,
    generatingPoster: false,
    posterPath: "",
    posterVisible: false,
    view: null as ReturnType<typeof toView> | null,
  },

  async onLoad(options: Record<string, string>) {
    const id = options.id ?? "";
    this.setData({ id, questionExpanded: false });
    let reading = readingService.getById(id);
    if (!reading) {
      this.setData({ loading: false, missing: true });
      return;
    }
    if (reading.type === "question" && !reading.interpretation) {
      try {
        reading = await readingService.interpretQuestion(id);
      } catch {
        this.setData({ loading: false, missing: true });
        return;
      }
    }
    const view = toView(reading);
    this.setData({ loading: false, view, activeCard: view.cards[0] });
  },

  onUnload() {
    if (this.data.id) readingService.discardQuestion(this.data.id);
  },

  toggleQuestion() {
    this.setData({ questionExpanded: !this.data.questionExpanded });
  },

  handleCardTap(event: WechatMiniprogram.TouchEvent) {
    const activeCardIndex = Number(event.currentTarget.dataset.index);
    const activeCard = this.data.view?.cards[activeCardIndex];
    if (!activeCard) return;
    wx.vibrateShort({ type: "light" });
    if (activeCardIndex === this.data.activeCardIndex) {
      this.setData({ previewCard: activeCard, previewVisible: true });
      return;
    }
    this.setData({ activeCardIndex, activeCard, detailsExpanded: false });
  },

  closeCardPreview() {
    this.setData({ previewVisible: false });
  },

  toggleDetails() {
    this.setData({ detailsExpanded: !this.data.detailsExpanded });
  },

  copyAction() {
    const action = this.data.view?.content?.microAction;
    if (action) {
      wx.vibrateShort({ type: "light" });
      wx.setClipboardData({ data: action });
    }
  },

  async generateSharePoster() {
    const view = this.data.view;
    if (this.data.generatingPoster || !view?.content) return;

    this.setData({ generatingPoster: true });
    wx.showLoading({ title: "正在显影", mask: true });
    try {
      const posterPath = await createSharePoster(this, {
        topic: view.topic,
        date: view.date,
        title: view.title,
        summary: view.content.summary,
        microAction: view.content.microAction,
        cards: view.cards,
      });
      this.setData({ posterPath, posterVisible: true });
    } catch {
      wx.showModal({
        title: "分享图暂时无法生成",
        content: "请检查网络，并确认 CloudBase 的 api 云函数已经部署后再试。",
        showCancel: false,
        confirmText: "知道了",
      });
    } finally {
      wx.hideLoading();
      this.setData({ generatingPoster: false });
    }
  },

  closePoster() {
    this.setData({ posterVisible: false });
  },

  finish() {
    if (this.data.id) readingService.discardQuestion(this.data.id);
    wx.reLaunch({ url: "/pages/home/index" });
  },

  returnHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
