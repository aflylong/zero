<template>
  <div class="trend-chart">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      class="trend-chart__svg"
      role="img"
      :aria-label="`最近 ${points.length} 天的对齐分数趋势`"
    >
      <!-- Horizontal guide lines at 0 / 50 / 100 -->
      <g class="trend-chart__grid">
        <line
          v-for="line in gridLines"
          :key="line.y"
          :x1="padding.left"
          :x2="width - padding.right"
          :y1="line.y"
          :y2="line.y"
        />
      </g>

      <!-- Gradient fill area below line -->
      <defs>
        <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--si-color-brand)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--si-color-brand)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />

      <!-- Main line -->
      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        stroke="var(--si-color-brand)"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Dots for scored days -->
      <g>
        <circle
          v-for="(pt, idx) in scoredPoints"
          :key="idx"
          :cx="pt.x"
          :cy="pt.y"
          r="2.5"
          fill="var(--si-color-brand)"
        />
      </g>

      <!-- Y-axis labels -->
      <g class="trend-chart__ylabels">
        <text
          v-for="line in gridLines"
          :key="`lbl-${line.y}`"
          :x="padding.left - 6"
          :y="line.y + 3"
          text-anchor="end"
        >
          {{ line.label }}
        </text>
      </g>
    </svg>

    <div class="trend-chart__legend">
      <span class="muted-text">
        {{ startLabel }} — {{ endLabel }}
      </span>
      <span class="muted-text">{{ summary }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecordDay } from "@guiling/core";
import { parseDateKey } from "@guiling/core";

const props = withDefaults(
  defineProps<{
    days: RecordDay[];
    width?: number;
    height?: number;
  }>(),
  {
    width: 560,
    height: 160,
  },
);

const padding = { top: 16, right: 8, bottom: 18, left: 32 };

const gradientId = `trend-grad-${Math.random().toString(36).slice(2, 8)}`;

const gridLines = computed(() => {
  const range = [0, 50, 100];
  return range.map((value) => ({
    y: projectY(value),
    label: `${value}`,
  }));
});

function projectY(score: number): number {
  const top = padding.top;
  const bottom = props.height - padding.bottom;
  const ratio = Math.max(0, Math.min(100, score)) / 100;
  return top + (1 - ratio) * (bottom - top);
}

const points = computed(() => {
  const n = props.days.length;
  if (!n) return [] as Array<{ x: number; y: number | null; day: RecordDay }>;
  const left = padding.left;
  const right = props.width - padding.right;
  const span = right - left;
  return props.days.map((day, idx) => ({
    x: n === 1 ? (left + right) / 2 : left + (idx / (n - 1)) * span,
    y: day.alignmentScore === null ? null : projectY(day.alignmentScore),
    day,
  }));
});

const scoredPoints = computed(() =>
  points.value.filter((p): p is { x: number; y: number; day: RecordDay } => p.y !== null),
);

const linePath = computed(() => {
  if (scoredPoints.value.length < 2) return "";
  return scoredPoints.value
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
});

const areaPath = computed(() => {
  if (scoredPoints.value.length < 2) return "";
  const baseY = props.height - padding.bottom;
  const first = scoredPoints.value[0];
  const last = scoredPoints.value[scoredPoints.value.length - 1];
  const line = scoredPoints.value
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  return `${line} L ${last.x.toFixed(2)} ${baseY} L ${first.x.toFixed(2)} ${baseY} Z`;
});

function fmtDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const startLabel = computed(() =>
  props.days.length ? fmtDate(props.days[0].dateKey) : "",
);

const endLabel = computed(() =>
  props.days.length ? fmtDate(props.days[props.days.length - 1].dateKey) : "",
);

const summary = computed(() => {
  const scored = scoredPoints.value;
  if (!scored.length) return "尚无记录";
  const avg = Math.round(
    scored.reduce((s, p) => s + (p.day.alignmentScore ?? 0), 0) / scored.length,
  );
  return `${scored.length} 天记录 · 平均 ${avg}%`;
});
</script>

<style lang="scss" scoped>
.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trend-chart__svg {
  width: 100%;
  height: 160px;
  display: block;
}

.trend-chart__grid line {
  stroke: rgba(63, 63, 70, 0.5);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}

.trend-chart__ylabels text {
  fill: var(--si-color-text-faint);
  font-size: 9px;
  font-family: var(--si-font-family);
}

.trend-chart__legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--si-font-xs);
}
</style>
