import { CARD_BACK_IMAGE_PATH, getCard, getCardThumbnailPath } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import { getReadingSpread } from "../../core/spreads";
import type { Reading } from "../../core/types";
import { collectionService, readingService } from "../../services/app-services";

function toListItem(reading: Reading) {
  const cards = reading.cards.map((drawn) => getCard(drawn.cardId));
  const isThree = getReadingSpread(reading) === "three";
  return {
    id: reading.id,
    typeLabel: reading.type === "daily" ? "每日一牌" : isThree ? "三牌解读" : "单牌解读",
    title: reading.type === "daily"
      ? `${cards[0].name} · ${orientationLabel(reading.cards[0].orientation)}`
      : isThree ? cards.map((card) => card.name).join(" · ") : cards[0].name,
    date: reading.businessDate,
    source: reading.interpretation?.source ?? "—",
    imagePath: getCardThumbnailPath(reading.cards[0].cardId),
    reversed: reading.cards[0].orientation === "reversed",
  };
}

Page({
  data: {
    today: null as ReturnType<typeof toListItem> | null,
    recent: [] as ReturnType<typeof toListItem>[],
    collectionProgress: "0 / 78",
    logoPath: "/assets/branding/arcana-mirror-logo.jpg",
    cardBack: CARD_BACK_IMAGE_PATH,
  },

  onShow() {
    const today = readingService.getTodayReading();
    const collectionProgress = collectionService.getProgress();
    this.setData({
      today: today ? toListItem(today) : null,
      recent: readingService.listHistory().slice(0, 3).map(toListItem),
      collectionProgress: `${collectionProgress.discovered} / ${collectionProgress.total}`,
    });
  },

  startDaily() {
    try {
      const reading = readingService.startDaily();
      wx.navigateTo({ url: `/packages/deck/pages/ritual/index?id=${reading.id}` });
    } catch {
      wx.showToast({ title: "无法创建每日牌", icon: "none" });
    }
  },

  startSingleQuestion() {
    wx.navigateTo({ url: "/pages/question/index?spread=single" });
  },

  startThreeQuestion() {
    wx.navigateTo({ url: "/pages/question/index?spread=three" });
  },

  openHistory() {
    wx.navigateTo({ url: "/packages/deck/pages/history/index" });
  },

  openCollection() {
    wx.navigateTo({ url: "/packages/deck/pages/collection/index" });
  },

  openSettings() {
    wx.navigateTo({ url: "/pages/settings/index" });
  },

  openReading(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id ?? "");
    if (id) wx.navigateTo({ url: `/packages/deck/pages/result/index?id=${id}&from=history` });
  },
});
