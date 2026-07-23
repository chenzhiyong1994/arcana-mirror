import { getCard, getCardImagePath } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import { getReadingSpread } from "../../core/spreads";
import type { Reading, Topic } from "../../core/types";
import { readingService } from "../../services/app-services";

const TOPIC_LABELS: Record<Topic, string> = { relationship: "感情", interpersonal: "人际", career: "事业", self: "自我" };

function toItem(reading: Reading) {
  const cards = reading.cards.map((drawn) => getCard(drawn.cardId));
  const isThree = getReadingSpread(reading) === "three";
  return {
    id: reading.id,
    kind: reading.type === "daily"
      ? "每日一牌"
      : `${reading.topic ? TOPIC_LABELS[reading.topic] : "主题解读"} · ${isThree ? "三牌" : "单牌"}`,
    date: reading.businessDate,
    card: cards.map((card, index) => `${card.name} · ${orientationLabel(reading.cards[index].orientation)}`).join(" / "),
    source: reading.interpretation?.source === "fallback"
      ? "基础牌义"
      : reading.interpretation?.source === "ai"
        ? "HY3 AI"
        : reading.interpretation?.source === "mock"
          ? "兼容解读"
          : "静态牌义",
    imagePath: getCardImagePath(reading.cards[0].cardId),
    reversed: reading.cards[0].orientation === "reversed",
  };
}

Page({
  data: { items: [] as ReturnType<typeof toItem>[] },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.setData({ items: readingService.listHistory().map(toItem) });
  },

  openReading(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id ?? "");
    if (id) wx.navigateTo({ url: `/pages/result/index?id=${id}&from=history` });
  },

  deleteReading(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id ?? "");
    if (!id) return;
    wx.showModal({
      title: "删除这条记录？",
      content: "删除后无法在本小程序内恢复。",
      confirmColor: "#a65248",
      success: (result) => {
        if (!result.confirm) return;
        try {
          readingService.deleteHistory(id);
          this.refresh();
        } catch {
          wx.showToast({ title: "删除失败", icon: "none" });
        }
      },
    });
  },

  startReading() {
    wx.navigateTo({ url: "/pages/question/index" });
  },
});
