<template>
  <PageShell tab-key="path">
    <view class="path-page">
      <view class="path-hero">
        <view class="path-hero__head">
          <SectionLabel>愿景</SectionLabel>
          <button class="ghost-button" @tap="openPathEditor">调整道路</button>
        </view>
        <text class="path-hero__title">{{ visionPreview }}</text>
      </view>

      <view class="path-splits">
        <SectionLabel>为什么必须改变</SectionLabel>
        <text class="body-text">{{ whyChangePreview }}</text>
        <view class="path-splits__divider" />
        <text class="path-splits__meta-label">反愿景</text>
        <text class="path-card__warning">{{ antiVisionPreview }}</text>
      </view>

      <GradientHeroCard card-class="path-quest">
        <SectionLabel>一年目标 · 主线任务</SectionLabel>
        <text class="path-quest__title">{{ yearGoalTitle }}</text>
        <text class="body-text">{{ yearGoalDesc }}</text>
      </GradientHeroCard>

      <view class="path-splits">
        <SectionLabel>一月项目 · Boss 战</SectionLabel>
        <text class="path-card__title">{{ monthProjectTitle }}</text>
        <text class="body-text">{{ monthProjectDesc }}</text>
      </view>

      <view class="path-splits">
        <SectionLabel>约束 · 不能碰的红线</SectionLabel>
        <text v-if="!constraints.length" class="muted-text">
          约束是你为了实现愿景,绝不愿意牺牲的东西。睡眠、家人、健康——这些是护栏。去编辑页加几条。
        </text>
        <view v-else class="path-constraints">
          <view
            v-for="(item, idx) in constraints"
            :key="`c-${idx}`"
            class="path-constraint"
          >
            <text class="path-constraint__text">· {{ item }}</text>
          </view>
        </view>
      </view>

      <button class="path-article-row" @tap="openArticleReader">
        <view class="path-article-row__copy">
          <SectionLabel>方法原文</SectionLabel>
          <text class="path-card__title">{{ articleTitle }}</text>
          <text class="muted-text">{{ articleSummary }}</text>
        </view>
        <text class="path-article-row__arrow">›</text>
      </button>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { ensureOnboardingReady } from "@/services/navigation";
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
    "把这一周最重要的推进方向写下来,今日页才有真正的主线感。",
);
const yearGoalTitle = computed(
  () =>
    store.state.data.visionProfile.yearGoal.trim() ||
    store.state.data.visionProfile.mainQuestTitle.trim() ||
    "先定下这一年要走到哪。",
);
const yearGoalDesc = computed(
  () =>
    store.state.data.visionProfile.yearGoalDescription.trim() ||
    store.state.data.visionProfile.mainQuestDescription.trim() ||
    "一年后什么必须为真,你才会承认自己赢了?",
);
const monthProjectTitle = computed(
  () => store.state.data.visionProfile.monthProject.trim() || "这个月要攻克的具体里程碑是什么?",
);
const monthProjectDesc = computed(
  () =>
    store.state.data.visionProfile.monthProjectDescription.trim() ||
    "想清楚:做完这件事,一年目标是不是更近了一步?",
);
const constraints = computed(() =>
  store.state.data.visionProfile.constraints.filter((c) => c.trim()),
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

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }
});
</script>

<style scoped lang="scss">
.path-page,
.path-hero,
.path-card,
.path-quest,
.path-splits,
.path-article-row__copy {
  display: flex;
  flex-direction: column;
}

.path-page {
  gap: 26rpx;
}

.path-hero,
.path-card,
.path-quest,
.path-splits,
.path-article-row__copy {
  gap: 18rpx;
}

.path-hero__head {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.path-hero__title,
.path-quest__title,
.path-card__title {
  color: #f5f5f5;
  line-height: 1.42;
}

.path-hero__title {
  font-size: 48rpx;
}

.path-quest__title,
.path-card__title {
  font-size: 34rpx;
}

.path-splits {
  padding: 4rpx 0;
}

.path-splits__divider {
  width: 100%;
  height: 1px;
  background: rgba(39, 39, 42, 0.88);
}

.path-splits__meta-label {
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

.path-article-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 0;
  border-top: 1px solid rgba(39, 39, 42, 0.82);
  border-bottom: 1px solid rgba(39, 39, 42, 0.82);
  text-align: left;
}

.path-article-row__copy {
  flex: 1;
  min-width: 0;
}

.path-article-row__arrow {
  color: #52525b;
  font-size: 44rpx;
  line-height: 1;
}
</style>


