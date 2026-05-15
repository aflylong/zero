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

function cellClass(day: RecordDay) {
  const active = day.dateKey === props.activeDateKey;
  return {
    "heatmap__cell--empty": day.alignmentScore === null,
    "heatmap__cell--off": day.alignmentScore !== null && day.alignmentScore < 60,
    "heatmap__cell--aligned": day.alignmentScore !== null && day.alignmentScore >= 60,
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

.heatmap__cell--aligned {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg);
}

.heatmap__cell--off {
  border-color: rgba(82, 82, 91, 0.72);
  background: rgba(39, 39, 42, 0.85);
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
