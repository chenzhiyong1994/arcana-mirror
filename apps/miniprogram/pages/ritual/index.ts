import { CARD_BACK_IMAGE_PATH, getCard, getCardImagePath } from "../../core/cards";
import { orientationLabel } from "../../core/interpretation";
import { getReadingPosition, getReadingSpread } from "../../core/spreads";
import type { Orientation } from "../../core/types";
import { collectionService, readingService } from "../../services/app-services";

interface RitualCardView {
  cardId: string;
  roman: string;
  name: string;
  englishName: string;
  orientation: Orientation;
  orientationLabel: string;
  positionLabel: string;
  imagePath: string;
  revealed: boolean;
}

Page({
  data: {
    id: "",
    missing: false,
    isThree: false,
    cards: [] as RitualCardView[],
    cardBack: CARD_BACK_IMAGE_PATH,
    revealedCount: 0,
    allRevealed: false,
  },

  onLoad(options: Record<string, string>) {
    const id = options.id ?? "";
    const reading = readingService.getById(id);
    if (!reading) {
      this.setData({ missing: true });
      return;
    }
    const cards = reading.cards.map((drawn, index) => {
      const card = getCard(drawn.cardId);
      return {
        cardId: card.id,
        roman: card.roman,
        name: card.name,
        englishName: card.englishName,
        orientation: drawn.orientation,
        orientationLabel: orientationLabel(drawn.orientation),
        positionLabel: getReadingPosition(reading, index).label,
        imagePath: getCardImagePath(card.id),
        revealed: false,
      };
    });
    this.setData({ id, cards, isThree: getReadingSpread(reading) === "three" });
  },

  revealCard(event: WechatMiniprogram.TouchEvent) {
    this.revealAt(Number(event.currentTarget.dataset.index));
  },

  revealNext() {
    const index = this.data.cards.findIndex((card) => !card.revealed);
    if (index >= 0) this.revealAt(index);
  },

  revealAt(index: number) {
    const current = this.data.cards[index];
    if (!current || current.revealed) return;
    wx.vibrateShort({ type: "medium" });
    const cards = this.data.cards.map((card, cardIndex) => cardIndex === index ? { ...card, revealed: true } : card);
    collectionService.recordReveal(current.cardId, current.orientation);
    const revealedCount = cards.filter((card) => card.revealed).length;
    this.setData({ cards, revealedCount, allRevealed: revealedCount === cards.length });
  },

  continueToResult() {
    if (this.data.id && this.data.allRevealed) {
      wx.vibrateShort({ type: "light" });
      wx.redirectTo({ url: `/pages/result/index?id=${this.data.id}` });
    }
  },

  returnHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
