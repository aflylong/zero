<template>
  <PageShell tab-key="today" title="今日">
    <view class="today-page">
      <view v-if="!journeyStarted && !hideJourneyHint" class="today-welcome">
        <SectionLabel>这套系统还有更深的一层</SectionLabel>
        <text class="today-welcome__title">等你哪天有一整段安静的时间,可以试试 22 题。</text>
        <text class="today-welcome__body">
          它不是任务,是一次和自己的认真对话——什么时候做都来得及。
        </text>
        <view class="action-row">
          <button class="pill-button" @tap="openArticleReader">先读原文</button>
          <button class="ghost-button" @tap="openJourneyMorning">现在就开始</button>
          <button class="ghost-button" @tap="dismissJourneyHint">等我准备好了</button>
        </view>
      </view>

      <view class="today-identity">
        <SectionLabel>你是谁</SectionLabel>
        <text class="hero-title today-identity__title">
          {{ identityProfile.statement || "先决定你是谁" }}
        </text>
        <text class="today-identity__body">
          不再回去:{{ identityProfile.antiIdentityText || "把那个你不愿再扮演的旧版本说清楚。" }}
        </text>
      </view>

      <GradientHeroCard card-class="today-quest">
        <SectionLabel>一年方向</SectionLabel>
        <text class="page-title today-quest__title">
          {{ todayPlan.yearGoalTitle || "先把这一年要走到哪定下来" }}
        </text>
        <text class="body-text">{{ todayPlan.yearGoalDescription || todayPlan.reminderHeadline }}</text>
        <view class="today-primary-actions">
          <button class="pill-button" @tap="openJourneyMorning">一天流程</button>
          <button class="ghost-button" @tap="openTodayNote">写观察</button>
          <button class="ghost-button" @tap="openSynthesis">晚上回顾</button>
        </view>
        <button class="today-note-line" @tap="openTodayNote">
          <text class="today-note-line__label">今日观察</text>
          <text class="today-note-line__text">{{ notePreview }}</text>
        </button>
      </GradientHeroCard>

      <ReminderPrompt
        v-if="primaryPrompt"
        :prompt="primaryPrompt"
        @action="handleReminderAction"
      />

      <GlassCard card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>每日动作</SectionLabel>
            <text class="today-section__title">{{ proofProgressLabel }}</text>
          </view>
          <text class="today-section__meta">{{ completedProofRuleIds.length }}/{{ proofRules.length }}</text>
        </view>

        <view v-if="proofRules.length" class="today-proof-list">
          <button
            v-for="rule in proofRules"
            :key="rule.id"
            class="today-proof"
            :class="{ 'today-proof--done': completedProofRuleIds.includes(rule.id) }"
            @tap="store.toggleProofCompletion(rule.id)"
          >
            <view class="today-proof__mark">
              <text v-if="completedProofRuleIds.includes(rule.id)">✓</text>
            </view>
            <view class="today-proof__copy">
              <text class="today-proof__title">{{ rule.title }}</text>
              <text v-if="rule.description.trim()" class="today-proof__description">{{ rule.description }}</text>
            </view>
          </button>
        </view>
        <text v-else class="muted-text">
          还没有每日动作。完成一次「晚上回顾」后,L3 的几个时间段会自动加进明天的动作。
        </text>
      </GlassCard>

      <GlassCard card-class="today-section today-progress">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>今天的样子</SectionLabel>
            <text class="today-section__title">{{ todayStatusText }}</text>
          </view>
        </view>

        <view class="today-status__row">
          <view
            v-for="i in 5"
            :key="i"
            class="today-status__dot"
            :class="{ 'today-status__dot--filled': i <= statusFilled }"
          />
        </view>
      </GlassCard>

      <GlassCard card-class="today-section">
        <SectionLabel>这一周</SectionLabel>
        <view class="today-week">
          <view
            v-for="(day, idx) in weekDays"
            :key="day.dateKey"
            class="today-week__cell"
            :class="weekCellClass(day)"
          >
            <text class="today-week__weekday">{{ weekdayShort(idx) }}</text>
          </view>
        </view>
        <text class="muted-text">{{ weekCopy }}</text>
      </GlassCard>

      <GlassCard v-if="!primaryPrompt" card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>提醒</SectionLabel>
            <text class="today-section__title">{{ reminderStatusTitle }}</text>
          </view>
        </view>

        <text class="muted-text">{{ reminderStatusText }}</text>
        <view class="today-links">
          <button class="ghost-button" @tap="openReminderSettings">提醒设置</button>
          <button class="ghost-button" @tap="openJourneyDay">白天 9 题</button>
        </view>
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
import ReminderPrompt from "@/components/ReminderPrompt.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";
import { formatDateKey, parseDateKey } from "@/services/date";
import type { ReminderAction, RecordDay } from "@/types/app";

