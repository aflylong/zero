<template>
  <PageShell
    title="记录详情"
    topbar-mode="secondary"
    back-url="/pages/records/index"
    compact
  >
    <view class="record-detail-page">
      <view class="record-detail-hero">
        <SectionLabel>{{ detailDateLabel }}</SectionLabel>
        <view class="record-detail-hero__row">
          <view class="record-detail-hero__copy">
            <text class="record-detail-hero__title">{{ detailDateTitle }}</text>
            <text class="muted-text">{{ scoreHint }}</text>
          </view>
          <view class="record-detail-hero__score">
            <text class="record-detail-hero__score-value">{{ scoreLabel }}</text>
            <text class="record-detail-hero__score-unit">分</text>
          </view>
        </view>

        <view class="record-detail-hero__facts">
          <view class="record-detail-hero__fact">
            <text class="record-detail-hero__fact-value">{{ detail.completedProofCount }}/{{ detail.totalProofCount }}</text>
            <text class="record-detail-hero__fact-label">证明完成</text>
          </view>
          <view class="record-detail-hero__fact">
            <text class="record-detail-hero__fact-value">{{ detail.reminderActions.length }}</text>
            <text class="record-detail-hero__fact-label">提醒处理</text>
          </view>
          <view class="record-detail-hero__fact">
            <text class="record-detail-hero__fact-value">{{ detail.hasNightReview ? "已写" : "未写" }}</text>
            <text class="record-detail-hero__fact-label">夜间复盘</text>
          </view>
        </view>
      </view>

      <view v-if="hasAnyData" class="record-detail-stack">
        <GlassCard card-class="record-detail-card">
          <SectionLabel>当天主线</SectionLabel>
          <text class="record-detail-card__title">{{ detail.mainQuestTitle }}</text>
          <text class="body-text">{{ detail.mainQuestDescription }}</text>
          <text class="record-detail-card__meta">对齐身份：{{ detail.focusTheme || "尚未定义" }}</text>
        </GlassCard>

        <GlassCard card-class="record-detail-card">
          <SectionLabel>证明动作</SectionLabel>
          <view v-if="detail.completedProofRuleTitles.length" class="record-detail-list">
            <view
              v-for="title in detail.completedProofRuleTitles"
              :key="title"
              class="record-detail-list__item"
            >
              <view class="record-detail-list__dot" />
              <text class="record-detail-list__text">{{ title }}</text>
            </view>
          </view>
          <text v-else class="muted-text">这一天没有留下已完成的证明动作。</text>
        </GlassCard>

        <GlassCard card-class="record-detail-card">
          <SectionLabel>提醒处理</SectionLabel>
          <view v-if="detail.reminderActions.length" class="record-detail-list">
            <view
              v-for="item in detail.reminderActions"
              :key="`${item.reminderId}-${item.actedAt}`"
              class="record-detail-action"
            >
              <text class="record-detail-action__title">{{ reminderActionLabel(item.action) }}</text>
              <text class="record-detail-action__meta">{{ formatDateTime(item.actedAt) }}</text>
            </view>
          </view>
          <text v-else class="muted-text">这一天没有提醒处理记录。</text>
        </GlassCard>

        <GlassCard card-class="record-detail-card">
          <SectionLabel>今日观察</SectionLabel>
          <text class="body-text">{{ detail.todayNote.trim() || "这一天没有留下今日观察。" }}</text>
        </GlassCard>

        <GlassCard card-class="record-detail-card">
          <SectionLabel>夜间复盘</SectionLabel>
          <view v-if="detail.hasNightReview" class="record-detail-review">
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">赢点</text>
              <text class="body-text">{{ detail.winsText || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">偏离点</text>
              <text class="body-text">{{ detail.missesText || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">反思</text>
              <text class="body-text">{{ detail.reflectionText || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">明日修正</text>
              <text class="body-text">{{ detail.tomorrowFixesText || "未填写" }}</text>
            </view>
          </view>
          <text v-else class="muted-text">这一天还没有写夜间复盘。</text>
        </GlassCard>

        <GlassCard v-if="detail.actionLogs.length" card-class="record-detail-card">
          <SectionLabel>动作轨迹</SectionLabel>
          <view class="record-detail-list">
            <view
              v-for="log in detail.actionLogs"
              :key="log.id"
              class="record-detail-action"
            >
              <text class="record-detail-action__title">{{ log.label }}</text>
              <text class="record-detail-action__meta">{{ formatDateTime(log.createdAt) }}</text>
            </view>
          </view>
        </GlassCard>
      </view>

      <GlassCard v-else card-class="record-detail-empty">
        <SectionLabel>暂无快照</SectionLabel>
        <text class="record-detail-empty__title">这一天还没有形成完整记录。</text>
        <text class="muted-text">
          没有证明动作、提醒处理、今日观察或夜间复盘时，这里会保持空态。你仍然可以翻看前后日期，确认系统在哪些天真正运行过。
        </text>
      </GlassCard>
    </view>

    <template #footer>
      <view class="record-detail-footer">
        <button
          class="ghost-button record-detail-footer__button"
          :disabled="!detail.prevDateKey"
          @tap="jumpDate(detail.prevDateKey, true)"
        >
          前一天
        </button>
        <button
          class="ghost-button record-detail-footer__button"
          :disabled="!detail.nextDateKey"
          @tap="jumpDate(detail.nextDateKey, true)"
        >
          后一天
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { parseDateKey } from "@/services/date";
import { ensureOnboardingReady } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderAction } from "@/types/app";

const store = useAppStore();
const currentDateKey = ref(store.state.activeDateKey);

const detail = computed(() => store.getRecordDetail(currentDateKey.value));
const detailDateLabel = computed(() => {
  const date = parseDateKey(detail.value.dateKey);
  return `${date.getFullYear()} / ${date.getMonth() + 1} / ${date.getDate()}`;
});
const detailDateTitle = computed(() => {
  const date = parseDateKey(detail.value.dateKey);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${weekdays[date.getDay()]}`;
});
const scoreLabel = computed(() =>
  detail.value.alignmentScore === null ? "--" : String(detail.value.alignmentScore),
);
const scoreHint = computed(() => {
  if (detail.value.alignmentScore === null) {
    return "这一天没有形成评分，所以会显示为空。";
  }

  if (detail.value.alignmentScore >= 80) {
    return "稳定推进：行动和身份高度对齐。";
  }

  if (detail.value.alignmentScore >= 60) {
    return "基本对齐：主要方向在线，但还有松动。";
  }

  return "偏离：这一天更容易被惯性、分心或拖延带走。";
});
const hasAnyData = computed(
  () =>
    detail.value.alignmentScore !== null ||
    detail.value.completedProofCount > 0 ||
    detail.value.todayNote.trim().length > 0 ||
    detail.value.reminderActions.length > 0 ||
    detail.value.hasNightReview ||
    detail.value.actionLogs.length > 0,
);

function reminderActionLabel(action: ReminderAction) {
  if (action === "complete") {
    return "完成提醒";
  }

  if (action === "snooze") {
    return "稍后提醒";
  }

  return "跳过提醒";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

function resolveDateKey(input?: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(input ?? "") ? (input as string) : store.state.activeDateKey;
}

function jumpDate(dateKey: string | null, replace = false) {
  if (!dateKey) {
    return;
  }

  const url = `/pages/record-detail/index?date=${dateKey}`;
  if (replace) {
    uni.redirectTo({ url });
    return;
  }

  uni.navigateTo({ url });
}

onLoad((query) => {
  currentDateKey.value = resolveDateKey(query?.date ?? query?.dateKey);
});

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }
});
</script>

<style scoped lang="scss">
.record-detail-page,
.record-detail-stack,
.record-detail-review {
  display: flex;
  flex-direction: column;
}

.record-detail-page,
.record-detail-stack {
  gap: 24rpx;
}

.record-detail-hero {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 38rpx 34rpx;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 30rpx;
  background: linear-gradient(145deg, rgba(6, 78, 59, 0.18), rgba(17, 24, 39, 0.08));
}

.record-detail-hero__row {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.record-detail-hero__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12rpx;
}

.record-detail-hero__title,
.record-detail-card__title,
.record-detail-empty__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.4;
}

.record-detail-hero__score {
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
}

.record-detail-hero__score-value {
  color: #d1fae5;
  font-size: 72rpx;
  line-height: 0.94;
  font-weight: 300;
}

.record-detail-hero__score-unit {
  margin-bottom: 8rpx;
  color: #71717a;
  font-size: 24rpx;
}

.record-detail-hero__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.record-detail-hero__fact {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: rgba(10, 10, 11, 0.34);
}

.record-detail-hero__fact-value {
  color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.2;
}

.record-detail-hero__fact-label,
.record-detail-card__meta,
.record-detail-review__label,
.record-detail-action__meta {
  color: #71717a;
  font-size: 20rpx;
  line-height: 1.5;
}

.record-detail-card,
.record-detail-empty {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.record-detail-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.record-detail-list__item,
.record-detail-action {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(10, 10, 11, 0.34);
}

.record-detail-list__dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: #34d399;
  flex-shrink: 0;
}

.record-detail-list__text,
.record-detail-action__title {
  flex: 1;
  color: #d4d4d8;
  font-size: 26rpx;
  line-height: 1.6;
}

.record-detail-review {
  gap: 18rpx;
}

.record-detail-review__block {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.record-detail-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.record-detail-footer__button {
  justify-content: center;
}
</style>
