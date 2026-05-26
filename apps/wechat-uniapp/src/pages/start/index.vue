<template>
  <PageShell title="归零" topbar-mode="none" compact>
    <view class="start-page">
      <view class="start-hero">
        <text class="start-kicker">RE:ZERO · 归零</text>
        <text class="start-title">用一天,重启你的人生。</text>
        <text class="start-copy">
          这套系统基于 Dan Koe 的一篇长文。原文给的是一套需要花
          <text class="start-copy__bold">整整一天</text>跑完的心智重置流程,而不是几分钟的表单。
        </text>
        <text class="start-copy">
          推荐路径:先把原文读完(7 章,约 20 分钟),然后留出整整一天,严格按系统的引导回答 22 道题——
          11 道早晨开掘、9 道白天打断、5 步晚上回顾。
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

      <button class="ghost-button start-button" @tap="startJourney">
        今天就跑一遍流程
      </button>

      <button class="ghost-button start-button start-button--small" @tap="startOnboarding">
        我已读已想过,直接快速设置
      </button>

      <button class="ghost-button start-button start-button--small" @tap="openPrivacy">
        隐私政策
      </button>
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
    title: "读原文 · 看清结构",
    body: "7 章串起原文核心:身份、目标、控制论、心智阶段、6 组件。",
  },
  {
    title: "跑流程 · 22 题深挖",
    body: "11 题早晨开掘 + 9 题白天打断 + 5 步晚上回顾,严格按时间走。",
  },
  {
    title: "把每天变成证据",
    body: "把当晚综合的明天的几个时间段自动升格为「每日动作」,系统就开始跑。",
  },
] as const;

function readArticle() {
  uni.navigateTo({ url: "/pages/article-reader/index" });
}

function startJourney() {
  uni.navigateTo({ url: "/pages/journey-morning/index" });
}

function startOnboarding() {
  uni.navigateTo({ url: "/pages/onboarding/index" });
}

function openPrivacy() {
  uni.navigateTo({ url: "/pages/privacy/index" });
}

onShow(() => {
  store.initialize();
  const everStarted =
    store.state.data.onboardingCompleted ||
    store.state.data.journeyCompleted ||
    Boolean(store.state.data.morningExcavation.startedAt);
  if (everStarted) {
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
  gap: 30rpx;
  padding-top: calc(env(safe-area-inset-top) + 28rpx);
}

.start-hero {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.start-kicker {
  color: #34d399;
  font-size: 20rpx;
  letter-spacing: 5rpx;
}

.start-title {
  max-width: 620rpx;
  color: #f5f5f5;
  font-size: 64rpx;
  line-height: 1.08;
  font-weight: 600;
}

.start-copy {
  color: #a1a1aa;
  font-size: 28rpx;
  line-height: 1.68;
}

.start-copy__bold {
  color: #f5f5f5;
  font-weight: 600;
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
  padding: 24rpx 0;
}

.start-flow__item + .start-flow__item {
  border-top: 1px solid rgba(24, 24, 27, 0.94);
}

.start-flow__index {
  width: 52rpx;
  color: #52525b;
  font-size: 22rpx;
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
  font-size: 28rpx;
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

.start-button--small {
  font-size: 24rpx;
  color: #71717a;
}
</style>
