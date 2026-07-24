import { DECK_CARD_BACK_IMAGE_PATH } from "../../../../core/cards";
import { collectionService } from "../../../../services/app-services";

type CatalogCard = ReturnType<typeof collectionService.listCatalog>[number];

const SECTION_CONFIG = [
  { key: "major", eyebrow: "THE MAJOR ARCANA", title: "大阿尔卡那", range: "0 — XXI" },
  { key: "wands", eyebrow: "SUIT OF WANDS", title: "权杖", range: "A — KING" },
  { key: "cups", eyebrow: "SUIT OF CUPS", title: "圣杯", range: "A — KING" },
  { key: "swords", eyebrow: "SUIT OF SWORDS", title: "宝剑", range: "A — KING" },
  { key: "pentacles", eyebrow: "SUIT OF PENTACLES", title: "星币", range: "A — KING" },
] as const;

function sectionKey(card: CatalogCard) {
  return card.arcana === "major" ? "major" : card.suit;
}

function buildSections(cards: CatalogCard[]) {
  return SECTION_CONFIG.map((section) => {
    const sectionCards = cards.filter((card) => sectionKey(card) === section.key);
    return {
      ...section,
      cards: sectionCards,
      discovered: sectionCards.filter((card) => card.discovered).length,
      total: sectionCards.length,
    };
  });
}

Page({
  data: {
    cards: [] as CatalogCard[],
    sections: [] as ReturnType<typeof buildSections>,
    progress: "0 / 78",
    percent: 0,
    cardBack: DECK_CARD_BACK_IMAGE_PATH,
    selected: null as CatalogCard | null,
    previewVisible: false,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const progress = collectionService.getProgress();
    const cards = collectionService.listCatalog();
    this.setData({
      cards,
      sections: buildSections(cards),
      progress: `${progress.discovered} / ${progress.total}`,
      percent: Math.round((progress.discovered / progress.total) * 100),
    });
  },

  openCard(event: WechatMiniprogram.TouchEvent) {
    const cardId = String(event.currentTarget.dataset.id ?? "");
    const card = this.data.cards.find((item) => item.id === cardId);
    if (!card?.discovered) {
      wx.showToast({ title: "翻到这张牌后才能查看", icon: "none" });
      return;
    }
    wx.vibrateShort({ type: "light" });
    this.setData({ selected: card });
  },

  closeCard() {
    this.setData({ selected: null, previewVisible: false });
  },

  openCardPreview() {
    if (!this.data.selected) return;
    wx.vibrateShort({ type: "light" });
    this.setData({ previewVisible: true });
  },

  closeCardPreview() {
    this.setData({ previewVisible: false });
  },

  stopPropagation() {},
});
