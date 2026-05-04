<template>
  <PageShell tab-key="records">
    <view class="records-page">
      <GradientHeroCard card-class="records-page__hero">
        <SectionLabel>真实快照</SectionLabel>
        <view class="records-page__hero-head">
          <view class="section-stack">
            <text class="page-title">最近 35 天记录</text>
            <text class="body-text">
              不是估计值，也不是阶段感受，而是来自每日快照和复盘的真实轨迹。
            </text>
          </view>
          <view class="records-page__hero-badge">
            <text class="records-page__hero-badge-value">{{ summary.completedDays }}</text>
            <text class="records-page__hero-badge-label">对齐天数</text>
          </view>
        </view>
      </GradientHeroCard>

      <view class="records-page__metrics">
        <GlassCard card-class="records-page__metric-card">
          <text class="records-page__metric-label">连续天数</text>
          <text class="records-page__metric-value">{{ summary.currentStreak }}</text>
          <text class="muted-text">截至今天连续保持一致</text>
        </GlassCard>
        <GlassCard card-class="records-page__metric-card">
          <text class="records-page__metric-label">最佳连续</text>
          <text class="records-page__metric-value">{{ summary.bestStreak }}</text>
          <text class="muted-text">35 天内最长稳定段</text>
        </GlassCard>
        <GlassCard card-class="records-page__metric-card">
          <text class="records-page__metric-label">平均一致性</text>
          <text class="records-page__metric-value">{{ summary.averageAlignment }}%</text>
          <text class="muted-text">按已生成快照日期计算</text>
        </GlassCard>
      </view>

      <GlassCard card-class="records-page__heatmap-card">
        <view class="records-page__section-head">
          <view class="section-stack">
            <SectionLabel>热力图</SectionLabel>
            <text class="records-page__section-title">点击任意一天查看细节</text>
          </view>
          <text class="records-page__section-meta">{{ trackedDaysLabel }}</text>
        </view>
        <HeatmapGrid
          :days="recordDays"
          :active-date-key="selectedDateKey"
          @select="handleSelectDate"
        />
        <view class="records-page__legend">
          <view class="records-page__legend-item">
            <view class="records-page__legend-dot records-page__legend-dot--empty" />
            <text class="muted-text">无记录</text>
          </view>
          <view class="records-page__legend-item">
            <view class="records-page__legend-dot records-page__legend-dot--off" />
            <text class="muted-text">低于 60</text>
          </view>
          <view class="records-page__legend-item">
            <view class="records-page__legend-dot records-page__legend-dot--on" />
            <text class="muted-text">60 及以上</text>
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="records-page__detail-card">
        <view class="records-page__section-head">
          <view class="section-stack">
            <SectionLabel>单日详情</SectionLabel>
            <text class="records-page__section-title">{{ detailDateLabel }}</text>
          </view>
          <view class="records-page__detail-status" :class="detailStatusClass">
            <text>{{ detailStatusLabel }}</text>
          </view>
        </view>

        <template v-if="selectedRecord && selectedRecord.alignmentScore !== null">
          <view class="records-page__detail-grid">
            <view class="records-page__detail-stat">
              <text class="records-page__detail-stat-label">一致性</text>
              <text class="records-page__detail-stat-value">
                {{ selectedRecord.alignmentScore }}%
              </text>
            </view>
            <view class="records-page__detail-stat">
              <text class="records-page__detail-stat-label">完成证明</text>
              <text class="records-page__detail-stat-value">
                {{ selectedRecord.completedProofCount }}
              </text>
            </view>
            <view class="records-page__detail-stat">
              <text class="records-page__detail-stat-label">夜间复盘</text>
              <text class="records-page__detail-stat-value">
                {{ selectedRecord.hasNightReview ? "已完成" : "未完成" }}
              </text>
            </view>
          </view>

          <view class="records-page__note-block">
            <text class="records-page__note-label">当天观察</text>
            <text class="body-text">
              {{ selectedRecord.note.trim() || "这一天还没有留下文字观察，但快照已经计入统计。" }}
            </text>
          </view>
        </template>

        <view v-else class="records-page__empty">
          <text class="records-page__empty-title">这一天还没有生成快照</text>
          <text class="muted-text">
            当日尚未完成记录或复盘，所以热力图会保留空白，不会用假数据填充。
          </text>
        </view>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import HeatmapGrid from "@/components/HeatmapGrid.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

onShow(() => {
  store.initialize();
  if (!store.state.data.onboardingCompleted) {
    uni.reLaunch({ url: "/pages/onboarding/index" });
  }
});

const recordDays = computed(() => store.getRecordDays());
const summary = computed(() => store.getRecordSummary());
const selectedRecord = computed(() => store.selectedRecord.value);
const selectedDateKey = computed(() => selectedRecord.value?.dateKey ?? store.state.selectedRecordDateKey);

