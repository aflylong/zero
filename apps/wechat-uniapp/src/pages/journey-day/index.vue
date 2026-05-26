<template>
  <PageShell
    title="白天打断"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="goBack"
  >
    <view class="journey-day">
      <GradientHeroCard card-class="journey-day__hero">
        <SectionLabel>第 2 部分 · 白天打断</SectionLabel>
        <text class="journey-day__title">把你从惯性里拽出来。</text>
        <text class="body-text">
          原文要求把这 9 个问题安排成手机里的提醒,一到点就停下来作答。这一页让你直接当场写。
        </text>
        <text class="muted-text">
          已答 {{ answeredCount }} / {{ allPrompts.length }} 题。
        </text>
      </GradientHeroCard>

      <GlassCard card-class="journey-day__group">
        <SectionLabel>6 个时间点</SectionLabel>
        <view
          v-for="prompt in timedPrompts"
          :key="prompt.key"
          class="journey-day__card"
          :class="{ 'journey-day__card--done': hasAnswer(prompt.key) }"
        >
          <view class="journey-day__head">
            <text class="journey-day__time">{{ formatTime(prompt.hour ?? 0, prompt.minute ?? 0) }}</text>
            <text class="journey-day__label">{{ prompt.label }}</text>
          </view>
          <text class="journey-day__question">{{ prompt.question }}</text>
          <text class="muted-text journey-day__helper">{{ prompt.helper }}</text>
          <textarea
            class="textarea-shell journey-day__textarea"
            :value="answerFor(prompt.key)"
            maxlength="400"
            auto-height
            placeholder="一句话也行。先把当下的真实状态记下来。"
            @blur="onAnswer(prompt.key, $event)"
          />
        </view>
      </GlassCard>

      <GlassCard card-class="journey-day__group">
        <SectionLabel>3 个通勤反思</SectionLabel>
        <text class="muted-text">
          通勤、散步、躺着发呆时想这三条。这些题和早晨开掘 Q10 写下的旧身份强相关。
        </text>
        <view
          v-for="prompt in commutePrompts"
          :key="prompt.key"
          class="journey-day__card"
          :class="{ 'journey-day__card--done': hasAnswer(prompt.key) }"
        >
          <view class="journey-day__head journey-day__head--commute">
            <text class="journey-day__label">{{ prompt.label }}</text>
          </view>
          <text class="journey-day__question">{{ prompt.question }}</text>
          <text class="muted-text journey-day__helper">{{ prompt.helper }}</text>
          <textarea
            class="textarea-shell journey-day__textarea"
            :value="answerFor(prompt.key)"
            maxlength="400"
            auto-height
            placeholder="三句话以内,把现场画面写下来就够。"
            @blur="onAnswer(prompt.key, $event)"
          />
        </view>
      </GlassCard>
    </view>

    <template #footer>
      <view class="journey-day__footer">
        <button class="ghost-button journey-day__footer-btn" @tap="goReminders">
          调整提醒推送时间
        </button>
        <button class="pill-button journey-day__footer-btn" @tap="goNight">
          进入晚上回顾
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { dayPrompts } from "@/static/content/dayPrompts";
import { formatTimeLabel } from "@/services/date";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();
const allPrompts = dayPrompts;
const timedPrompts = dayPrompts.filter((p) => p.kind === "day");
const commutePrompts = dayPrompts.filter((p) => p.kind === "commute");

const responses = computed(
  () => store.today.value.snapshot.dayPromptResponses ?? [],
);

function answerFor(key: string): string {
  return responses.value.find((r) => r.promptKey === key)?.answer ?? "";
}
function hasAnswer(key: string): boolean {
  return Boolean(answerFor(key).trim());
}

const answeredCount = computed(
  () => allPrompts.filter((p) => hasAnswer(p.key)).length,
);

function formatTime(h: number, m: number): string {
  return formatTimeLabel(h, m);
}

function onAnswer(key: string, e: UniValueEvent) {
  const value = String(e.detail?.value ?? "");
  if (value === answerFor(key)) return;
  store.answerDayPrompt(key, value);
}

function goNight() {
  uni.navigateTo({ url: "/pages/journey-night/index" });
}
function goReminders() {
  uni.navigateTo({ url: "/pages/reminder-settings/index" });
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
});
</script>

<style scoped lang="scss">
.journey-day,
.journey-day__hero,
.journey-day__group {
  display: flex;
  flex-direction: column;
}
.journey-day { gap: 24rpx; }
.journey-day__hero,
.journey-day__group { gap: 18rpx; }

.journey-day__title {
  color: #f5f5f5;
  font-size: 38rpx;
  line-height: 1.34;
  font-weight: 600;
}

.journey-day__card {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 22rpx 24rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 22rpx;
  background: rgba(24, 24, 27, 0.36);
}
.journey-day__card--done {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.18);
}

.journey-day__head {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}
.journey-day__head--commute {
  justify-content: flex-start;
}

.journey-day__time {
  color: #d1fae5;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 1px;
  min-width: 96rpx;
}
.journey-day__label {
  color: #d4d4d8;
  font-size: 24rpx;
}

.journey-day__question {
  color: #f4f4f5;
  font-size: 28rpx;
  line-height: 1.55;
}

.journey-day__helper {
  font-size: 22rpx;
}

.journey-day__textarea {
  min-height: 140rpx;
}

.journey-day__footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}
.journey-day__footer-btn {
  justify-content: center;
}
</style>
