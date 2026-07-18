import { MockInterpretationProvider } from "../core/mock-provider";
import { ReadingService } from "../core/reading-service";
import type { MockMode } from "../core/types";
import { WxReadingRepository } from "../infra/wx-reading-repository";

const MOCK_MODE_KEY = "arcana_mirror_mock_mode_v1";

export const localReadingRepository = new WxReadingRepository();
export const readingService = new ReadingService({
  repository: localReadingRepository,
  provider: new MockInterpretationProvider(),
});

export function getMockMode(): MockMode {
  const value = wx.getStorageSync<MockMode>(MOCK_MODE_KEY);
  return ["success", "timeout", "invalid", "unsafe"].includes(value) ? value : "success";
}

export function setMockMode(mode: MockMode): void {
  wx.setStorageSync(MOCK_MODE_KEY, mode);
}
