import { CARD_BACK_IMAGE_PATH } from "../../core/cards";
import { collectionService } from "../../services/app-services";

type CatalogCard = ReturnType<typeof collectionService.listCatalog>[number];

Page({
  data: {
    cards: [] as CatalogCard[],
    progress: "0 / 22",
    percent: 0,
    cardBack: CARD_BACK_IMAGE_PATH,
    selected: null as CatalogCard | null,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const progress = collectionService.getProgress();
    this.setData({
      cards: collectionService.listCatalog(),
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
    this.setData({ selected: card });
  },

  closeCard() {
    this.setData({ selected: null });
  },

  stopPropagation() {},
});
