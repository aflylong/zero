<template>
  <view v-if="prompt" class="glass-card prompt">
    <view class="prompt__meta">
      <text class="section-label prompt__label">{{ prompt.kind === "night" ? "夜间复盘" : "白天提醒" }}</text>
      <text class="prompt__time">{{ prompt.dueAtLabel }}</text>
    </view>
    <text class="prompt__title">{{ prompt.label }}</text>
    <text class="body-text">{{ prompt.message }}</text>
    <view class="action-row prompt__actions">
      <button class="pill-button" @tap="$emit('action', prompt.ruleId, 'complete')">我现在去做</button>
      <button class="ghost-button" @tap="$emit('action', prompt.ruleId, 'snooze')">30 分钟后再提醒</button>
      <button class="ghost-button" @tap="$emit('action', prompt.ruleId, 'skip')">今天跳过</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ReminderAction, ReminderPrompt } from "@/types/app";

defineProps<{
  prompt: ReminderPrompt | null;
}>();

defineEmits<{
  (event: "action", ruleId: string, action: ReminderAction): void;
}>();
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