const store = useAppStore();

const identityProfile = computed(() => store.state.data.identityProfile);
const journeyStarted = computed(
  () =>
    store.state.data.journeyCompleted ||
    store.state.data.onboardingCompleted ||
    Boolean(store.state.data.morningExcavation.startedAt),
);
const todayPlan = computed(() => store.today.value.plan);
const todaySnapshot = computed(() => store.today.value.snapshot);
const proofRules = computed(() => store.activeProofRules());
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const completedProofRuleIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const primaryPrompt = computed(() => pendingPrompts.value[0] ?? null);
const extraPromptCount = computed(() => Math.max(0, pendingPrompts.value.length - 1));

// dismiss the 22-question hint for 7 days
const HINT_DISMISS_KEY = "guiling.journeyHintDismissedUntil";
const hintDismissUntil = ref<number>(
  Number(uni.getStorageSync(HINT_DISMISS_KEY)) || 0,
);
const hideJourneyHint = computed(() => Date.now() < hintDismissUntil.value);
function dismissJourneyHint() {
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
  hintDismissUntil.value = until;
  uni.setStorageSync(HINT_DISMISS_KEY, until);
}

const proofProgressLabel = computed(() => {
  if (!proofRules.value.length) return "先把今天的 2-3 件小事定下来";
  if (completedProofRuleIds.value.length === proofRules.value.length)
    return "今天的动作都做完了,稳住";
  return "把今天最关键的那个动作先做掉";
});

// 今天的样子 — 五挡正向语句
const todayHasNote = computed(() => todaySnapshot.value.todayNote.trim().length > 0);
const todayHasSynthesis = computed(() => {
  const ns = store.state.data.nightSynthesisByDate?.[store.state.activeDateKey];
  return Boolean(ns && (ns.stuckReason || ns.enemyName || ns.visionMantra));
});
const statusFilled = computed(() => {
  const done = completedProofRuleIds.value.length;
  const total = proofRules.value.length;
  if (total > 0 && done === total && todayHasNote.value && todayHasSynthesis.value) return 5;
  if (done >= 3) return 4;
  if (done === 2) return 3;
  if (done === 1) return 2;
  return done > 0 ? 1 : 0;
});
const todayStatusText = computed(() => {
  const done = completedProofRuleIds.value.length;
  const total = proofRules.value.length;
  if (total > 0 && done === total && todayHasNote.value && todayHasSynthesis.value)
    return "今天从头到尾认真过完了";
  if (done >= 3) return "今天就是你想成为的样子";
  if (done === 2) return "今天有那个你想成为的人的样子了";
  if (done === 1) return "已经动起来了";
  return "今天还没开始也没关系,做一件小事就行";
});

// 这一周
const weekDays = computed<RecordDay[]>(() => {
  const today = parseDateKey(store.state.activeDateKey);
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const daysFromStore = store.getRecordDays({
    endDateKey: store.state.activeDateKey,
    spanDays: 21,
  });
  const result: RecordDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatDateKey(d);
    const found = daysFromStore.find((day) => day.dateKey === key);
    result.push(
      found ?? {
        dateKey: key,
        label: "",
        weekday: "",
        alignmentScore: null,
        completedProofCount: 0,
        note: "",
        hasNightReview: false,
      },
    );
  }
  return result;
});
function weekCellClass(day: RecordDay) {
  const isFuture = day.dateKey > store.state.activeDateKey;
  if (isFuture) return "today-week__cell--future";
  const c = day.completedProofCount;
  if (c >= 4) return "today-week__cell--bright";
  if (c >= 2) return "today-week__cell--mid";
  if (c >= 1) return "today-week__cell--soft";
  return "today-week__cell--empty";
}
function weekdayShort(idx: number): string {
  return ["一", "二", "三", "四", "五", "六", "日"][idx];
}
const weekCopy = computed(() => {
  const n = weekDays.value.filter((d) => d.completedProofCount >= 1).length;
  if (n === 0) return "新的一周,什么时候开始都行";
  if (n === 1) return "本周已经动了 1 天";
  if (n === 2) return "本周保持了 2 天有行动";
  if (n <= 4) return `本周保持了 ${n} 天有行动,稳住`;
  if (n <= 6) return `本周保持了 ${n} 天有行动,这就是节奏`;
  return "这一周每天都在动,挺好";
});

const notePreview = computed(() => {
  const note = todaySnapshot.value.todayNote.trim();
  return note || "今天还没写。一句话就行——把现在的真实状态留下来。";
});

const reminderStatusTitle = computed(() => {
  if (extraPromptCount.value > 0) return `还有 ${extraPromptCount.value} 条提醒等你处理`;
  return "现在没有要处理的提醒";
});

