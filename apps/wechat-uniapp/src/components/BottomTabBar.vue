<template>
  <view class="tabbar">
    <view class="tabbar__row">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="tabbar__item"
        :class="{ 'tabbar__item--active': item.key === active }"
        @tap="handleTap(item.path)"
      >
        <text class="tabbar__icon">{{ item.icon }}</text>
        <text class="tabbar__label">{{ item.label }}</text>
      </button>
    </view>
    <view class="safe-spacer" />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  active: "today" | "path" | "records" | "identity";
}>();

const tabs = [
  { key: "today", label: "今日", icon: "今", path: "/pages/today/index" },
  { key: "path", label: "道路", icon: "路", path: "/pages/path/index" },
  { key: "records", label: "记录", icon: "录", path: "/pages/records/index" },
  { key: "identity", label: "身份", icon: "我", path: "/pages/identity/index" },
] as const;

function handleTap(path: string) {
  uni.reLaunch({ url: path });
}
</script>

<style scoped lang="scss">
.tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16rpx 18rpx 0;
  border-top: 1px solid rgba(39, 39, 42, 0.96);
  background: rgba(3, 3, 3, 0.98);
  backdrop-filter: blur(24rpx);
}

.tabbar__row {
  display: flex;
  gap: 12rpx;
}

.tabbar__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 24rpx;
  color: #71717a;
}

.tabbar__item--active {
  background: rgba(17, 24, 39, 0.55);
  color: #34d399;
}

.tabbar__icon {
  font-size: 24rpx;
}

.tabbar__label {
  font-size: 20rpx;
}
</style>
