<template>
  <view class="tabbar">
    <view class="tabbar__frame">
      <view class="tabbar__row">
        <view
          v-for="item in tabs"
          :key="item.key"
          class="tabbar__item"
          :class="{ 'tabbar__item--active': item.key === active }"
          @tap="handleTap(item.path)"
        >
          <view class="tabbar__icon" :class="`tabbar__icon--${item.icon}`">
            <view class="tabbar__icon-core" />
          </view>
          <text class="tabbar__label">{{ item.label }}</text>
        </view>
      </view>
      <view class="safe-spacer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { switchToTab } from "@/services/navigation";

defineProps<{
  active: "today" | "path" | "records" | "identity";
}>();

const tabs = [
  { key: "today", label: "今日", icon: "today", path: "/pages/today/index" },
  { key: "path", label: "道路", icon: "path", path: "/pages/path/index" },
  { key: "records", label: "记录", icon: "records", path: "/pages/records/index" },
  { key: "identity", label: "身份", icon: "identity", path: "/pages/identity/index" },
] as const;

function handleTap(path: string) {
  switchToTab(path);
}
</script>

<style scoped lang="scss">
.tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 1px solid rgba(24, 24, 27, 1);
  background: #000;
}

.tabbar__frame {
  max-width: 448px;
  margin: 0 auto;
  padding: 10rpx 16rpx 0;
}

.tabbar__row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tabbar__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
  justify-content: center;
  padding: 14rpx 0 18rpx;
  color: #52525b;
}

.tabbar__item--active {
  color: #34d399;
}

.tabbar__icon {
  position: relative;
  width: 34rpx;
  height: 34rpx;
}

.tabbar__icon::before,
.tabbar__icon::after,
.tabbar__icon-core {
  position: absolute;
  content: "";
  box-sizing: border-box;
}

.tabbar__icon--today::before {
  top: 50%;
  left: 50%;
  width: 6rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.tabbar__icon--today::after {
  top: 50%;
  left: 50%;
  width: 42rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.tabbar__icon--today .tabbar__icon-core {
  top: 50%;
  left: 50%;
  width: 18rpx;
  height: 18rpx;
  border: 3rpx solid currentColor;
  border-radius: 999rpx;
  background: #000;
  transform: translate(-50%, -50%);
}

.tabbar__icon--path::before {
  top: 50%;
  left: 50%;
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid currentColor;
  border-radius: 8rpx;
  transform: translate(-50%, -50%) rotate(45deg);
}

.tabbar__icon--path .tabbar__icon-core {
  top: 50%;
  left: 50%;
  width: 7rpx;
  height: 18rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%) rotate(30deg);
}

.tabbar__icon--records::before {
  top: 7rpx;
  left: 5rpx;
  width: 24rpx;
  height: 22rpx;
  border: 3rpx solid currentColor;
  border-radius: 8rpx;
}

.tabbar__icon--records::after {
  top: 12rpx;
  left: 10rpx;
  width: 14rpx;
  height: 3rpx;
  background: currentColor;
  box-shadow:
    0 8rpx 0 currentColor,
    -8rpx -5rpx 0 currentColor,
    8rpx -5rpx 0 currentColor;
}

.tabbar__icon--identity::before {
  top: 50%;
  left: 50%;
  width: 6rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.tabbar__icon--identity::after {
  top: 50%;
  left: 50%;
  width: 28rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.tabbar__icon--identity .tabbar__icon-core {
  top: 50%;
  left: 50%;
  width: 28rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: translate(-50%, -50%) rotate(45deg);
}

.tabbar__label {
  font-size: 20rpx;
  line-height: 1;
}
</style>
