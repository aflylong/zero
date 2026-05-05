export const TAB_PAGE_PATHS = [
  "/pages/today/index",
  "/pages/path/index",
  "/pages/records/index",
  "/pages/identity/index",
] as const;

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
