import { CLOUDBASE_ENV_ID } from "./config/cloud";
import { localReadingRepository } from "./services/app-services";

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUDBASE_ENV_ID,
        traceUser: false,
      });
    }
    // 未保存的主题解读只属于一次本地流程，不跨应用重启保留。
    localReadingRepository.clearWorking();
  },
});
