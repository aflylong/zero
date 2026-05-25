<template>
  <PageShell tab-key="records">
    <view class="records-page">
      <view class="records-hero">
        <view class="records-hero__label">
          <view class="records-hero__icon">
            <view class="records-hero__icon-core" />
          </view>
          <text class="records-hero__label-text">连续推进</text>
        </view>

        <view class="records-hero__value-row">
          <text class="records-hero__value">{{ overallSummary.currentStreak }}</text>
          <text class="records-hero__unit">天</text>
        </view>

        <text class="records-hero__copy">{{ streakDescription }}</text>
      </view>

      <GlassCard card-class="records-card records-overview">
        <view class="records-metrics">
          <view class="records-metric">
            <text class="records-metric__value">{{ windowSummary.averageAlignment }}%</text>
            <text class="records-metric__label">平均</text>
          </view>
          <view class="records-metric">
            <text class="records-metric__value">{{ windowSummary.completedDays }}/{{ windowSummary.trackedDays }}</text>
            <text class="records-metric__label">有证据</text>
          </view>
          <view class="records-metric">
            <text class="records-metric__value">{{ overallSummary.bestStreak }}</text>
            <text class="records-metric__label">最佳</text>
          </view>
        </view>

        <view class="records-summary">
          <SectionLabel>趋势摘要</SectionLabel>
          <text class="records-summary__title">{{ trendHeadline }}</text>
          <text class="muted-text">{{ trendBody }}</text>
        </view>
      </GlassCard>

      <GlassCard card-class="records-card">
        <view class="records-window-compact">
          <button
            class="records-window-compact__button"
            :disabled="!recordWindow.hasPrevWindow"
            @tap="shiftWindow(-35)"
          >
            ‹
          </button>
          <view class="records-window-compact__center">
            <text class="records-window-compact__range">{{ windowRangeLabel }}</text>
            <text class="records-window-compact__hint">35 天窗口</text>
          </view>
          <button
            class="records-window-compact__button"
            :disabled="!recordWindow.hasNextWindow"
            @tap="shiftWindow(35)"
          >
            ›
          </button>
        </view>

        <view class="records-section-head">
          <view class="records-section-head__copy">
            <SectionLabel>35 天热力格</SectionLabel>
            <text class="records-section-head__title">点任意一天,查看评分、提醒处理与综合</text>
          </view>
        </view>

        <HeatmapGrid
          :days="recordWindow.days"
          :active-date-key="activeHeatmapDate"
          @select="openRecordDetail"
        />

        <view class="records-legend">
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--strong" />
            <text class="records-legend__text">70+</text>
          </view>
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--mid" />
            <text class="records-legend__text">40-69</text>
          </view>
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--faint" />
            <text class="records-legend__text">1-39</text>
          </view>
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--off" />
            <text class="records-legend__text">未留下</text>
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="records-card">
        <SectionLabel>过往目标</SectionLabel>
        <view v-if="goalHistory.length" class="records-goals">
          <view
            v-for="goal in goalHistory.slice(0, 6)"
            :key="goal.id"
            class="records-goal"
            :class="`records-goal--${goal.status}`"
          >
            <view class="records-goal__head">
              <text class="records-goal__type">{{ goal.type === "year" ? "一年" : "一月" }}</text>
              <text class="records-goal__status">{{ statusLabel(goal.status) }}</text>
            </view>
            <text class="records-goal__title">{{ goal.title }}</text>
            <text v-if="goal.reflection" class="records-goal__reflection">{{ goal.reflection }}</text>
            <text class="records-goal__meta">归档于 {{ formatDate(goal.endedAt) }}</text>
          </view>
        </view>
        <text v-else class="muted-text">
          还没有归档过目标。在「编辑道路」里点「归档」就能把当前目标存进历史。
        </text>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import HeatmapGrid from "@/components/HeatmapGrid.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { parseDateKey } from "@/services/date";
import { useAppStore } from "@/stores/useAppStore";
import type { GoalStatus } from "@/types/app";

const store = useAppStore();

const todayDateKey = computed(() => store.state.activeDateKey);
const recordWindow = computed(() =>
  store.getRecordWindow({ endDateKey: store.state.recordWindowEndDateKey }),
);
const overallSummary = computed(() =>
  store.getRecordSummary({ endDateKey: todayDateKey.value }),
);
const windowSummary = computed(() =>
  store.getRecordSummary({
    endDateKey: recordWindow.value.endDateKey,
    spanDays: recordWindow.value.spanDays,
  }),
);
const activeHeatmapDate = computed(() =>
  recordWindow.value.endDateKey === todayDateKey.value ? todayDateKey.value : "",
);

const windowRangeLabel = computed(
  () =>
    `${formatRangeDate(recordWindow.value.startDateKey)} - ${formatRangeDate(recordWindow.value.endDateKey)}`,
);

const streakDescription = computed(() => {
  if (overallSummary.value.currentStreak > 0) {
    return "连续性正在形成,你留下的每一天都在抬高身份可信度。";
  }
  if (overallSummary.value.trackedDays > 0) {
    return "轨迹没有丢,只是需要从今天重新把连续性拉起来。";
  }
  return "先留下第一条快照,记录系统才会开始发力。";
});

