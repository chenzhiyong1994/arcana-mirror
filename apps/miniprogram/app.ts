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
    // 未完成的主题流程不跨应用重启保留；完成结果已进入最近历史。
    localReadingRepository.clearWorking();
  },
});
