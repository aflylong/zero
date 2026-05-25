<template>
  <view class="heatmap">
    <view class="heatmap__weekdays">
      <text v-for="weekday in weekdays" :key="weekday" class="heatmap__weekday">{{ weekday }}</text>
    </view>
    <view class="heatmap__grid">
      <button
        v-for="day in days"
        :key="day.dateKey"
        class="heatmap__cell"
        :class="cellClass(day)"
        @tap="$emit('select', day.dateKey)"
      >
        <text class="heatmap__label">{{ day.label }}</text>
        <view
          v-if="day.alignmentScore !== null"
          class="heatmap__marker"
          :class="{ 'heatmap__marker--reviewed': day.hasNightReview }"
        />
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { RecordDay } from "@/types/app";

const props = defineProps<{
  days: RecordDay[];
  activeDateKey?: string;
}>();

defineEmits<{
  (event: "select", dateKey: string): void;
}>();

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 4 档梯度,与「今日推进度」软化口径一致(不再用 60 分二分):
 *   未追踪 / 0 分:empty
 *   1-39   :低,faint
 *   40-69  :中,mid
 *   70+    :高,strong
 */
function cellClass(day: RecordDay) {
  const active = day.dateKey === props.activeDateKey;
  const hasEvidence =
    (day.alignmentScore ?? 0) > 0 ||
    Boolean(day.note?.trim()) ||
    day.completedProofCount > 0 ||
    day.hasNightReview;
  const score = day.alignmentScore ?? 0;
  return {
    "heatmap__cell--empty": !hasEvidence,
    "heatmap__cell--faint": hasEvidence && score < 40,
    "heatmap__cell--mid": hasEvidence && score >= 40 && score < 70,
    "heatmap__cell--strong": hasEvidence && score >= 70,
    "heatmap__cell--active": active,
  };
}
</script>

<style scoped lang="scss">
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.heatmap__weekdays,
.heatmap__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12rpx;
}

.heatmap__weekday {
  color: #52525b;
  font-size: 20rpx;
  text-align: center;
}

.heatmap__cell {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 1px solid rgba(63, 63, 70, 0.55);
  border-radius: 20rpx;
  background: rgba(24, 24, 27, 0.68);
}

.heatmap__cell--faint {
  border-color: rgba(16, 185, 129, 0.18);
  background: rgba(6, 95, 70, 0.10);
}
.heatmap__cell--mid {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.20);
}
.heatmap__cell--strong {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.34);
}

.heatmap__cell--active {
  border-color: rgba(244, 244, 245, 0.55);
}

.heatmap__label {
  color: #a1a1aa;
  font-size: 22rpx;
}

.heatmap__marker {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(245, 245, 245, 0.8);
  opacity: 0.78;
}

.heatmap__marker--reviewed {
  width: 14rpx;
  height: 14rpx;
  background: #34d399;
  box-shadow: 0 0 16rpx rgba(52, 211, 153, 0.34);
}
</style>
