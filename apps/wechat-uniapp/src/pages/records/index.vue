<template>
  <PageShell tab-key="records">
    <view class="records-page">
      <text class="page-title">记录</text>

      <view class="records-streak">
        <view class="records-streak__label">
          <view class="records-streak__icon">
            <view class="records-streak__icon-core" />
          </view>
          <text class="records-streak__label-text">当前连续打卡</text>
        </view>

        <view class="records-streak__value-row">
          <text class="records-streak__value">{{ summary.currentStreak }}</text>
          <text class="records-streak__unit">天</text>
        </view>

        <text class="records-streak__copy">{{ streakDescription }}</text>
      </view>

      <view class="records-history">
        <text class="records-history__label">身份一致性历史</text>

        <view class="records-history__weekdays">
          <text
            v-for="weekday in weekdays"
            :key="weekday"
            class="records-history__weekday"
          >
            {{ weekday }}
          </text>
        </view>

        <view class="records-history__grid">
          <view
            v-for="day in recordDays"
            :key="day.dateKey"
            class="records-history__cell"
            :class="cellClass(day)"
            @tap="handleSelectDate(day.dateKey)"
          >
            <text class="records-history__cell-label">{{ day.label }}</text>
          </view>
        </view>

        <view class="records-history__legend">
          <view class="records-history__legend-item">
            <view class="records-history__legend-swatch records-history__legend-swatch--aligned" />
            <text class="records-history__legend-text">一致</text>
          </view>
          <view class="records-history__legend-item">
            <view class="records-history__legend-swatch records-history__legend-swatch--off" />
            <text class="records-history__legend-text">偏离</text>
          </view>
        </view>

        <text class="records-history__hint">轻点任意一天，回看那天留下的真实记录。</text>
      </view>

      <view v-if="showDetail && selectedRecord" class="records-detail">
        <view class="records-detail__head">
          <view class="records-detail__copy">
            <text class="records-detail__title">{{ detailDateLabel }}</text>
            <text class="records-detail__subtitle">{{ detailHeadline }}</text>
          </view>
          <text class="records-detail__score">{{ selectedRecord.alignmentScore ?? "--" }}%</text>
        </view>

        <view v-if="selectedRecord.alignmentScore !== null" class="records-detail__facts">
          <text class="records-detail__fact">完成证明 {{ selectedRecord.completedProofCount }}</text>
          <text class="records-detail__fact">夜间复盘{{ selectedRecord.hasNightReview ? "已完成" : "未完成" }}</text>
        </view>

        <text class="records-detail__note">{{ detailNote }}</text>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageShell from "@/components/PageShell.vue";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const showDetail = ref(false);

onShow(() => {
  store.initialize();
  showDetail.value = false;
});

const recordDays = computed(() => store.getRecordDays());
const summary = computed(() => store.getRecordSummary());
const selectedRecord = computed(() => store.selectedRecord.value);
const selectedDateKey = computed(
  () => selectedRecord.value?.dateKey ?? store.state.selectedRecordDateKey,
);
const onboardingCompleted = computed(() => store.state.data.onboardingCompleted);
const trackedDays = computed(
  () => recordDays.value.filter((day) => day.alignmentScore !== null).length,
);

const streakDescription = computed(() => {
  if (!onboardingCompleted.value) {
    return "先完成初始化，这里会开始累计你的真实连续记录。";
  }

  if (summary.value.currentStreak > 0) {
    return "继续前进。你正在证明你是谁。";
  }

  if (trackedDays.value > 0) {
    return "连续性可以重启，但每一天的真实记录都会留下。";
  }

  return "今天开始留下第一条真实快照。";
});

const detailDateLabel = computed(() => formatDateLabel(selectedDateKey.value));

const detailHeadline = computed(() => {
  const record = selectedRecord.value;
  if (!record || record.alignmentScore === null) {
    return "这一天还没有留下快照。";
  }

  if (record.alignmentScore >= 80) {
    return "状态很稳，继续按这个节奏推进。";
  }

  if (record.alignmentScore >= 60) {
    return "整体在线，仍有一些可继续压实的空间。";
  }

  return "这一天有些偏离，看看哪里最容易重新收紧。";
});

const detailNote = computed(() => {
  const note = selectedRecord.value?.note?.trim();
  if (note) {
    return note;
  }

  if (selectedRecord.value?.alignmentScore === null) {
    return "当日尚未完成记录或复盘，所以这里会保持空白。";
  }

  return "这一天没有补充文字观察，但快照本身已经计入真实记录。";
});

function handleSelectDate(dateKey: string) {
  store.selectRecordDate(dateKey);
  showDetail.value = true;
}

