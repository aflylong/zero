<template>
  <PageShell title="归零" topbar-mode="none" compact>
    <view class="start-page">
      <view class="start-hero">
        <text class="start-kicker">RE:ZERO · 归零</text>
        <text class="start-title">用一天,重启你的人生。</text>
        <text class="start-copy">
          这个系统基于一篇文章。它不是鸡汤,是一套可以在一天内执行的心智重置流程。
        </text>
        <text class="start-copy">
          建议先花 20 分钟把原文读完——想清楚你要去哪、不要回到哪——再来设置方向、身份和目标。
        </text>
      </view>

      <view class="start-flow">
        <view
          v-for="(item, index) in steps"
          :key="item.title"
          class="start-flow__item"
        >
          <text class="start-flow__index">0{{ index + 1 }}</text>
          <view class="start-flow__copy">
            <text class="start-flow__title">{{ item.title }}</text>
            <text class="start-flow__body">{{ item.body }}</text>
          </view>
        </view>
      </view>

      <button class="pill-button start-button" @tap="readArticle">
        先读原文
      </button>

      <button class="ghost-button start-button" @tap="startOnboarding">
        我想清楚了,直接设置
      </button>

      <text class="start-note">未完成初始化前,不会展示完整 tab 内容。</text>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import PageShell from "@/components/PageShell.vue";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const steps = [
  {
    title: "写清楚方向",
    body: "愿景和反愿景先定住,不要让系统变成散乱清单。",
  },
  {
    title: "确定身份",
    body: "用一句身份陈述,让每天的动作有统一标准。",
  },
  {
    title: "启动今日证明",
    body: "设一条今天就能完成的动作,和提醒时间。",
  },
] as const;

function readArticle() {
  uni.navigateTo({
    url: "/pages/article-reader/index",
  });
}

function startOnboarding() {
  uni.navigateTo({
    url: "/pages/onboarding/index",
  });
}

onShow(() => {
  store.initialize();
  if (store.state.data.onboardingCompleted) {
    switchToTab(TODAY_PAGE_PATH);
  }
});
</script>

<style scoped lang="scss">
.start-page {
  display: flex;
  min-height: calc(100vh - 96rpx);
  flex-direction: column;
  justify-content: center;
  gap: 34rpx;
  padding-top: calc(env(safe-area-inset-top) + 28rpx);
}

.start-hero {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.start-kicker {
  color: #34d399;
  font-size: 20rpx;
  letter-spacing: 5rpx;
}

.start-title {
  max-width: 620rpx;
  color: #f5f5f5;
  font-size: 68rpx;
  line-height: 1.08;
  font-weight: 600;
}

.start-copy,
.start-note {
  color: #a1a1aa;
  font-size: 28rpx;
  line-height: 1.68;
}

.start-flow {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  border-top: 1px solid rgba(39, 39, 42, 0.82);
  border-bottom: 1px solid rgba(39, 39, 42, 0.82);
}

.start-flow__item {
  display: flex;
  gap: 22rpx;
  padding: 26rpx 0;
}

.start-flow__item + .start-flow__item {
  border-top: 1px solid rgba(24, 24, 27, 0.94);
}

.start-flow__index {
  width: 52rpx;
  color: #52525b;
  font-size: 22rpx;
  line-height: 1.5;
  flex-shrink: 0;
}

.start-flow__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.start-flow__title {
  color: #f4f4f5;
  font-size: 30rpx;
  line-height: 1.4;
}

.start-flow__body {
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.6;
}

.start-button {
  align-self: flex-start;
  min-width: 260rpx;
  padding: 22rpx 36rpx;
  font-size: 28rpx;
}
</style>
