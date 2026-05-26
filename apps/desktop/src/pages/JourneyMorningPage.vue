<template>
  <div class="journey-morning">
    <PageHeader
      title="早晨开掘"
      kicker="JOURNEY · 早晨开掘"
      :description="description"
      back
      back-to="/today"
    >
      <template #actions>
        <span class="journey-morning__progress">
          {{ answeredCount }} / {{ totalQuestions }}
        </span>
      </template>
    </PageHeader>

    <PageBody>
      <div class="journey-morning__frame">
        <!-- 引言 -->
        <GlassCard variant="hero">
          <SectionLabel :icon="Compass">第 1 部分 · 认真想清楚</SectionLabel>
          <h2 class="journey-morning__intro-title">{{ introTitle }}</h2>
          <p class="body-text">
            原文要求留出 15-30 分钟,严格不外包给 AI。这是把"挖痛"压成"反愿景"、再把反愿景对准方向的过程。
          </p>
          <p class="muted-text">
            一题一题来,答不上来就跳过,晚点再回来。所有答案都自动保存。
          </p>
          <div class="journey-morning__stages">
            <div
              v-for="stage in stages"
              :key="stage.key"
              class="journey-morning__stage"
              :class="stageClass(stage.key)"
            >
              <span class="journey-morning__stage-name">{{ stage.label }}</span>
              <span class="journey-morning__stage-count">
                {{ stageProgress(stage.key) }}
              </span>
            </div>
          </div>
        </GlassCard>

        <!-- 当前题 -->
        <GlassCard v-if="current">
          <SectionLabel :icon="iconForStage(current.stage)">
            {{ current.kicker }}
          </SectionLabel>
          <p class="journey-morning__question">{{ current.question }}</p>
          <p class="muted-text">{{ current.helper }}</p>

          <textarea
            :key="current.key"
            :value="responseFor(current.key)"
            class="form-textarea journey-morning__textarea"
            :class="{ 'journey-morning__textarea--short': !current.long }"
            :placeholder="current.placeholder"
            :maxlength="current.long ? 800 : 200"
            @input="onAnswerInput($event)"
          />

          <div class="journey-morning__nav">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="!hasPrev"
              @click="goPrev"
            >
              <ChevronLeft :size="14" :stroke-width="iconStroke" />
              <span>上一题</span>
            </button>

            <span class="journey-morning__index">
              {{ current.index }} / {{ totalQuestions }}
            </span>

            <button
              v-if="hasNext"
              type="button"
              class="btn btn-primary btn-sm"
              @click="goNext"
            >
              <span>下一题</span>
              <ChevronRight :size="14" :stroke-width="iconStroke" />
            </button>
            <button
              v-else
              type="button"
              class="btn btn-success btn-sm"
              @click="finishJourney"
            >
              <Check :size="14" :stroke-width="iconStroke" />
              <span>开掘完成,进入晚上回顾</span>
            </button>
          </div>
        </GlassCard>

        <!-- 题目目录 -->
        <GlassCard>
          <SectionLabel :icon="ListChecks">15 题目录</SectionLabel>
          <div class="journey-morning__list">
            <button
              v-for="q in questions"
              :key="q.key"
              type="button"
              class="journey-morning__list-item"
              :class="{
                'journey-morning__list-item--active': q.key === currentKey,
                'journey-morning__list-item--done': Boolean(responseFor(q.key).trim()),
              }"
              @click="goTo(q.key)"
            >
              <span class="journey-morning__list-title">{{ q.kicker }}</span>
              <Check
                v-if="responseFor(q.key).trim()"
                :size="12"
                :stroke-width="2"
                class="journey-morning__list-check"
              />
            </button>
          </div>
        </GlassCard>

        <!-- 反 AI 锚点 -->
        <GlassCard>
          <SectionLabel :icon="ShieldAlert">来自原文的提醒</SectionLabel>
          <p class="body-text">
            「不要试图把这种沉思外包给 AI。我希望你突破你心智上的"限速器"。」
          </p>
          <p class="faint-text">
            —— 这套题的价值在「答」,不在「读」。如果某一题让你不舒服,那条路通常就是要走的方向。
          </p>
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ListChecks,
  Sparkles,
  ShieldAlert,
  Target,
} from "lucide-vue-next";
import {
  excavationQuestions,
  tokens,
  useAppStore,
  type ExcavationQuestion,
  type ExcavationStage,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const store = useAppStore();

const questions = excavationQuestions;
const totalQuestions = questions.length;

const stages: { key: ExcavationStage; label: string }[] = [
  { key: "discomfort", label: "看见心里的不舒服 (Q1-Q4)" },
  { key: "anti-vision", label: "不想回去的样子 (Q5-Q11)" },
  { key: "vision-mvp", label: "想去到的样子(最小版)(Q12-Q15)" },
];

const currentKey = ref(store.state.data.morningExcavation.currentQuestionKey || "q1");

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

function stageClass(stage: ExcavationStage) {
  return {
    "journey-morning__stage--active": current.value?.stage === stage,
  };
}

function iconForStage(stage: ExcavationStage) {
  if (stage === "discomfort") return AlertTriangle;
  if (stage === "anti-vision") return Target;
  return Sparkles;
}

const currentIndex = computed(() =>
  questions.findIndex((q) => q.key === currentKey.value),
);
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < totalQuestions - 1);

