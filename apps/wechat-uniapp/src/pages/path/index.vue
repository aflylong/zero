<template>
  <PageShell tab-key="path">
    <view class="path-page">
      <view class="path-hero">
        <view class="path-hero__head">
          <SectionLabel>愿景</SectionLabel>
          <button class="ghost-button" @tap="openPathEditor">编辑道路</button>
        </view>
        <text class="path-hero__title">{{ visionPreview }}</text>
        <text v-if="threeYearTuesday" class="muted-text">三年后周二:{{ threeYearTuesday }}</text>
        <text v-if="oneThingThisWeek" class="path-week">这周一件事:{{ oneThingThisWeek }}</text>
      </view>

      <view class="path-splits">
        <SectionLabel>反愿景</SectionLabel>
        <text class="path-card__warning">{{ antiVisionPreview }}</text>
        <view v-if="hasAntiNarrative" class="path-narrative">
          <text v-if="fiveYearTuesday" class="path-narrative__line">
            <text class="path-narrative__tag">5 年:</text>{{ fiveYearTuesday }}
          </text>
          <text v-if="tenYearTuesday" class="path-narrative__line">
            <text class="path-narrative__tag">10 年:</text>{{ tenYearTuesday }}
          </text>
          <text v-if="endOfLife" class="path-narrative__line">
            <text class="path-narrative__tag">尽头:</text>{{ endOfLife }}
          </text>
        </view>
      </view>

      <view class="path-splits">
        <SectionLabel>最近一次「看清是什么挡住了你」</SectionLabel>
        <text class="body-text">{{ enemyNameDisplay }}</text>
        <text class="muted-text">来自最近一次晚上回顾(N2)。每天复盘时它会自动更新。</text>
      </view>

      <GradientHeroCard card-class="path-quest">
        <SectionLabel>一年方向</SectionLabel>
        <text class="path-quest__title">{{ yearGoalTitle }}</text>
        <text class="body-text">{{ yearGoalDesc }}</text>
      </GradientHeroCard>

      <view class="path-splits">
        <SectionLabel>Boss 战(这个月目标)</SectionLabel>
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
import { articleSections, articleTitle } from "@/static/content/article";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const visionPreview = computed(
  () =>
    store.state.data.visionProfile.visionText.trim() ||
    "把你想去的生活画面写清楚。这里是整个系统的远方。",
);
const antiVisionPreview = computed(
  () =>
    store.state.data.visionProfile.antiVisionText.trim() ||
    "把你不愿回去的生活说清楚。它会在你松懈时把你拽回来。",
);
const fiveYearTuesday = computed(() => store.state.data.visionProfile.fiveYearTuesday.trim());
const tenYearTuesday = computed(() => store.state.data.visionProfile.tenYearTuesday.trim());
const endOfLife = computed(() => store.state.data.visionProfile.endOfLife.trim());
const threeYearTuesday = computed(() => store.state.data.visionProfile.threeYearTuesday.trim());
const oneThingThisWeek = computed(() => store.state.data.visionProfile.oneThingThisWeek.trim());

const hasAntiNarrative = computed(
  () => Boolean(fiveYearTuesday.value || tenYearTuesday.value || endOfLife.value),
);

const yearGoalTitle = computed(
  () => store.state.data.visionProfile.yearGoal.trim() || "先定下这一年要走到哪。",
);
const yearGoalDesc = computed(
  () =>
    store.state.data.visionProfile.yearGoalDescription.trim() ||
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
  () => articleSections[0]?.summary ?? "阅读原文,理解这套系统为什么能真正运转起来。",
);

const enemyNameDisplay = computed(() => {
  const map = store.state.data.nightSynthesisByDate ?? {};
  const keys = Object.keys(map).sort();
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    const ns = map[keys[i]];
    if (ns?.enemyName?.trim()) return ns.enemyName.trim();
  }
  return "还没命名过。今晚的「晚上回顾 N2」就把它写下来。";
});

function openArticleReader() {
  uni.navigateTo({ url: "/pages/article-reader/index" });
}

function openPathEditor() {
  uni.navigateTo({ url: "/pages/path-editor/index" });
}

onShow(() => {
  store.initialize();
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
  font-size: 44rpx;
}

.path-week {
  color: #71717a;
  font-size: 22rpx;
}

.path-quest__title,
.path-card__title {
  font-size: 32rpx;
}

.path-splits {
  padding: 4rpx 0;
}

.path-card__warning {
  color: #d4d4d8;
  font-size: 26rpx;
  line-height: 1.7;
  font-style: italic;
}

.path-narrative {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: rgba(10, 10, 11, 0.34);
}
.path-narrative__line {
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.65;
}
.path-narrative__tag {
  color: #34d399;
  font-weight: 600;
  margin-right: 8rpx;
}

.path-constraints {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.path-constraint {
  padding: 14rpx 18rpx;
  border-radius: 14rpx;
  background: rgba(10, 10, 11, 0.34);
}

.path-constraint__text {
  color: #d4d4d8;
  font-size: 26rpx;
  line-height: 1.6;
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