const trackedDays = computed(
  () => recordDays.value.filter((day) => day.alignmentScore !== null).length,
);

const trackedDaysLabel = computed(() => `已记录 ${trackedDays.value} / 35 天`);

const detailDateLabel = computed(() => formatDateLabel(selectedDateKey.value));

const detailStatusLabel = computed(() => {
  const record = selectedRecord.value;
  if (!record || record.alignmentScore === null) {
    return "暂无记录";
  }

  if (record.alignmentScore >= 80) {
    return "高度一致";
  }

  if (record.alignmentScore >= 60) {
    return "保持轨道";
  }

  return "需要纠偏";
});

const detailStatusClass = computed(() => {
  const record = selectedRecord.value;
  const score = record?.alignmentScore;
  return {
    "records-page__detail-status--empty": score === null || score === undefined,
    "records-page__detail-status--warn": score !== null && score !== undefined && score < 60,
    "records-page__detail-status--good": score !== null && score !== undefined && score >= 60,
  };
});

function handleSelectDate(dateKey: string) {
  store.selectRecordDate(dateKey);
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${month} 月 ${day} 日 · ${weekdays[date.getDay()]}`;
}
</script>

<style scoped lang="scss">
.records-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.records-page__hero {
  position: relative;
  overflow: hidden;
}

.records-page__hero::after {
  content: "";
  position: absolute;
  top: -80rpx;
  right: -40rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 999rpx;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, rgba(52, 211, 153, 0) 72%);
  pointer-events: none;
}

.records-page__hero-head {
  display: flex;
  gap: 24rpx;
  align-items: flex-end;
  justify-content: space-between;
}

.records-page__hero-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8rpx;
  min-width: 168rpx;
  padding: 24rpx;
  border: 1px solid rgba(167, 243, 208, 0.18);
  border-radius: 28rpx;
  background: rgba(2, 44, 34, 0.38);
}

.records-page__hero-badge-value {
  color: #ecfdf5;
  font-size: 52rpx;
  line-height: 1;
}

.records-page__hero-badge-label {
  color: rgba(209, 250, 229, 0.82);
  font-size: 22rpx;
}

.records-page__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx;
}

.records-page__metric-card {
  gap: 18rpx;
}

.records-page__metric-label {
  color: #a1a1aa;
  font-size: 22rpx;
}

.records-page__metric-value {
  color: #f5f5f5;
  font-size: 54rpx;
  line-height: 1;
}

.records-page__heatmap-card,
.records-page__detail-card,
.records-page__metric-card {
  display: flex;
  flex-direction: column;
}

.records-page__section-head {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.records-page__section-title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.28;
}

.records-page__section-meta {
  color: #71717a;
  font-size: 22rpx;
  white-space: nowrap;
}

.records-page__legend {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
  margin-top: 24rpx;
}

.records-page__legend-item {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.records-page__legend-dot {
  width: 20rpx;
  height: 20rpx;
  border: 1px solid rgba(82, 82, 91, 0.72);
  border-radius: 999rpx;
}

.records-page__legend-dot--empty {
  background: rgba(24, 24, 27, 0.65);
}

.records-page__legend-dot--off {
  background: rgba(39, 39, 42, 0.95);
}

.records-page__legend-dot--on {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(6, 95, 70, 0.6);
}

.records-page__detail-status {
  padding: 14rpx 22rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 999rpx;
  background: rgba(17, 24, 39, 0.35);
  color: #d4d4d8;
  font-size: 22rpx;
  white-space: nowrap;
}

.records-page__detail-status--empty {
  color: #a1a1aa;
}

.records-page__detail-status--warn {
  border-color: rgba(251, 146, 60, 0.25);
  background: rgba(124, 45, 18, 0.28);
  color: #fdba74;
}

.records-page__detail-status--good {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.26);
  color: #bbf7d0;
}

.records-page__detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.records-page__detail-stat {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border: 1px solid rgba(63, 63, 70, 0.6);
  border-radius: 24rpx;
  background: rgba(15, 23, 42, 0.25);
}

.records-page__detail-stat-label {
  color: #71717a;
  font-size: 22rpx;
}

.records-page__detail-stat-value {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.2;
}

.records-page__note-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border: 1px solid rgba(63, 63, 70, 0.5);
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(9, 9, 11, 0.86) 0%, rgba(17, 24, 39, 0.42) 100%);
}

.records-page__note-label {
  color: #a1a1aa;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.records-page__empty {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border: 1px dashed rgba(63, 63, 70, 0.72);
  border-radius: 24rpx;
  background: rgba(9, 9, 11, 0.48);
}

.records-page__empty-title {
  color: #f5f5f5;
  font-size: 30rpx;
}
</style>
