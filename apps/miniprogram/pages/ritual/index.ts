import { getCard } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import { readingService } from "../../services/app-services";

Page({
  data: {
    id: "",
    revealed: false,
    missing: false,
    card: null as null | { roman: string; name: string; englishName: string; orientation: string },
  },

  onLoad(options: Record<string, string>) {
    const id = options.id ?? "";
    const reading = readingService.getById(id);
    if (!reading) {
      this.setData({ missing: true });
      return;
    }
    const card = getCard(reading.cards[0].cardId);
    this.setData({
      id,
      card: { roman: card.roman, name: card.name, englishName: card.englishName, orientation: orientationLabel(reading.cards[0].orientation) },
    });
  },

  reveal() {
    this.setData({ revealed: true });
  },

  continueToResult() {
    if (this.data.id) wx.redirectTo({ url: `/pages/result/index?id=${this.data.id}` });
  },

  returnHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
