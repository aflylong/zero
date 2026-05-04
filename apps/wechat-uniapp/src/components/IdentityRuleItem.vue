<template>
  <view class="glass-card rule-item">
    <view class="rule-item__header">
      <button class="rule-item__toggle" @tap="$emit('toggle-active', rule.id)">
        <view class="rule-item__checkbox" :class="{ 'rule-item__checkbox--active': rule.active }" />
        <view class="rule-item__copy">
          <text class="rule-item__title">{{ rule.title || "未命名法则" }}</text>
          <text class="rule-item__description">{{ rule.description || "写下你想证明给自己的动作。" }}</text>
        </view>
      </button>
      <button class="danger-button" @tap="$emit('remove', rule.id)">删除</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProofRule } from "@/types/app";

defineProps<{
  rule: ProofRule;
}>();

defineEmits<{
  (event: "toggle-active", ruleId: string): void;
  (event: "remove", ruleId: string): void;
}>();
</script>

<style scoped lang="scss">
.rule-item__header {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.rule-item__toggle {
  display: flex;
  flex: 1;
  gap: 20rpx;
  align-items: flex-start;
  text-align: left;
}

.rule-item__checkbox {
  width: 34rpx;
  height: 34rpx;
  margin-top: 8rpx;
  border: 1px solid rgba(82, 82, 91, 0.92);
  border-radius: 999rpx;
}

.rule-item__checkbox--active {
  border-color: rgba(16, 185, 129, 0.35);
  background: #34d399;
}

.rule-item__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.rule-item__title {
  color: #f4f4f5;
  font-size: 28rpx;
  line-height: 1.45;
}

.rule-item__description {
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.65;
}
</style>
