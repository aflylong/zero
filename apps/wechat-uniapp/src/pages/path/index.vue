<template>
  <PageShell tab-key="path">
    <view class="path-page">
      <view class="path-hero">
        <SectionLabel>愿景</SectionLabel>
        <text class="path-hero__title">{{ visionPreview }}</text>
      </view>

      <GlassCard card-class="path-card">
        <SectionLabel>为什么必须改变</SectionLabel>
        <text class="body-text">{{ whyChangePreview }}</text>
        <view class="path-card__divider" />
        <text class="path-card__meta-label">反愿景</text>
        <text class="path-card__warning">{{ antiVisionPreview }}</text>
      </GlassCard>

      <GradientHeroCard card-class="path-quest">
        <SectionLabel>当前主线</SectionLabel>
        <text class="path-quest__title">{{ mainQuestTitle }}</text>
        <text class="body-text">{{ mainQuestDescription }}</text>
      </GradientHeroCard>

      <GlassCard card-class="path-card">
        <SectionLabel>方法原文</SectionLabel>
        <text class="path-card__title">{{ articleTitle }}</text>
        <text class="muted-text">{{ articleSummary }}</text>
        <view class="path-actions">
          <button class="ghost-button" @tap="openArticleReader">沉浸阅读</button>
          <button class="ghost-button" @tap="openPathEditor">调整道路</button>
          <button
            v-if="!store.state.data.onboardingCompleted"
            class="ghost-button"
            @tap="openOnboarding"
          >
            完成初始化
          </button>
        </view>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { articleSections, articleTitle } from "@/static/content/article";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const visionPreview = computed(
  () =>
    store.state.data.visionProfile.visionText.trim() ||
    "先把你真正想去的生活画面写清楚，这里会成为整个系统的远方。",
);
const antiVisionPreview = computed(
  () =>
    store.state.data.visionProfile.antiVisionText.trim() ||
    "把你不愿回去的生活说清楚，它会在你松掉的时候把你拉回来。",
);
const whyChangePreview = computed(
  () =>
    store.state.data.visionProfile.whyChangeText.trim() ||
    "把改变写成必须发生的理由，而不是一阵情绪。",
);
const mainQuestTitle = computed(
  () => store.state.data.visionProfile.mainQuestTitle.trim() || "先定义这一阶段的主线",
);
const mainQuestDescription = computed(
  () =>
    store.state.data.visionProfile.mainQuestDescription.trim() ||
    "把这一周最重要的推进方向写下来，今日页才有真正的主线感。",
);
const articleSummary = computed(
  () => articleSections[0]?.summary ?? "阅读原文，理解这套系统为什么能真正运转起来。",
);

function openArticleReader() {
  uni.navigateTo({
    url: "/pages/article-reader/index",
  });
}

function openPathEditor() {
  uni.navigateTo({
    url: "/pages/path-editor/index",
  });
}

function openOnboarding() {
  uni.navigateTo({
    url: "/pages/onboarding/index",
  });
}
</script>

<style scoped lang="scss">
.path-page,
.path-hero,
.path-card,
.path-quest {
  display: flex;
  flex-direction: column;
}

.path-page {
  gap: 36rpx;
}

.path-hero,
.path-card,
.path-quest {
  gap: 18rpx;
}

.path-hero__title,
.path-quest__title,
.path-card__title {
  color: #f5f5f5;
  line-height: 1.42;
}

.path-hero__title {
  font-size: 50rpx;
}

.path-quest__title,
.path-card__title {
  font-size: 34rpx;
}

.path-card__divider {
  width: 100%;
  height: 1px;
  background: rgba(39, 39, 42, 0.88);
}

.path-card__meta-label {
  color: #71717a;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.path-card__warning {
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.7;
  font-style: italic;
}

.path-actions {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
</style>
