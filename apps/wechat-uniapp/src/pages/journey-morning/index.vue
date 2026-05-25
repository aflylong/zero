<template>
  <PageShell
    title="早晨开掘"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="goBack"
  >
    <view class="journey-page">
      <GradientHeroCard card-class="journey-hero">
        <SectionLabel>第 1 部分 · 心理开掘</SectionLabel>
        <text class="journey-hero__title">{{ introTitle }}</text>
        <text class="body-text">
          原文要求留出 15-30 分钟,严格不外包给 AI。把"挖痛"压成"反愿景",再把反愿景对准方向。
        </text>
        <text class="muted-text">
          答完一题保存一题。中途离开下次会从同一题继续。
        </text>

        <view class="journey-stages">
          <view
            v-for="stage in stages"
            :key="stage.key"
            class="journey-stage"
            :class="{ 'journey-stage--active': current && current.stage === stage.key }"
          >
            <text class="journey-stage__name">{{ stage.label }}</text>
            <text class="journey-stage__count">{{ stageProgress(stage.key) }}</text>
          </view>
        </view>

        <text class="journey-progress">{{ answeredCount }} / {{ totalQuestions }} 已答</text>
      </GradientHeroCard>

      <GlassCard v-if="current" card-class="journey-card">
        <SectionLabel>{{ current.kicker }}</SectionLabel>
        <text class="journey-question">{{ current.question }}</text>
        <text class="muted-text">{{ current.helper }}</text>

        <textarea
          class="textarea-shell journey-textarea"
          :class="{ 'journey-textarea--short': !current.long }"
          :value="responseFor(current.key)"
          :maxlength="current.long ? 800 : 200"
          auto-height
          :placeholder="current.placeholder"
          @input="onAnswerInput($event)"
        />

        <view class="journey-nav">
          <button
            class="ghost-button journey-nav__btn"
            :disabled="!hasPrev"
            @tap="goPrev"
          >
            上一题
          </button>
          <text class="journey-nav__index">{{ current.index }} / {{ totalQuestions }}</text>
          <button
            v-if="hasNext"
            class="pill-button journey-nav__btn"
            @tap="goNext"
          >
            下一题
          </button>
          <button
            v-else
            class="pill-button journey-nav__btn"
            @tap="finishJourney"
          >
            进入夜间综合
          </button>
        </view>
      </GlassCard>

      <GlassCard card-class="journey-card">
        <SectionLabel>15 题目录</SectionLabel>
        <view class="journey-list">
          <button
            v-for="q in questions"
            :key="q.key"
            class="journey-list-item"
            :class="{
              'journey-list-item--active': q.key === currentKey,
              'journey-list-item--done': Boolean(responseFor(q.key).trim()),
            }"
            @tap="goTo(q.key)"
          >
            <text class="journey-list-item__title">{{ q.kicker }}</text>
          </button>
        </view>
      </GlassCard>

      <GlassCard card-class="journey-card">
        <SectionLabel>来自原文的提醒</SectionLabel>
        <text class="body-text">
          「不要试图把这种沉思外包给 AI。我希望你突破你心智上的『限速器』。」
        </text>
        <text class="muted-text">
          这套题的价值在「答」,不在「读」。如果某题让你不舒服,那条路通常就是要走的方向。
        </text>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { excavationQuestions, type ExcavationQuestion, type ExcavationStage } from "@/static/content/excavationQuestions";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();
const questions = excavationQuestions;
const totalQuestions = questions.length;

const stages: { key: ExcavationStage; label: string }[] = [
  { key: "discomfort", label: "看见钝感不满 (Q1-Q4)" },
  { key: "anti-vision", label: "反愿景叙事 (Q5-Q11)" },
  { key: "vision-mvp", label: "愿景 MVP (Q12-Q15)" },
];

const currentKey = ref<string>(
  store.state.data.morningExcavation.currentQuestionKey || "q1",
);

const current = computed<ExcavationQuestion | null>(
  () => questions.find((q) => q.key === currentKey.value) ?? questions[0],
);

const responses = computed(() => store.state.data.morningExcavation.responses);

function responseFor(key: string): string {
  return responses.value[key] ?? "";
}

const answeredCount = computed(
  () => questions.filter((q) => responseFor(q.key).trim()).length,
);

function stageProgress(stage: ExcavationStage): string {
  const inStage = questions.filter((q) => q.stage === stage);
  const done = inStage.filter((q) => responseFor(q.key).trim()).length;
  return `${done} / ${inStage.length}`;
}

const currentIndex = computed(() =>
  questions.findIndex((q) => q.key === currentKey.value),
);
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < totalQuestions - 1);

const introTitle = computed(() => {
  if (answeredCount.value === 0) return "你想去哪里、不要回到哪里。";
  if (answeredCount.value < 11) return "继续往下挖。痛挖到位,反愿景才能转方向。";
  if (answeredCount.value < 15) return "进入愿景 MVP。先放下「现实性」。";
  return "已经全部答完。该进入夜晚综合。";
});

function onAnswerInput(e: UniValueEvent) {
  if (!current.value) return;
  store.updateExcavationResponse(current.value.key, String(e.detail?.value ?? ""));
}

function goPrev() {
  if (!hasPrev.value) return;
  currentKey.value = questions[currentIndex.value - 1].key;
  store.setExcavationCurrent(currentKey.value);
}

function goNext() {
  if (!hasNext.value) return;
  currentKey.value = questions[currentIndex.value + 1].key;
  store.setExcavationCurrent(currentKey.value);
}

function goTo(key: string) {
  currentKey.value = key;
  store.setExcavationCurrent(key);
}

function finishJourney() {
  uni.navigateTo({ url: "/pages/journey-night/index" });
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  switchToTab(TODAY_PAGE_PATH);
}

onShow(() => {
  store.initialize();
  // 进入页面时同步一下当前题
  currentKey.value =
    store.state.data.morningExcavation.currentQuestionKey || currentKey.value;
});
</script>

<style scoped lang="scss">
.journey-page,
.journey-hero,
.journey-card {
  display: flex;
  flex-direction: column;
}
.journey-page { gap: 24rpx; }
.journey-hero,
.journey-card { gap: 18rpx; }

.journey-hero__title {
  color: #f5f5f5;
  font-size: 38rpx;
  line-height: 1.34;
  font-weight: 600;
}

.journey-stages {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(10, 10, 11, 0.34);
}
.journey-stage {
  display: flex;
  justify-content: space-between;
  color: #71717a;
  font-size: 24rpx;
}
.journey-stage--active {
  color: #d1fae5;
}

.journey-progress {
  color: #a1a1aa;
  font-size: 22rpx;
}

.journey-question {
  color: #f5f5f5;
  font-size: 32rpx;
  line-height: 1.55;
  font-weight: 500;
}

.journey-textarea {
  min-height: 280rpx;
}
.journey-textarea--short {
  min-height: 100rpx;
}

.journey-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.journey-nav__btn {
  flex-shrink: 0;
}
.journey-nav__index {
  color: #71717a;
  font-size: 22rpx;
}

.journey-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}
.journey-list-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 18rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 16rpx;
  background: transparent;
  text-align: left;
}
.journey-list-item--active {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.18);
}
.journey-list-item--done {
  color: #d4d4d8;
}
.journey-list-item__title {
  color: #d4d4d8;
  font-size: 24rpx;
  flex: 1;
}
</style>