const reminderStatusText = computed(() => {
  if (primaryPrompt.value)
    return `先处理「${primaryPrompt.value.label}」,剩下的会排着队来。`;
  return "白天 6 + 通勤 3,可以在「提醒设置」里调整或关闭。";
});

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  store.resolveReminder(ruleId, action);
  if (action === "complete" && prompt?.promptKey) {
    if (prompt.kind === "morning") openJourneyMorning();
    else if (prompt.kind === "night") openSynthesis();
    else openJourneyDay();
  }
}

function openJourneyMorning() {
  uni.navigateTo({ url: "/pages/journey-morning/index" });
}
function openJourneyDay() {
  uni.navigateTo({ url: "/pages/journey-day/index" });
}
function openSynthesis() {
  uni.navigateTo({ url: "/pages/journey-night/index" });
}
function openReminderSettings() {
  uni.navigateTo({ url: "/pages/reminder-settings/index" });
}
function openTodayNote() {
  uni.navigateTo({ url: "/pages/today-note/index" });
}
function openArticleReader() {
  uni.navigateTo({ url: "/pages/article-reader/index" });
}

onShow(() => {
  store.initialize();
  store.refreshReminderPrompts();
});
</script>

<style scoped lang="scss">
.today-page {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.today-section {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-section__title {
  color: #f5f5f5;
  font-size: 32rpx;
  line-height: 1.38;
}

.today-identity {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.today-identity__title {
  max-width: 620rpx;
  font-size: 56rpx;
}

.today-identity__body {
  max-width: 620rpx;
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.62;
}

.today-quest {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-quest__title {
  font-size: 38rpx;
}

.today-primary-actions {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
  padding-top: 4rpx;
}

.today-note-line {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 22rpx 0 0;
  border-top: 1px solid rgba(39, 39, 42, 0.72);
  text-align: left;
}

.today-note-line__label {
  color: #34d399;
  font-size: 22rpx;
  line-height: 1.4;
}

.today-note-line__text {
  color: #d4d4d8;
  font-size: 25rpx;
  line-height: 1.56;
}

.today-section__head {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.today-section__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.today-section__meta {
  color: #a1a1aa;
  font-size: 24rpx;
  line-height: 1.4;
}

.today-proof-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.today-proof {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  padding: 24rpx 26rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.36);
  text-align: left;
}

.today-proof--done {
  border-color: rgba(16, 185, 129, 0.2);
  background: rgba(6, 95, 70, 0.18);
}

.today-proof__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-top: 4rpx;
  border: 1px solid rgba(82, 82, 91, 0.82);
  border-radius: 999rpx;
  color: #34d399;
  flex-shrink: 0;
}

.today-proof--done .today-proof__mark {
  border-color: rgba(16, 185, 129, 0.26);
  background: rgba(6, 95, 70, 0.24);
}

.today-proof__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.today-proof__title {
  color: #f4f4f5;
  font-size: 28rpx;
  line-height: 1.5;
}

.today-proof__description {
  color: #71717a;
  font-size: 22rpx;
  line-height: 1.58;
}

.today-progress {
  gap: 16rpx;
}

.today-links {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.today-welcome {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 1px solid rgba(16, 185, 129, 0.24);
  border-radius: 24rpx;
  background: rgba(6, 78, 59, 0.18);
}
.today-welcome__title { color: #f5f5f5; font-size: 36rpx; line-height: 1.4; font-weight: 600; }
.today-welcome__body { color: #d4d4d8; font-size: 26rpx; line-height: 1.6; }

.today-status__row {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.today-status__dot {
  flex: 1;
  height: 8rpx;
  border-radius: 4rpx;
  background: rgba(113, 113, 122, 0.32);
}

.today-status__dot--filled {
  background: #34d399;
}

.today-week {
  display: flex;
  gap: 8rpx;
  margin: 12rpx 0;
}

.today-week__cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  border-radius: 10rpx;
  background: rgba(63, 63, 70, 0.4);
}

.today-week__weekday {
  color: #a1a1aa;
  font-size: 22rpx;
}

.today-week__cell--empty { background: rgba(63, 63, 70, 0.4); }
.today-week__cell--soft { background: rgba(16, 185, 129, 0.28); }
.today-week__cell--mid { background: rgba(16, 185, 129, 0.55); }
.today-week__cell--bright { background: #34d399; }
.today-week__cell--bright .today-week__weekday { color: #042f2e; font-weight: 600; }
.today-week__cell--future { background: rgba(63, 63, 70, 0.18); }
.today-week__cell--future .today-week__weekday { color: rgba(113, 113, 122, 0.5); }
</style>
