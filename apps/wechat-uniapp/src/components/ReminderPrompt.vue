<template>
  <view v-if="prompt" class="glass-card prompt">
    <view class="prompt__meta">
      <text class="section-label prompt__label">{{ kindLabel }}</text>
      <text class="prompt__time">{{ prompt && prompt.dueAtLabel }}</text>
    </view>
    <text class="prompt__title">{{ prompt && prompt.label }}</text>
    <text class="body-text">{{ promptBody }}</text>
    <view class="action-row prompt__actions">
      <button class="pill-button" @tap="onAction('complete')">我现在就做</button>
      <button class="ghost-button" @tap="onAction('snooze')">30 分钟后</button>
      <button class="ghost-button" @tap="onAction('skip')">今天跳过</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ReminderAction, ReminderPrompt } from "@/types/app";

const props = defineProps<{
  prompt: ReminderPrompt | null;
}>();

const emit = defineEmits<{
  (event: "action", ruleId: string, action: ReminderAction): void;
}>();

const kindLabel = computed(() => {
  const k = props.prompt?.kind;
  if (k === "morning") return "早晨开掘";
  if (k === "night") return "晚上回顾";
  if (k === "commute") return "通勤反思";
  return "白天打断";
});

const promptBody = computed(() => {
  const p = props.prompt;
  if (!p) return "";
  return p.question || p.message;
});

function onAction(action: ReminderAction) {
  if (!props.prompt) return;
  emit("action", props.prompt.ruleId, action);
}
</script>

<style scoped lang="scss">
.prompt {
  gap: 18rpx;
}

.prompt__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt__label {
  margin-bottom: 0;
}

.prompt__time {
  color: #a1a1aa;
  font-size: 22rpx;
}

.prompt__title {
  display: block;
  margin-bottom: 12rpx;
  color: #ecfdf5;
  font-size: 36rpx;
  line-height: 1.3;
}

.prompt__actions {
  margin-top: 20rpx;
}
</style>
