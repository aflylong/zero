<template>
  <PageShell
    title="提醒设置"
    topbar-mode="secondary"
    back-url="/pages/today/index"
  >
    <view class="reminder-page">
      <view class="reminder-hero">
        <SectionLabel>提醒模型</SectionLabel>
        <text class="reminder-hero__title">决定系统在什么时候把你拉回正轨。</text>
        <text class="muted-text">
          第一版先使用站内提醒。后续如果接微信订阅消息，这里的 `deliveryMode` 和授权状态会直接接上。
        </text>
      </view>

      <view class="reminder-list">
        <GlassCard
          v-for="rule in reminderRules"
          :key="rule.id"
          card-class="reminder-card"
        >
          <view class="reminder-card__head">
            <view class="reminder-card__copy">
              <SectionLabel>{{ rule.kind === "night" ? "夜间复盘" : "白天提醒" }}</SectionLabel>
              <text class="reminder-card__title">{{ rule.label }}</text>
            </view>
            <button
              class="reminder-card__toggle"
              :class="{ 'reminder-card__toggle--active': rule.enabled }"
              @tap="toggleEnabled(rule.id, rule.enabled)"
            >
              {{ rule.enabled ? "已开启" : "已关闭" }}
            </button>
          </view>

          <view class="reminder-card__meta">
            <picker
              mode="time"
              :value="formatReminder(rule.hour, rule.minute)"
              @change="handleReminderTimeChange(rule.id, $event)"
            >
              <view class="reminder-card__time">
                {{ formatReminder(rule.hour, rule.minute) }}
              </view>
            </picker>

            <view class="reminder-card__status">
              <text class="reminder-card__message">{{ rule.message }}</text>
              <text class="reminder-card__status-text">发送方式：{{ rule.deliveryMode }}</text>
              <text class="reminder-card__status-text">授权状态：{{ rule.subscriptionStatus }}</text>
            </view>
          </view>
        </GlassCard>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { ensureOnboardingReady } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();
const reminderRules = computed(() => store.state.data.reminderRules);

function formatReminder(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toggleEnabled(ruleId: string, enabled: boolean) {
  store.updateReminderRule(ruleId, {
    enabled: !enabled,
  });
}

function handleReminderTimeChange(ruleId: string, event: UniValueEvent) {
  const value = event.detail?.value ?? "";
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return;
  }

  store.updateReminderRule(ruleId, {
    hour,
    minute,
  });
}

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }

  store.refreshReminderPrompts();
});
</script>

<style scoped lang="scss">
.reminder-page,
.reminder-hero,
.reminder-list,
.reminder-card,
.reminder-card__copy,
.reminder-card__status {
  display: flex;
  flex-direction: column;
}

.reminder-page,
.reminder-list {
  gap: 24rpx;
}

.reminder-hero,
.reminder-card {
  gap: 18rpx;
}

.reminder-hero__title,
.reminder-card__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
}

.reminder-card__head,
.reminder-card__meta {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.reminder-card__copy {
  flex: 1;
}

.reminder-card__toggle,
.reminder-card__time {
  justify-content: center;
}

.reminder-card__status {
  flex: 1;
  gap: 8rpx;
  align-items: flex-start;
}

.reminder-card__status-text {
  color: #71717a;
  font-size: 20rpx;
  line-height: 1.5;
}

.reminder-card__toggle {
  min-width: 116rpx;
  padding: 16rpx 24rpx;
  border: 1px solid rgba(63, 63, 70, 0.64);
  border-radius: 999rpx;
  color: #a1a1aa;
  font-size: 22rpx;
}

.reminder-card__toggle--active {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.2);
  color: #d1fae5;
}

.reminder-card__time {
  min-width: 160rpx;
  padding: 26rpx 28rpx;
  border-radius: 24rpx;
  background: rgba(6, 95, 70, 0.24);
  color: #d1fae5;
  font-size: 36rpx;
  line-height: 1.1;
  text-align: center;
}

.reminder-card__message {
  color: #d4d4d8;
  font-size: 25rpx;
  line-height: 1.62;
}
</style>
