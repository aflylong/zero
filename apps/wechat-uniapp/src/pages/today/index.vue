<template>
  <PageShell tab-key="today">
    <view class="section-stack today-page">
      <GradientHeroCard card-class="today-hero">
        <SectionLabel>今日身份</SectionLabel>
        <text class="hero-title today-hero__title">{{ identityProfile.statement }}</text>
        <text class="body-text today-hero__body">
          {{ todayPlan.reminderHeadline }} 先做能证明这句话的动作，再决定今天值不值得满意。
        </text>
        <view class="today-hero__chips">
          <view class="tag-chip tag-chip--active">
            <text>{{ activeDateKey }}</text>
          </view>
          <view class="tag-chip">
            <text>对齐度 {{ alignmentScore }}%</text>
          </view>
          <view class="tag-chip">
            <text>证明 {{ completedProofCount }}/{{ proofRules.length }}</text>
          </view>
        </view>
      </GradientHeroCard>

      <GlassCard card-class="today-card">
        <view class="today-card__header">
          <view>
            <SectionLabel>反身份</SectionLabel>
            <text class="today-card__title">记住你拒绝回去的样子</text>
          </view>
          <button class="ghost-button" @tap="showAntiIdentity = !showAntiIdentity">
            {{ showAntiIdentity ? "收起" : "展开" }}
          </button>
        </view>
        <text class="muted-text">
          {{ showAntiIdentity ? identityProfile.antiIdentityText : antiIdentityPreview }}
        </text>
      </GlassCard>

      <view v-if="pendingPrompts.length" class="section-stack">
        <view class="today-section-head">
          <SectionLabel>提醒卡</SectionLabel>
          <text class="today-section-head__meta">{{ pendingPrompts.length }} 条待处理</text>
        </view>
        <ReminderPrompt
          v-for="prompt in pendingPrompts"
          :key="prompt.ruleId"
          :prompt="prompt"
          @action="handleReminderAction"
        />
      </view>

      <GlassCard v-else card-class="today-card today-card--calm">
        <SectionLabel>提醒卡</SectionLabel>
        <text class="today-card__title">当前没有待处理提醒</text>
        <text class="muted-text">继续按主线推进，下一次站内提醒到点后会自动出现。</text>
      </GlassCard>

      <GlassCard card-class="today-card">
        <view class="today-card__header">
          <view>
            <SectionLabel>对齐度</SectionLabel>
            <text class="today-card__title">{{ alignmentHeadline }}</text>
          </view>
          <button class="ghost-button" @tap="openNightReview">夜间复盘</button>
        </view>
        <view class="progress-track today-progress">
          <view class="progress-bar" :style="{ width: `${alignmentScore}%` }" />
        </view>
        <view class="today-card__metrics">
          <view class="today-metric">
            <text class="today-metric__value">{{ alignmentScore }}%</text>
            <text class="today-metric__label">当前对齐</text>
          </view>
          <view class="today-metric">
            <text class="today-metric__value">{{ completedProofCount }}</text>
            <text class="today-metric__label">已完成证明</text>
          </view>
          <view class="today-metric">
            <text class="today-metric__value">{{ pendingPrompts.length }}</text>
            <text class="today-metric__label">待回应提醒</text>
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="today-card">
        <SectionLabel>主线任务</SectionLabel>
        <text class="today-card__title">{{ todayPlan.mainQuestTitle }}</text>
        <text class="body-text">{{ todayPlan.mainQuestDescription }}</text>
        <view class="today-task">
          <view class="today-task__line" />
          <view class="today-task__copy">
            <text class="today-task__focus">今日聚焦</text>
            <text class="today-task__text">{{ todayPlan.focusTheme }}</text>
          </view>
        </view>
      </GlassCard>

      <view class="section-stack">
        <view class="today-section-head">
          <SectionLabel>每日证明</SectionLabel>
          <text class="today-section-head__meta">{{ proofCompletionRate }}% 完成</text>
        </view>
        <button
          v-for="rule in proofRules"
          :key="rule.id"
          class="today-proof"
          :class="{ 'today-proof--done': completedProofRuleIds.includes(rule.id) }"
          @tap="store.toggleProofCompletion(rule.id)"
        >
          <view class="today-proof__check">
            <view
              class="today-proof__dot"
              :class="{ 'today-proof__dot--done': completedProofRuleIds.includes(rule.id) }"
            />
          </view>
          <view class="today-proof__copy">
            <text class="today-proof__title">{{ rule.title }}</text>
            <text class="today-proof__description">{{ rule.description }}</text>
          </view>
        </button>
      </view>

      <GlassCard card-class="today-card">
        <view class="today-card__header">
          <view>
            <SectionLabel>今日观察</SectionLabel>
            <text class="today-card__title">记录真实发生了什么</text>
          </view>
          <text class="today-card__status" :class="{ 'today-card__status--dirty': noteDirty }">
            {{ noteDirty ? "待保存" : "已同步" }}
          </text>
        </view>
        <textarea
          class="textarea-shell today-note"
          :value="noteDraft"
          maxlength="300"
          placeholder="写下你今天最明显的拉扯、分心、推进或意外收获。"
          @input="handleNoteInput"
        />
        <view class="today-note__footer">
          <text class="muted-text">这些观察会直接影响你晚上的复盘质量。</text>
          <button class="pill-button" @tap="saveNote">保存观察</button>
        </view>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import ReminderPrompt from "@/components/ReminderPrompt.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { formatWeekday } from "@/services/date";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderAction } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

