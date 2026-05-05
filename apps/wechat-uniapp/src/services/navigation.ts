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

export function ensureOnboardingReady(onboardingCompleted: boolean) {
  if (onboardingCompleted) {
    return true;
  }

  goToStart();
  return false;
}