function cellClass(day: { alignmentScore: number | null; dateKey: string }) {
  const isSelected = day.dateKey === selectedDateKey.value && showDetail.value;

  return {
    "records-history__cell--empty": day.alignmentScore === null,
    "records-history__cell--off": day.alignmentScore !== null && day.alignmentScore < 60,
    "records-history__cell--aligned": day.alignmentScore !== null && day.alignmentScore >= 60,
    "records-history__cell--selected": isSelected,
  };
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdaysMap = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${month} 月 ${day} 日 · ${weekdaysMap[date.getDay()]}`;
}
</script>

<style scoped lang="scss">
.records-page {
  display: flex;
  flex-direction: column;
  gap: 44rpx;
}

.records-streak {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 40rpx 36rpx;
  border: 1px solid rgba(194, 65, 12, 0.3);
  border-radius: 30rpx;
  background: linear-gradient(145deg, rgba(67, 20, 7, 0.58), rgba(24, 24, 27, 0.72));
}

.records-streak__label {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.records-streak__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: rgba(251, 146, 60, 0.12);
}

.records-streak__icon::before {
  content: "";
  position: absolute;
  width: 24rpx;
  height: 30rpx;
  border-radius: 18rpx 18rpx 18rpx 6rpx;
  background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
  transform: rotate(-24deg) translateY(-2rpx);
}

.records-streak__icon-core {
  position: absolute;
  width: 12rpx;
  height: 18rpx;
  border-radius: 999rpx 999rpx 999rpx 4rpx;
  background: rgba(255, 237, 213, 0.88);
  transform: rotate(-20deg) translate(-2rpx, -2rpx);
}

.records-streak__label-text {
  color: #a1a1aa;
  font-size: 24rpx;
}

.records-streak__value-row {
  display: flex;
  gap: 12rpx;
  align-items: flex-end;
}

.records-streak__value {
  color: #fff7ed;
  font-size: 108rpx;
  line-height: 0.92;
  font-weight: 300;
}

.records-streak__unit {
  margin-bottom: 10rpx;
  color: #71717a;
  font-size: 34rpx;
}

.records-streak__copy {
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.6;
}

.records-history {
  display: flex;
  flex-direction: column;
}

.records-history__label {
  margin-bottom: 24rpx;
  color: #71717a;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.records-history__weekdays,
.records-history__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12rpx;
}

.records-history__weekdays {
  margin-bottom: 14rpx;
}

.records-history__weekday {
  color: #52525b;
  font-size: 20rpx;
  text-align: center;
}

.records-history__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 1px solid rgba(39, 39, 42, 0.8);
  border-radius: 18rpx;
  background: rgba(24, 24, 27, 0.46);
}

.records-history__cell--aligned {
  border-color: rgba(52, 211, 153, 0.16);
  background: rgba(6, 95, 70, 0.28);
}

.records-history__cell--off {
  border-color: rgba(82, 82, 91, 0.7);
  background: rgba(39, 39, 42, 0.78);
}

.records-history__cell--selected {
  border-color: rgba(228, 228, 231, 0.82);
}

.records-history__cell-label {
  color: #71717a;
  font-size: 22rpx;
}

.records-history__cell--aligned .records-history__cell-label,
.records-history__cell--selected .records-history__cell-label {
  color: #f4f4f5;
}

.records-history__legend {
  display: flex;
  gap: 28rpx;
  align-items: center;
  justify-content: center;
  margin-top: 28rpx;
}

.records-history__legend-item {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.records-history__legend-swatch {
  width: 24rpx;
  height: 24rpx;
  border: 1px solid rgba(82, 82, 91, 0.72);
  border-radius: 8rpx;
  background: rgba(24, 24, 27, 0.46);
}

.records-history__legend-swatch--aligned {
  border-color: rgba(52, 211, 153, 0.16);
  background: rgba(6, 95, 70, 0.28);
}

.records-history__legend-swatch--off {
  background: rgba(39, 39, 42, 0.78);
}

.records-history__legend-text,
.records-history__hint {
  color: #71717a;
  font-size: 20rpx;
}

.records-history__hint {
  margin-top: 18rpx;
  text-align: center;
}

.records-detail {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 30rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.3);
}

.records-detail__head {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.records-detail__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.records-detail__title {
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.3;
}

.records-detail__subtitle,
.records-detail__note {
  color: #a1a1aa;
  font-size: 24rpx;
  line-height: 1.62;
}

.records-detail__score {
  color: #f4f4f5;
  font-size: 32rpx;
  line-height: 1;
}

.records-detail__facts {
  display: flex;
  gap: 18rpx;
  flex-wrap: wrap;
}

.records-detail__fact {
  color: #71717a;
  font-size: 22rpx;
}
</style>
