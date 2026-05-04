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
        :class="cellClass(day.alignmentScore, day.dateKey === activeDateKey)"
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

defineProps<{
  days: RecordDay[];
  activeDateKey?: string;
}>();

defineEmits<{
  (event: "select", dateKey: string): void;
}>();

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

function cellClass(score: number | null, active: boolean) {
  return {
    "heatmap__cell--empty": score === null,
    "heatmap__cell--off": score !== null && score < 60,
    "heatmap__cell--aligned": score !== null && score >= 60,
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

.heatmap__cell--aligned {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.34);
}

.heatmap__cell--off {
  border-color: rgba(82, 82, 91, 0.72);
  background: rgba(39, 39, 42, 0.85);
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
