Component({
  properties: {
    visible: { type: Boolean, value: false },
    posterPath: { type: String, value: "" },
  },

  methods: {
    close() {
      this.triggerEvent("close");
    },

    noop() {},

    preview() {
      const current = this.data.posterPath;
      if (current) wx.previewImage({ current, urls: [current] });
    },

    async save() {
      const filePath = this.data.posterPath;
      if (!filePath) return;
      try {
        await wx.saveImageToPhotosAlbum({ filePath });
        wx.showToast({ title: "已保存到相册", icon: "success" });
      } catch (error) {
        const message = (error as { errMsg?: string }).errMsg ?? "";
        if (message.includes("auth deny") || message.includes("auth denied")) {
          const result = await wx.showModal({
            title: "需要相册权限",
            content: "请在设置中允许保存到相册，之后再点一次保存。",
            confirmText: "去设置",
          });
          if (result.confirm) wx.openSetting({});
          return;
        }
        wx.showToast({ title: "保存失败，请重试", icon: "none" });
      }
    },
  },
});
