<template>
  <PageShell tab-key="today" title="今日">
    <view class="today-page">
      <GlassCard v-if="!onboardingCompleted" card-class="today-banner">
        <SectionLabel>还差一步</SectionLabel>
        <text class="today-banner__title">先把系统初始化好，今日页才会完整运转。</text>
        <text class="muted-text">愿景、身份、证明法则和提醒时间都会直接影响今天的执行面。</text>
        <button class="ghost-button today-banner__button" @tap="openOnboarding">继续初始化</button>
      </GlassCard>

      <view class="today-identity">
        <SectionLabel>你是谁</SectionLabel>
        <text class="hero-title today-identity__title">{{ identityProfile.statement }}</text>
        <text class="body-text today-identity__body">{{ identityProfile.antiIdentityText }}</text>
      </view>

      <GradientHeroCard card-class="today-quest">
        <SectionLabel>今日主线</SectionLabel>
        <text class="page-title today-quest__title">{{ todayPlan.mainQuestTitle }}</text>
        <text class="body-text">{{ todayPlan.mainQuestDescription }}</text>
      </GradientHeroCard>

      <GlassCard card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>身份证明</SectionLabel>
            <text class="today-section__title">{{ proofProgressLabel }}</text>
          </view>
          <text class="today-section__meta">{{ completedProofRuleIds.length }}/{{ proofRules.length }}</text>
        </view>

        <view class="today-proof-list">
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
      </GlassCard>

      <GlassCard card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>今日进度</SectionLabel>
            <text class="today-section__title">{{ alignmentHeadline }}</text>
          </view>
          <text class="today-section__meta">{{ alignmentScore }}%</text>
        </view>

        <view class="progress-track">
          <view class="progress-bar" :style="{ width: `${alignmentScore}%` }" />
        </view>
        <text class="muted-text">{{ alignmentHint }}</text>
      </GlassCard>

      <GlassCard card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>今日观察</SectionLabel>
            <text class="today-section__title">用一句话记录今天的真实状态</text>
          </view>
        </view>

        <text class="today-note__preview">{{ notePreview }}</text>
        <view class="today-links">
          <button class="ghost-button" @tap="openTodayNote">打开观察页</button>
        </view>
      </GlassCard>

      <ReminderPrompt
        v-if="primaryPrompt"
        :prompt="primaryPrompt"
        @action="handleReminderAction"
      />

      <GlassCard v-else card-class="today-section">
        <view class="today-section__head">
          <view class="today-section__copy">
            <SectionLabel>提醒</SectionLabel>
            <text class="today-section__title">{{ reminderStatusTitle }}</text>
          </view>
        </view>

        <text class="muted-text">{{ reminderStatusText }}</text>
        <view class="today-links">
          <button class="ghost-button" @tap="openReminderSettings">提醒设置</button>
        </view>
      </GlassCard>

      <GlassCard card-class="today-section today-review">
        <SectionLabel>夜间复盘</SectionLabel>
        <text class="today-section__title">晚上把今天整合成明天的燃料。</text>
        <text class="muted-text">评分、赢点、偏离点和明日修正都在独立复盘页完成。</text>
        <view class="today-links">
          <button class="pill-button today-review__button" @tap="openNightReview">进入夜间复盘</button>
          <button class="ghost-button" @tap="openReminderSettings">提醒设置</button>
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
const onboardingCompleted = computed(() => store.state.data.onboardingCompleted);
const todayPlan = computed(() => store.today.value.plan);
const todaySnapshot = computed(() => store.today.value.snapshot);
const proofRules = computed(() => store.activeProofRules());
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const completedProofRuleIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const alignmentScore = computed(() => todaySnapshot.value.alignmentScore);
const primaryPrompt = computed(() => pendingPrompts.value[0] ?? null);
const extraPromptCount = computed(() => Math.max(0, pendingPrompts.value.length - 1));

const proofProgressLabel = computed(() => {
  if (!proofRules.value.length) {
    return "先建立今天要证明的动作";
  }

  if (completedProofRuleIds.value.length === proofRules.value.length) {
    return "今天的核心证明已经全部完成";
  }

  return "先把今天最关键的动作做出来";
});

const alignmentHeadline = computed(() => {
  if (alignmentScore.value >= 80) {
    return "节奏很稳，继续保持。";
  }

  if (alignmentScore.value >= 60) {
    return "整体在线，再压实一点。";
  }

  return "今天还需要一次明显的纠偏。";
});

const alignmentHint = computed(() => {
  if (!proofRules.value.length) {
    return "去身份页补上证明法则后，这里的分数会更有意义。";
  }

  return `${completedProofRuleIds.value.length}/${proofRules.value.length} 条证明已完成，提醒处理和今日观察也会影响分数。`;
});

const notePreview = computed(() => {
  const note = todaySnapshot.value.todayNote.trim();
  return note || "还没有写今日观察。用一句话把今天最真实的状态留下来。";
});

const reminderStatusTitle = computed(() => {
  if (extraPromptCount.value > 0) {
    return `还有 ${extraPromptCount.value} 条提醒待处理`;
  }

  return "当前没有待处理提醒";
});

const reminderStatusText = computed(() => {
  if (primaryPrompt.value) {
    return `先处理「${primaryPrompt.value.label}」，剩余提醒会继续排队。`;
  }

  return "白天提醒和夜间复盘时间都可以在提醒设置页调整。";
});

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  store.resolveReminder(ruleId, action);

  if (action === "complete" && prompt?.kind === "night") {
    openNightReview();
  }
}

function openOnboarding() {
  uni.navigateTo({ url: "/pages/onboarding/index" });
}

function openNightReview() {
  uni.navigateTo({ url: "/pages/night-review/index" });
}

function openReminderSettings() {
  uni.navigateTo({ url: "/pages/reminder-settings/index" });
}

function openTodayNote() {
  uni.navigateTo({ url: "/pages/today-note/index" });
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
  gap: 36rpx;
}

.today-banner,
.today-section,
.today-review {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-banner {
  border-color: rgba(52, 211, 153, 0.18);
  background: rgba(6, 95, 70, 0.12);
}

.today-banner__title,
.today-section__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.38;
}

.today-banner__button {
  align-self: flex-start;
}

.today-identity {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.today-identity__title {
  max-width: 620rpx;
}

.today-identity__body {
  max-width: 620rpx;
}

.today-quest {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-quest__title {
  font-size: 42rpx;
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
  padding: 28rpx 30rpx;
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

.today-note__preview {
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.72;
}

.today-links {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.today-review__button {
  min-width: 220rpx;
}
</style>
