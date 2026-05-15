<template>
  <div class="bars">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      class="bars__svg"
      role="img"
      aria-label="最近 7 天每日完成证明条数"
    >
      <g v-for="(bar, idx) in bars" :key="idx">
        <rect
          :x="bar.x"
          :y="bar.yTrack"
          :width="barWidth"
          :height="bar.trackHeight"
          :rx="3"
          :ry="3"
          fill="var(--si-color-surface-inset)"
          stroke="rgba(63, 63, 70, 0.55)"
          stroke-width="1"
        />
        <rect
          v-if="bar.count > 0"
          :x="bar.x"
          :y="bar.yFill"
          :width="barWidth"
          :height="bar.fillHeight"
          :rx="3"
          :ry="3"
          :fill="bar.ratio >= 1 ? 'var(--si-color-brand)' : 'var(--si-color-brand-border)'"
        />
        <text
          :x="bar.x + barWidth / 2"
          :y="height - 4"
          text-anchor="middle"
          class="bars__label"
        >
          {{ bar.label }}
        </text>
      </g>
    </svg>

    <div class="bars__legend">
      <span class="muted-text">{{ heading }}</span>
      <span class="muted-text">{{ footnote }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecordDay } from "@guiling/core";

const props = withDefaults(
  defineProps<{
    days: RecordDay[];
    denominator: number;
    width?: number;
    height?: number;
  }>(),
  {
    width: 280,
    height: 120,
  },
);

const padding = { top: 6, right: 6, bottom: 18, left: 6 };
const barWidth = computed(() => {
  const n = Math.max(1, props.days.length);
  const usable = props.width - padding.left - padding.right;
  const gap = 6;
  return Math.max(4, (usable - gap * (n - 1)) / n);
});

const bars = computed(() => {
  const trackTop = padding.top;
  const trackBottom = props.height - padding.bottom;
  const trackHeight = trackBottom - trackTop;
  const n = props.days.length;
  const gap = 6;
  const denom = Math.max(1, props.denominator);

  return props.days.map((day, idx) => {
    const x = padding.left + idx * (barWidth.value + gap);
    const count = day.completedProofCount;
    const ratio = Math.min(1, count / denom);
    const fillHeight = trackHeight * ratio;
    const yFill = trackBottom - fillHeight;
    return {
      x,
      yTrack: trackTop,
      yFill,
      trackHeight,
      fillHeight,
      count,
      ratio,
      label: day.weekday,
    };
  });
});

const heading = computed(() => {
  if (!props.days.length) return "最近 7 天";
  const total = props.days.reduce((s, d) => s + d.completedProofCount, 0);
  return `最近 7 天 · 合计 ${total} 条证明`;
});

const footnote = computed(() => `满格 = ${props.denominator}`);
</script>

<style lang="scss" scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bars__svg {
  width: 100%;
  height: 120px;
  display: block;
}

.bars__label {
  fill: var(--si-color-text-faint);
  font-size: 10px;
  font-family: var(--si-font-family);
}

.bars__legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--si-font-xs);
}
</style>
