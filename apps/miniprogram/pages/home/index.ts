import { getCard } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import type { Reading } from "../../core/types";
import { readingService } from "../../services/app-services";

function toListItem(reading: Reading) {
  const card = getCard(reading.cards[0].cardId);
  return {
    id: reading.id,
    typeLabel: reading.type === "daily" ? "每日一牌" : "主题解读",
    title: reading.type === "daily" ? `${card.name} · ${orientationLabel(reading.cards[0].orientation)}` : (reading.topic ?? "主题解读"),
    date: reading.businessDate,
    source: reading.interpretation?.source ?? "—",
  };
}

Page({
  data: {
    today: null as ReturnType<typeof toListItem> | null,
    recent: [] as ReturnType<typeof toListItem>[],
  },

  onShow() {
    const today = readingService.getTodayReading();
    this.setData({
      today: today ? toListItem(today) : null,
      recent: readingService.listHistory().slice(0, 3).map(toListItem),
    });
  },

  startDaily() {
    try {
      const reading = readingService.startDaily();
      wx.navigateTo({ url: `/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法创建每日牌", icon: "none" });
    }
  },

  startQuestion() {
    wx.navigateTo({ url: "/pages/question/index" });
  },

  openHistory() {
    wx.navigateTo({ url: "/pages/history/index" });
  },

  openSettings() {
    wx.navigateTo({ url: "/pages/settings/index" });
  },

  openReading(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id ?? "");
    if (id) wx.navigateTo({ url: `/pages/result/index?id=${id}&from=history` });
  },
});
