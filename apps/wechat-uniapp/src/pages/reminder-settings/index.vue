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
              <text class="muted-text">{{ rule.message }}</text>
            </view>
            <button class="ghost-button reminder-card__toggle" @tap="toggleEnabled(rule.id, rule.enabled)">
              {{ rule.enabled ? "已开启" : "已关闭" }}
            </button>
          </view>

          <view class="reminder-card__meta">
            <picker
              mode="time"
              :value="formatReminder(rule.hour, rule.minute)"
              @change="handleReminderTimeChange(rule.id, $event)"
            >
              <view class="tag-chip tag-chip--active reminder-card__time">
                {{ formatReminder(rule.hour, rule.minute) }}
              </view>
            </picker>

            <view class="reminder-card__status">
              <text class="reminder-card__status-text">发送方式：{{ rule.deliveryMode }}</text>
              <text class="reminder-card__status-text">授权状态：{{ rule.subscriptionStatus }}</text>
            </view>
          </view>
        </GlassCard>
      </view>
    </view>

    <template #footer>
      <button class="pill-button reminder-footer__button" @tap="goBack">返回今日</button>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
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

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/today/index" });
}

onShow(() => {
  store.initialize();
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
.reminder-card__time,
.reminder-footer__button {
  justify-content: center;
}

.reminder-card__status {
  gap: 8rpx;
  align-items: flex-end;
}

.reminder-card__status-text {
  color: #71717a;
  font-size: 20rpx;
  line-height: 1.5;
}
</style>
