import { localReadingRepository } from "./services/app-services";

App({
  onLaunch() {
    // 未保存的主题解读只属于一次本地流程，不跨应用重启保留。
    localReadingRepository.clearWorking();
  },
});
