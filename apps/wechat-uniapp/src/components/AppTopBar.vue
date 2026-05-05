<template>
  <view class="app-topbar" :class="`app-topbar--${mode}`" :style="topbarStyle">
    <view class="app-topbar__row">
      <view class="app-topbar__side app-topbar__side--left">
        <button
          v-if="mode === 'secondary'"
          class="app-topbar__back"
          @tap="handleBack"
        >
          <text class="app-topbar__back-icon">‹</text>
          <text class="app-topbar__back-label">{{ backLabel }}</text>
        </button>
      </view>

      <view class="app-topbar__center">
        <text class="app-topbar__title">{{ title }}</text>
        <slot name="center" />
      </view>

      <view class="app-topbar__side app-topbar__side--right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  title: string;
  mode?: "tab" | "secondary";
  backLabel?: string;
  backUrl?: string;
  backAction?: (() => void) | null;
}>(), {
  mode: "tab",
  backLabel: "返回",
  backUrl: "",
  backAction: null,
});

function resolveTopBarMetrics() {
  const systemInfo = uni.getSystemInfoSync();
  const windowWidth = systemInfo.windowWidth ?? 375;
  const statusBarHeight = systemInfo.statusBarHeight ?? 20;
  const fallbackHorizontalPadding = 16;
  const fallbackSideWidth = 88;
  const fallbackNavHeight = 44;
  const getMenuButtonRect = (
    uni as typeof uni & {
      getMenuButtonBoundingClientRect?: () => {
        top: number;
        right: number;
        width: number;
        height: number;
      };
    }
  ).getMenuButtonBoundingClientRect;
  const menuButtonRect = typeof getMenuButtonRect === "function"
    ? getMenuButtonRect()
    : null;

  if (!menuButtonRect) {
    return {
      statusBarHeight,
      navHeight: fallbackNavHeight,
      sideWidth: fallbackSideWidth,
      horizontalPadding: fallbackHorizontalPadding,
    };
  }

  const rightGap = Math.max(windowWidth - menuButtonRect.right, fallbackHorizontalPadding);
  const navGap = Math.max(menuButtonRect.top - statusBarHeight, 4);

  return {
    statusBarHeight,
    navHeight: navGap * 2 + menuButtonRect.height,
    sideWidth: Math.max(menuButtonRect.width + rightGap, fallbackSideWidth),
    horizontalPadding: rightGap,
  };
}

const topbarMetrics = resolveTopBarMetrics();
const topbarStyle = computed(() => ({
  "--app-topbar-status-height": `${topbarMetrics.statusBarHeight}px`,
  "--app-topbar-nav-height": `${topbarMetrics.navHeight}px`,
  "--app-topbar-side-width": `${topbarMetrics.sideWidth}px`,
  "--app-topbar-horizontal-padding": `${topbarMetrics.horizontalPadding}px`,
}));

function handleBack() {
  if (props.backAction) {
    props.backAction();
    return;
  }

  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }

  if (props.backUrl) {
    uni.reLaunch({ url: props.backUrl });
  }
}
</script>

<style scoped lang="scss">
.app-topbar {
  position: relative;
  z-index: 5;
  padding-top: var(--app-topbar-status-height);
  border-bottom: 1px solid rgba(24, 24, 27, 1);
  background: #000;
}

.app-topbar__row {
  display: flex;
  align-items: center;
  min-height: var(--app-topbar-nav-height);
  padding: 0 var(--app-topbar-horizontal-padding);
}

.app-topbar__side {
  display: flex;
  flex: 0 0 var(--app-topbar-side-width);
  align-items: center;
  min-width: 0;
}

.app-topbar__side--right {
  justify-content: flex-end;
}

.app-topbar__center {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 12rpx;
}

.app-topbar__title {
  overflow: hidden;
  max-width: 100%;
  color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.2;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-topbar__back {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  min-height: 64rpx;
  padding-right: 8rpx;
  color: #a1a1aa;
}

.app-topbar__back-icon {
  margin-top: -2rpx;
  font-size: 38rpx;
  line-height: 1;
}

.app-topbar__back-label {
  font-size: 24rpx;
  line-height: 1;
}
</style>
