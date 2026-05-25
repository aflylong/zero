<template>
  <div class="heatmap">
    <div class="heatmap__weekdays">
      <span v-for="w in weekdays" :key="w" class="heatmap__weekday">{{ w }}</span>
    </div>
    <div class="heatmap__grid">
      <button
        v-for="day in days"
        :key="day.dateKey"
        type="button"
        class="heatmap__cell"
        :class="cellClass(day)"
        :title="`${day.dateKey} · 周${day.weekday}`"
        @click="emit('select', day.dateKey)"
      >
        <span class="heatmap__label">{{ day.label }}</span>
        <span
          v-if="day.alignmentScore !== null"
          class="heatmap__marker"
          :class="{ 'heatmap__marker--reviewed': day.hasNightReview }"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecordDay } from "@guiling/core";

const props = defineProps<{
  days: RecordDay[];
  activeDateKey?: string;
}>();

const emit = defineEmits<{
  (event: "select", dateKey: string): void;
}>();

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 着色按 4 档梯度,与「今日推进度」软化口径一致(不再用 60 分二分):
 *   未追踪 / 0 分:empty
 *   1-39   :低,faint
 *   40-69  :中,mid
 *   70+    :高,strong
 * 同时:有任意推进证据(完成杠杆 / 写观察 / 写综合)的格子也算"有证据",叠加底色。
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

<style lang="scss" scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.heatmap__weekdays,
.heatmap__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.heatmap__weekday {
  color: var(--si-color-text-disabled);
  font-size: var(--si-font-xs);
  text-align: center;
}

.heatmap__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  aspect-ratio: 1;
  border: 1px solid rgba(63, 63, 70, 0.55);
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-card);
  cursor: pointer;
  transition: transform 80ms ease, border-color 140ms ease;

  &:hover {
    transform: scale(1.03);
    border-color: rgba(113, 113, 122, 0.78);
  }
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
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg);
}

.heatmap__cell--active {
  outline: 2px solid rgba(244, 244, 245, 0.55);
  outline-offset: -1px;
}

.heatmap__label {
  color: var(--si-color-text-muted);
  font-size: var(--si-font-xs);
}

.heatmap__marker {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(245, 245, 245, 0.7);
}

.heatmap__marker--reviewed {
  width: 8px;
  height: 8px;
  background: var(--si-color-brand);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
}
</style>
