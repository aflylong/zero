<template>
  <PageShell tab-key="today" title="今日">
    <view class="today-page">
      <view v-if="!journeyStarted" class="today-welcome">
        <SectionLabel>还没跑过一天流程</SectionLabel>
        <text class="today-welcome__title">建议先花 20 分钟读原文,再留出整整一天答完 22 题。</text>
        <text class="today-welcome__body">
          这套系统的灵魂是「严格按一天流程跑一遍」——11 道早晨开掘、9 道白天打断、5 步夜晚综合。
          不跑这一遍,后面再多打卡也只是在表面。
        </text>
        <view class="action-row">
          <button class="pill-button" @tap="openArticleReader">先读原文</button>
          <button class="ghost-button" @tap="openJourneyMorning">开始一天流程</button>
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
        <SectionLabel>今日主线</SectionLabel>
        <text class="page-title today-quest__title">
          {{ todayPlan.yearGoalTitle || "先把这一年要走到哪定下来" }}
        </text>
        <text class="body-text">{{ todayPlan.yearGoalDescription || todayPlan.reminderHeadline }}</text>
        <view class="today-primary-actions">
          <button class="pill-button" @tap="openJourneyMorning">一天流程</button>
          <button class="ghost-button" @tap="openTodayNote">写观察</button>
          <button class="ghost-button" @tap="openSynthesis">夜间综合</button>
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
            <SectionLabel>每日杠杆</SectionLabel>
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
          还没有生效的每日杠杆。完成一次「夜间综合」后,L3 的明日时间块会自动升格。
        </text>
      </GlassCard>

      <GlassCard card-class="today-section today-progress">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>今日推进度</SectionLabel>
            <text class="today-section__title">{{ alignmentHeadline }}</text>
          </view>
          <text class="today-section__meta">{{ alignmentScore }}%</text>
        </view>

        <view class="progress-track">
          <view class="progress-bar" :style="{ width: `${alignmentScore}%` }" />
        </view>
        <text class="muted-text">{{ alignmentHint }}</text>
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
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import ReminderPrompt from "@/components/ReminderPrompt.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderAction } from "@/types/app";

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
const alignmentScore = computed(() => todaySnapshot.value.alignmentScore);
const primaryPrompt = computed(() => pendingPrompts.value[0] ?? null);
const extraPromptCount = computed(() => Math.max(0, pendingPrompts.value.length - 1));

const proofProgressLabel = computed(() => {
  if (!proofRules.value.length) return "先把今天的 2-3 个时间块定下来";
  if (completedProofRuleIds.value.length === proofRules.value.length)
    return "今天的杠杆全部到手";
  return "把今天最关键的那个动作先做掉";
});

const alignmentHeadline = computed(() => {
  if (alignmentScore.value >= 70) return "节奏稳得住,继续这样跑。";
  if (alignmentScore.value >= 40) return "在线,但还能压实一点。";
  if (alignmentScore.value > 0) return "今天有些松动,做一个杠杆就开始拉回来。";
  return "今天还没留下证据。先做最小的一个真实动作。";
});

const alignmentHint = computed(() => {
  if (!proofRules.value.length)
    return "去身份页或夜间综合 L3 添加杠杆,这里的分数才有意义。";
  return `${completedProofRuleIds.value.length}/${proofRules.value.length} 条杠杆已完成,提醒处理与观察记录也会算进分数。`;
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
</style>
