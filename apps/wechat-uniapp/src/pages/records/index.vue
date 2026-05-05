<template>
  <PageShell tab-key="records">
    <view class="records-page">
      <view class="records-hero">
        <view class="records-hero__label">
          <view class="records-hero__icon">
            <view class="records-hero__icon-core" />
          </view>
          <text class="records-hero__label-text">连续记录</text>
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
            <text class="records-metric__label">对齐</text>
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
            <text class="records-section-head__title">点任意一天，查看评分、提醒处理与复盘</text>
          </view>
        </view>

        <HeatmapGrid
          :days="recordWindow.days"
          :active-date-key="activeHeatmapDate"
          @select="openRecordDetail"
        />

        <view class="records-legend">
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--aligned" />
            <text class="records-legend__text">稳定推进</text>
          </view>
          <view class="records-legend__item">
            <view class="records-legend__swatch records-legend__swatch--off" />
            <text class="records-legend__text">偏离</text>
          </view>
          <view class="records-legend__item">
            <view class="records-legend__dot" />
            <text class="records-legend__text">已写夜间复盘</text>
          </view>
        </view>
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
import { ensureOnboardingReady } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const todayDateKey = computed(() => store.state.activeDateKey);
const recordWindow = computed(() =>
  store.getRecordWindow({
    endDateKey: store.state.recordWindowEndDateKey,
  }),
);
const overallSummary = computed(() =>
  store.getRecordSummary({
    endDateKey: todayDateKey.value,
  }),
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

const windowRangeLabel = computed(() =>
  `${formatRangeDate(recordWindow.value.startDateKey)} - ${formatRangeDate(recordWindow.value.endDateKey)}`,
);

const streakDescription = computed(() => {
  if (!store.state.data.onboardingCompleted) {
    return "先完成初始化，真实记录会从今天开始累积。";
  }

  if (overallSummary.value.currentStreak > 0) {
    return "连续性正在形成，你留下的每一天都在抬高身份可信度。";
  }

  if (overallSummary.value.trackedDays > 0) {
    return "轨迹没有丢，只是需要从今天重新把连续性拉起来。";
  }

  return "先留下第一条快照，记录系统才会开始发力。";
});

const trendHeadline = computed(() => {
  if (!windowSummary.value.trackedDays) {
    return "这个窗口里还没有留下真实记录。";
  }

  if (windowSummary.value.averageAlignment >= 80) {
    return "这段时间整体推进很稳。";
  }

  if (windowSummary.value.averageAlignment >= 60) {
    return "这段时间整体在线，但还有一些松动。";
  }

  return "这段时间偏离比较明显，需要更主动地纠偏。";
});

const trendBody = computed(() => {
  if (!windowSummary.value.trackedDays) {
    return "开始使用今日页、提醒和夜间复盘后，这里会长出可翻看的真实轨迹。";
  }

  return `当前窗口里记录了 ${windowSummary.value.trackedDays} 天，其中 ${windowSummary.value.completedDays} 天达到 60 分以上；点开任意日期可以看当天评分、提醒处理和夜间复盘。`;
});

function shiftWindow(offsetDays: number) {
  store.shiftRecordWindow(offsetDays);
}

function openRecordDetail(dateKey: string) {
  uni.navigateTo({
    url: `/pages/record-detail/index?date=${dateKey}`,
  });
}

function formatRangeDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }
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

.records-hero__icon::before {
  content: "";
  position: absolute;
  width: 24rpx;
  height: 30rpx;
  border-radius: 18rpx 18rpx 18rpx 6rpx;
  background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
  transform: rotate(-24deg) translateY(-2rpx);
}

.records-hero__icon-core {
  position: absolute;
  width: 12rpx;
  height: 18rpx;
  border-radius: 999rpx 999rpx 999rpx 4rpx;
  background: rgba(255, 237, 213, 0.88);
  transform: rotate(-20deg) translate(-2rpx, -2rpx);
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
  font-size: 108rpx;
  line-height: 0.92;
  font-weight: 300;
}

.records-hero__unit {
  margin-bottom: 10rpx;
  color: #71717a;
  font-size: 34rpx;
}

.records-hero__copy {
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.6;
}

.records-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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
  font-size: 34rpx;
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
  padding: 6rpx 0 2rpx;
}

.records-window-compact__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border: 1px solid rgba(63, 63, 70, 0.64);
  border-radius: 999rpx;
  color: #d4d4d8;
  font-size: 46rpx;
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
  line-height: 1.3;
}

.records-window-compact__hint {
  color: #71717a;
  font-size: 20rpx;
  line-height: 1.4;
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
  font-size: 34rpx;
  line-height: 1.1;
}

.records-metric__label {
  color: #71717a;
  font-size: 20rpx;
  line-height: 1.5;
}

.records-legend {
  display: flex;
  gap: 20rpx;
  align-items: center;
  flex-wrap: wrap;
}

.records-legend__item {
  display: inline-flex;
  gap: 10rpx;
  align-items: center;
}

.records-legend__swatch {
  width: 20rpx;
  height: 20rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 8rpx;
  background: rgba(24, 24, 27, 0.68);
}

.records-legend__swatch--aligned {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.34);
}

.records-legend__swatch--off {
  border-color: rgba(82, 82, 91, 0.72);
  background: rgba(39, 39, 42, 0.85);
}

.records-legend__dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: #34d399;
  box-shadow: 0 0 16rpx rgba(52, 211, 153, 0.34);
}

.records-legend__text {
  color: #71717a;
  font-size: 20rpx;
}

.records-summary {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
</style>
