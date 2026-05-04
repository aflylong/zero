<template>
  <PageShell tab-key="today">
    <view class="today-page">
      <view class="today-page__section">
        <text class="section-label">你是</text>
        <text class="hero-title today-page__identity">{{ identityProfile.statement }}</text>
      </view>

      <view class="today-page__section">
        <view class="today-collapse" @tap="showAntiIdentity = !showAntiIdentity">
          <text class="today-collapse__label">你正在抛弃的旧自己</text>
          <text class="today-collapse__chevron" :class="{ 'today-collapse__chevron--open': showAntiIdentity }">
            ⌄
          </text>
        </view>
        <view v-if="showAntiIdentity" class="today-collapsed">
          <text class="today-collapsed__text">{{ identityProfile.antiIdentityText }}</text>
        </view>
      </view>

      <view class="today-page__section">
        <text class="today-section-title">身份证明</text>
        <view class="today-proof-list">
          <view
            v-for="rule in proofRules"
            :key="rule.id"
            class="today-proof"
            @tap="store.toggleProofCompletion(rule.id)"
          >
            <view class="today-proof__icon" :class="{ 'today-proof__icon--done': completedProofRuleIds.includes(rule.id) }">
              <text v-if="completedProofRuleIds.includes(rule.id)" class="today-proof__check">✓</text>
            </view>
            <text
              class="today-proof__text"
              :class="{ 'today-proof__text--done': completedProofRuleIds.includes(rule.id) }"
            >
              {{ rule.title }}
            </text>
          </view>
        </view>
      </view>

      <view class="today-page__section">
        <view class="today-alignment__top">
          <text class="today-alignment__label">身份一致性</text>
          <text class="today-alignment__value">{{ alignmentScore }}%</text>
        </view>
        <text class="today-alignment__hint">{{ alignmentHint }}</text>
        <view class="progress-track">
          <view class="progress-bar" :style="{ width: `${alignmentScore}%` }" />
        </view>
      </view>

      <view class="today-page__section">
        <text class="today-reflection__prompt">今天的你，像那个人吗？</text>
        <textarea
          class="textarea-shell today-reflection__input"
          :value="todaySnapshot.todayNote"
          maxlength="300"
          placeholder="对自己诚实..."
          @input="handleNoteInput"
        />
      </view>

      <view class="today-utility">
        <view class="today-utility__links">
          <button class="today-utility__link" @tap="openNightReview">夜间复盘</button>
          <button v-if="!store.state.data.onboardingCompleted" class="today-utility__link" @tap="openOnboarding">
            初始化
          </button>
        </view>

        <view v-if="pendingPrompts.length" class="today-utility__reminders">
          <view
            v-for="prompt in pendingPrompts"
            :key="prompt.ruleId"
            class="today-reminder"
          >
            <view class="today-reminder__top">
              <text class="today-reminder__type">{{ prompt.kind === "night" ? "夜间提醒" : "白天提醒" }}</text>
              <text class="today-reminder__time">{{ prompt.dueAtLabel }}</text>
            </view>
            <text class="today-reminder__title">{{ prompt.label }}</text>
            <text class="today-reminder__message">{{ prompt.message }}</text>
            <view class="today-reminder__actions">
              <button class="pill-button today-reminder__button" @tap="handleReminderAction(prompt.ruleId, 'complete')">
                完成
              </button>
              <button class="ghost-button today-reminder__button" @tap="handleReminderAction(prompt.ruleId, 'snooze')">
                稍后
              </button>
              <button class="ghost-button today-reminder__button" @tap="handleReminderAction(prompt.ruleId, 'skip')">
                跳过
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageShell from "@/components/PageShell.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderAction } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

const store = useAppStore();
const showAntiIdentity = ref(false);

const identityProfile = computed(() => store.state.data.identityProfile);
const todaySnapshot = computed(() => store.today.value.snapshot);
const proofRules = computed(() => store.activeProofRules());
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const completedProofRuleIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const alignmentScore = computed(() => todaySnapshot.value.alignmentScore);
const alignmentHint = computed(() => {
  if (proofRules.value.length) {
    return `${completedProofRuleIds.value.length}/${proofRules.value.length} 条证明已完成`;
  }

  return "先在身份页写下一条真正会执行的证明法则。";
});

function handleNoteInput(event: UniValueEvent) {
  store.updateTodayNote(String(event.detail?.value ?? ""));
}

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  store.resolveReminder(ruleId, action);

  if (action === "complete" && prompt?.kind === "night") {
    uni.navigateTo({ url: "/pages/night-review/index" });
  }
}

function openOnboarding() {
  uni.navigateTo({ url: "/pages/onboarding/index" });
}

function openNightReview() {
  uni.navigateTo({ url: "/pages/night-review/index" });
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
  gap: 52rpx;
}

.today-page__section {
  display: flex;
  flex-direction: column;
}

.today-page__identity {
  display: block;
  max-width: 580rpx;
}

.today-collapse {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 30rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.8);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.34);
}

.today-collapse__label {
  color: #71717a;
  font-size: 26rpx;
}

.today-collapse__chevron {
  color: #52525b;
  font-size: 24rpx;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.today-collapse__chevron--open {
  transform: rotate(180deg);
}

.today-collapsed {
  margin-top: 12rpx;
  padding: 30rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.66);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.26);
}

.today-collapsed__text {
  color: #a1a1aa;
  font-size: 26rpx;
  line-height: 1.72;
  font-style: italic;
}

.today-section-title {
  margin-bottom: 22rpx;
  color: #d4d4d8;
  font-size: 34rpx;
}

.today-proof-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-proof {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 34rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.68);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.34);
}

.today-proof__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38rpx;
  height: 38rpx;
  margin-top: 2rpx;
  border: 2rpx solid rgba(82, 82, 91, 0.88);
  border-radius: 999rpx;
  flex-shrink: 0;
}

.today-proof__icon--done {
  border-color: #34d399;
  background: rgba(6, 95, 70, 0.3);
}

.today-proof__check {
  color: #34d399;
  font-size: 22rpx;
  font-weight: 600;
}

.today-proof__text {
  color: #e4e4e7;
  font-size: 28rpx;
  line-height: 1.6;
}

.today-proof__text--done {
  color: #71717a;
  text-decoration: line-through;
}

.today-alignment__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.today-alignment__label {
  color: #a1a1aa;
  font-size: 26rpx;
}

.today-alignment__value {
  color: #34d399;
  font-size: 48rpx;
  line-height: 1;
  font-weight: 300;
}

.today-alignment__hint {
  margin-bottom: 18rpx;
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.6;
}

.today-reflection__prompt {
  margin-bottom: 18rpx;
  color: #d4d4d8;
  font-size: 30rpx;
  line-height: 1.6;
}

.today-reflection__input {
  min-height: 220rpx;
}

.today-utility {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding-top: 6rpx;
}

.today-utility__links {
  display: flex;
  gap: 28rpx;
  align-items: center;
}

.today-utility__link {
  color: #71717a;
  font-size: 24rpx;
}

.today-utility__reminders {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.today-reminder {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 30rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.66);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.26);
}

.today-reminder__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.today-reminder__type,
.today-reminder__time {
  color: #71717a;
  font-size: 22rpx;
}

.today-reminder__title {
  color: #f4f4f5;
  font-size: 28rpx;
  line-height: 1.5;
}

.today-reminder__message {
  color: #a1a1aa;
  font-size: 24rpx;
  line-height: 1.64;
}

.today-reminder__actions {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-top: 4rpx;
}

.today-reminder__button {
  min-width: 120rpx;
}
</style>
