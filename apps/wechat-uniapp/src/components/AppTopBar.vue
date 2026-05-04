<template>
  <view class="app-topbar" :class="`app-topbar--${mode}`">
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
  padding-top: env(safe-area-inset-top);
  border-bottom: 1px solid rgba(24, 24, 27, 1);
  background: #000;
}

.app-topbar__row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 0 48rpx;
}

.app-topbar__side {
  display: flex;
  flex: 0 0 148rpx;
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