const trendHeadline = computed(() => {
  if (!windowSummary.value.trackedDays) return "这个窗口里还没留下记录。";
  if (windowSummary.value.averageAlignment >= 80) return "这段时间整体推进很稳。";
  if (windowSummary.value.averageAlignment >= 50) return "整体在线,还有些松动。";
  return "这段时间偏离明显,做一个最小杠杆就能拉回来。";
});

const trendBody = computed(() => {
  if (!windowSummary.value.trackedDays) {
    return "开始用今日页、提醒和夜间综合后,这里会长出可翻看的真实轨迹。";
  }
  return `当前窗口记录了 ${windowSummary.value.trackedDays} 天,其中 ${windowSummary.value.completedDays} 天留下了真实推进证据。`;
});

const goalHistory = computed(() => store.getGoalHistory());

function statusLabel(s: GoalStatus): string {
  if (s === "completed") return "完成";
  if (s === "habituated") return "习惯化";
  if (s === "abandoned") return "放弃";
  return "进行中";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "—";
  }
}

function shiftWindow(offsetDays: number) {
  store.shiftRecordWindow(offsetDays);
}

function openRecordDetail(dateKey: string) {
  uni.navigateTo({ url: `/pages/record-detail/index?date=${dateKey}` });
}

function formatRangeDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

onShow(() => {
  store.initialize();
});
</script>

<style scoped lang="scss">
.records-page {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.records-hero {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 40rpx 36rpx;
  border: 1px solid rgba(194, 65, 12, 0.3);
  border-radius: 30rpx;
  background: linear-gradient(145deg, rgba(67, 20, 7, 0.58), rgba(24, 24, 27, 0.72));
}

.records-hero__label {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.records-hero__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: rgba(251, 146, 60, 0.12);
}

.records-hero__icon-core {
  width: 16rpx;
  height: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
}

.records-hero__label-text {
  color: #a1a1aa;
  font-size: 24rpx;
}

.records-hero__value-row {
  display: flex;
  gap: 12rpx;
  align-items: flex-end;
}

.records-hero__value {
  color: #fff7ed;
  font-size: 100rpx;
  line-height: 0.92;
  font-weight: 300;
}

.records-hero__unit {
  margin-bottom: 10rpx;
  color: #71717a;
  font-size: 30rpx;
}

.records-hero__copy {
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.6;
}

.records-card {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.records-section-head {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.records-section-head__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.records-section-head__title,
.records-summary__title {
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.4;
}

.records-overview {
  gap: 26rpx;
}

.records-window-compact {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.records-window-compact__button {
  width: 70rpx;
  height: 70rpx;
  border: 1px solid rgba(63, 63, 70, 0.64);
  border-radius: 999rpx;
  color: #d4d4d8;
  font-size: 44rpx;
  line-height: 1;
}

.records-window-compact__center {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.records-window-compact__range {
  color: #f5f5f5;
  font-size: 30rpx;
}

.records-window-compact__hint {
  color: #71717a;
  font-size: 20rpx;
}

.records-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.records-metric {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 0 12rpx;
  border-left: 1px solid rgba(39, 39, 42, 0.82);
}

.records-metric:first-child {
  border-left: 0;
}

.records-metric__value {
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.1;
}

.records-metric__label {
  color: #71717a;
  font-size: 20rpx;
}

.records-legend {
  display: flex;
  gap: 18rpx;
  align-items: center;
  flex-wrap: wrap;
}

.records-legend__item {
  display: inline-flex;
  gap: 8rpx;
  align-items: center;
}

.records-legend__swatch {
  width: 18rpx;
  height: 18rpx;
  border: 1px solid rgba(63, 63, 70, 0.55);
  border-radius: 6rpx;
  background: rgba(24, 24, 27, 0.68);
}

.records-legend__swatch--strong {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.34);
}
.records-legend__swatch--mid {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.20);
}
.records-legend__swatch--faint {
  border-color: rgba(16, 185, 129, 0.18);
  background: rgba(6, 95, 70, 0.10);
}
.records-legend__swatch--off {
  border-color: rgba(82, 82, 91, 0.55);
  background: rgba(24, 24, 27, 0.68);
}

.records-legend__text {
  color: #71717a;
  font-size: 20rpx;
}

.records-summary {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.records-goals {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.records-goal {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 14rpx 16rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 14rpx;
  background: rgba(24, 24, 27, 0.36);
}
.records-goal__head {
  display: flex;
  justify-content: space-between;
  font-size: 20rpx;
  color: #71717a;
}
.records-goal__type {
  color: #d1fae5;
  font-weight: 600;
}
.records-goal--completed .records-goal__status { color: #d1fae5; }
.records-goal--habituated .records-goal__status { color: #60a5fa; }
.records-goal--abandoned .records-goal__status { color: #fb923c; }

.records-goal__title {
  color: #f5f5f5;
  font-size: 26rpx;
  font-weight: 500;
}
.records-goal__reflection {
  color: #d4d4d8;
  font-size: 22rpx;
  line-height: 1.55;
}
.records-goal__meta {
  color: #71717a;
  font-size: 20rpx;
}
</style>