const introTitle = computed(() => {
  if (answeredCount.value === 0) return "你想去哪里、不要回到哪里。";
  if (answeredCount.value < 11) return "继续往下挖。看清楚了,方向才会出来。";
  if (answeredCount.value < 15) return "把想成为的样子写下来,先不管现不现实。";
  return "已经全部答完。该进入晚上回顾了。";
});

const title = computed(() => "今天就跑一遍流程");
const description = computed(
  () =>
    "回答全部 15 题。对应原文 Part 1。所有答案自动保存,中途离开也能从上次的位置继续。",
);

watch(currentKey, (key) => {
  store.setExcavationCurrent(key);
});

function onAnswerInput(e: Event) {
  if (!current.value) return;
  store.updateExcavationResponse(
    current.value.key,
    (e.target as HTMLTextAreaElement).value,
  );
}

function goPrev() {
  if (!hasPrev.value) return;
  currentKey.value = questions[currentIndex.value - 1].key;
}

function goNext() {
  if (!hasNext.value) return;
  currentKey.value = questions[currentIndex.value + 1].key;
}

function goTo(key: string) {
  currentKey.value = key;
}

function finishJourney() {
  // 直接跳到当天的「晚上回顾」
  router.push("/journey/night");
}
</script>

<style lang="scss" scoped>
.journey-morning {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.journey-morning__progress {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  font-weight: var(--si-weight-medium);
}

.journey-morning__frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
}

.journey-morning__intro-title {
  margin: 0;
  font-size: var(--si-font-xl);
  font-weight: 600;
  color: var(--si-color-text-main);
  line-height: 1.35;
}

.journey-morning__stages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
}

.journey-morning__stage {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
}

.journey-morning__stage--active {
  color: var(--si-color-brand-text);
}

.journey-morning__stage-name {
  flex: 1;
}

.journey-morning__question {
  margin: 0;
  font-size: var(--si-font-lg);
  line-height: 1.55;
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-medium);
  white-space: pre-line;
}

.journey-morning__textarea {
  min-height: 200px;
  font-size: var(--si-font-md);
  line-height: 1.7;
}

.journey-morning__textarea--short {
  min-height: 80px;
}

.journey-morning__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.journey-morning__index {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
}

.journey-morning__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.journey-morning__list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-md);
  background: transparent;
  color: var(--si-color-text-faint);
  text-align: left;
  transition: background 120ms ease, border-color 120ms ease;
}

.journey-morning__list-item:hover {
  background: var(--si-color-surface-card-soft);
  color: var(--si-color-text-soft);
}

.journey-morning__list-item--active {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);
}

.journey-morning__list-item--done {
  color: var(--si-color-text-soft);
}

.journey-morning__list-title {
  font-size: var(--si-font-sm);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.journey-morning__list-check {
  color: var(--si-color-brand);
  flex-shrink: 0;
}
</style>
