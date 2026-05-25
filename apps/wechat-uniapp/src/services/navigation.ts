export const TAB_PAGE_PATHS = [
  "/pages/today/index",
  "/pages/path/index",
  "/pages/records/index",
  "/pages/identity/index",
] as const;

export const START_PAGE_PATH = "/pages/start/index";
export const TODAY_PAGE_PATH = "/pages/today/index";

export function isTabPage(url: string) {
  return TAB_PAGE_PATHS.includes(url as (typeof TAB_PAGE_PATHS)[number]);
}

export function switchToTab(url: string) {
  uni.switchTab({
    url,
    fail: () => {
      uni.reLaunch({ url });
    },
  });
}

export function goToStart() {
  uni.reLaunch({
    url: START_PAGE_PATH,
    fail: () => {
      uni.redirectTo({ url: START_PAGE_PATH });
    },
  });
}

/**
 * 软引导:首次进入(没填过 onboarding 也没启动过 journey)→ 跳到 start 页;
 * 一旦做过任何一种,Tab 直接放行。
 */
export function ensureOnboardingReady(everStarted: boolean) {
  if (everStarted) return true;
  goToStart();
  return false;
}
