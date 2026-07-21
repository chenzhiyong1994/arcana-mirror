import type { MockMode } from "../../core/types";
import { collectionService, getMockMode, readingService, setMockMode } from "../../services/app-services";

const MODES: { value: MockMode; label: string; description: string }[] = [
  { value: "success", label: "模拟成功", description: "返回结构完整且与牌面一致的模拟解读。" },
  { value: "timeout", label: "模拟超时", description: "Provider 抛出超时，结果自动进入基础牌义降级。" },
  { value: "invalid", label: "模拟非法结构", description: "返回缺字段结果，Schema 校验失败后降级。" },
  { value: "unsafe", label: "模拟不安全输出", description: "返回确定性和操纵性文案，输出安全校验失败后降级。" },
];

Page({
  data: { modes: MODES, selectedMode: "success" as MockMode, collectionProgress: "0 / 22" },

  onShow() {
    const progress = collectionService.getProgress();
    this.setData({ selectedMode: getMockMode(), collectionProgress: `${progress.discovered} / ${progress.total}` });
  },

  selectMode(event: WechatMiniprogram.TouchEvent) {
    const mode = event.currentTarget.dataset.value as MockMode;
    setMockMode(mode);
    this.setData({ selectedMode: mode });
    wx.showToast({ title: "模拟模式已更新", icon: "none" });
  },

  clearHistory() {
    wx.showModal({
      title: "清空全部本地历史？",
      content: "每日牌和主动保存的主题解读都会被删除，且无法恢复。",
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
          this.setData({ collectionProgress: "0 / 22" });
          wx.showToast({ title: "图鉴已重置", icon: "success" });
        } catch {
          wx.showToast({ title: "重置失败", icon: "none" });
        }
      },
    });
  },
});