const store = useAppStore();

const showAntiIdentity = ref(false);
const noteDraft = ref("");
const noteDirty = ref(false);

const identityProfile = computed(() => store.state.data.identityProfile);
const activeDateKey = computed(
  () => `${store.state.activeDateKey} · 星期${formatWeekday(store.state.activeDateKey)}`,
);
const todayPlan = computed(() => store.today.value.plan);
const todaySnapshot = computed(() => store.today.value.snapshot);
const proofRules = computed(() => store.activeProofRules());
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const completedProofRuleIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const completedProofCount = computed(() => completedProofRuleIds.value.length);
const alignmentScore = computed(() => todaySnapshot.value.alignmentScore);
const proofCompletionRate = computed(() => {
  if (!proofRules.value.length) {
    return 100;
  }

  return Math.round((completedProofCount.value / proofRules.value.length) * 100);
});
const antiIdentityPreview = computed(() => {
  const text = identityProfile.value.antiIdentityText.trim();
  if (text.length <= 38) {
    return text;
  }
  return `${text.slice(0, 38)}...`;
});
const alignmentHeadline = computed(() => {
  const score = alignmentScore.value;
  if (score >= 85) {
    return "今天的行动正在替你说话";
  }
  if (score >= 60) {
    return "方向是对的，现在把动作补满";
  }
  if (score >= 35) {
    return "还有明显偏航，及时拉回主线";
  }
  return "今天仍然处在惯性里，先做最小修正";
});

watch(
  () => todaySnapshot.value.todayNote,
  (value) => {
    if (!noteDirty.value) {
      noteDraft.value = value;
    }
  },
  { immediate: true },
);

function handleNoteInput(event: UniValueEvent) {
  noteDraft.value = String(event.detail?.value ?? "");
  noteDirty.value = noteDraft.value !== todaySnapshot.value.todayNote;
}

function saveNote(showToast = true) {
  if (!noteDirty.value) {
    return;
  }

  store.updateTodayNote(noteDraft.value);
  noteDirty.value = false;

  if (showToast) {
    uni.showToast({
      title: "观察已保存",
      icon: "success",
    });
  }
}

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  store.resolveReminder(ruleId, action);

  if (action === "complete" && prompt?.kind === "night") {
    uni.navigateTo({ url: "/pages/night-review/index" });
  }
}

function openNightReview() {
  saveNote(false);
  uni.navigateTo({ url: "/pages/night-review/index" });
}

onShow(() => {
  if (!store.state.data.onboardingCompleted) {
    uni.reLaunch({ url: "/pages/onboarding/index" });
    return;
  }

  store.refreshReminderPrompts();
});

onHide(() => {
  saveNote(false);
});
</script>

<style scoped lang="scss">
.today-page {
  gap: 26rpx;
}

.today-hero {
  gap: 24rpx;
}

.today-hero__title {
  display: block;
}

.today-hero__body {
  display: block;
  max-width: 620rpx;
}

.today-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.today-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.today-card--calm {
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.82), rgba(6, 95, 70, 0.14));
}

.today-card__header,
.today-section-head,
.today-note__footer {
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
}

.today-card__title {
  display: block;
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.35;
}

.today-card__status {
  color: #34d399;
  font-size: 22rpx;
}

.today-card__status--dirty {
  color: #fb923c;
}

.today-section-head__meta {
  color: #71717a;
  font-size: 22rpx;
}

.today-progress {
  height: 16rpx;
}

.today-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
}

.today-metric {
  padding: 22rpx 18rpx;
  border: 1px solid rgba(16, 185, 129, 0.16);
  border-radius: 24rpx;
  background: rgba(6, 78, 59, 0.14);
}

.today-metric__value {
  display: block;
  margin-bottom: 8rpx;
  color: #ecfdf5;
  font-size: 34rpx;
  line-height: 1.1;
}

.today-metric__label {
  color: #71717a;
  font-size: 22rpx;
}

.today-task {
  display: flex;
  gap: 18rpx;
  align-items: stretch;
  padding: 24rpx 4rpx 0;
}

.today-task__line {
  width: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, rgba(52, 211, 153, 0.92), rgba(16, 185, 129, 0.12));
}

.today-task__copy {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.today-task__focus {
  color: #71717a;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.today-task__text {
  color: #d1fae5;
  font-size: 28rpx;
  line-height: 1.5;
}

.today-proof {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  width: 100%;
  padding: 28rpx 30rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 28rpx;
  background: rgba(24, 24, 27, 0.78);
  text-align: left;
}

.today-proof--done {
  border-color: rgba(16, 185, 129, 0.28);
  background: linear-gradient(145deg, rgba(6, 95, 70, 0.32), rgba(17, 24, 39, 0.74));
}

.today-proof__check {
  padding-top: 6rpx;
}

.today-proof__dot {
  width: 34rpx;
  height: 34rpx;
  border: 1px solid rgba(113, 113, 122, 0.8);
  border-radius: 999rpx;
  background: rgba(39, 39, 42, 0.6);
}

.today-proof__dot--done {
  border-color: rgba(16, 185, 129, 0.18);
  background: #34d399;
  box-shadow: 0 0 0 10rpx rgba(52, 211, 153, 0.1);
}

.today-proof__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.today-proof__title {
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.38;
}

.today-proof__description {
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.6;
}

.today-note {
  min-height: 220rpx;
}

@media (max-width: 720rpx) {
  .today-card__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
