import { collectionService, readingService } from "../../services/app-services";

Page({
  data: { collectionProgress: "0 / 78" },

  onShow() {
    const progress = collectionService.getProgress();
    this.setData({ collectionProgress: `${progress.discovered} / ${progress.total}` });
  },

  clearHistory() {
    wx.showModal({
      title: "清空全部本地历史？",
      content: "最近 30 条解读记录都会被删除，且无法恢复。",
      confirmColor: "#a65248",
      success: (result) => {
        if (!result.confirm) return;
        try {
          readingService.clearHistory();
          wx.showToast({ title: "本地历史已清空", icon: "success" });
        } catch {
          wx.showToast({ title: "清空失败", icon: "none" });
        }
      },
    });
  },

  clearCollection() {
    wx.showModal({
      title: "重置卡牌图鉴？",
      content: "已解锁卡牌和翻开次数都会清空；历史记录不会被删除。",
      confirmColor: "#a65248",
      success: (result) => {
        if (!result.confirm) return;
        try {
          collectionService.clear();
          this.setData({ collectionProgress: "0 / 78" });
          wx.showToast({ title: "图鉴已重置", icon: "success" });
        } catch {
          wx.showToast({ title: "重置失败", icon: "none" });
        }
      },
    });
  },
});
