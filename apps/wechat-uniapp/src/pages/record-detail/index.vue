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
            <text class="record-detail-hero__fact-label">夜间综合</text>
          </view>
        </view>
      </view>

      <view v-if="hasAnyData" class="record-detail-stack">
        <GlassCard card-class="record-detail-card">
          <SectionLabel>当天主线</SectionLabel>
          <text class="record-detail-card__title">{{ detail.yearGoalTitle || "尚未定义" }}</text>
          <text class="body-text">{{ detail.yearGoalDescription }}</text>
          <text class="record-detail-card__meta">对齐身份:{{ detail.focusTheme || "尚未定义" }}</text>
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

        <GlassCard v-if="detail.dayPromptResponses.length" card-class="record-detail-card">
          <SectionLabel>白天打断作答</SectionLabel>
          <view class="record-detail-list">
            <view
              v-for="r in detail.dayPromptResponses"
              :key="`${r.promptKey}-${r.answeredAt}`"
              class="record-detail-prompt"
            >
              <text class="record-detail-prompt__key">{{ r.promptKey }}</text>
              <text class="record-detail-prompt__answer">{{ r.answer }}</text>
              <text class="record-detail-prompt__meta">{{ formatDateTime(r.answeredAt) }}</text>
            </view>
          </view>
        </GlassCard>

        <GlassCard v-if="detail.synthesis" card-class="record-detail-card">
          <SectionLabel>夜间综合(N1-N5)</SectionLabel>
          <view class="record-detail-review">
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">N1 卡住的真正原因</text>
              <text class="body-text">{{ detail.synthesis.stuckReason || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">N2 命名敌人</text>
              <text class="body-text">{{ detail.synthesis.enemyName || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">N3 反愿景压缩</text>
              <text class="body-text">{{ detail.synthesis.antiVisionMantra || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">N4 愿景 MVP</text>
              <text class="body-text">{{ detail.synthesis.visionMantra || "未填写" }}</text>
            </view>
            <view class="record-detail-review__block">
              <text class="record-detail-review__label">N5 三透镜</text>
              <text class="body-text">一年:{{ detail.synthesis.yearLens || "—" }}</text>
              <text class="body-text">一月:{{ detail.synthesis.monthLens || "—" }}</text>
              <text v-if="detail.synthesis.tomorrowBlocks.length" class="body-text">明日时间块:</text>
              <view
                v-for="b in detail.synthesis.tomorrowBlocks"
                :key="b.id"
                class="record-detail-block"
              >
                <text class="record-detail-block__title">· {{ b.title }}</text>
                <text v-if="b.timeHint" class="record-detail-block__hint">{{ b.timeHint }}</text>
              </view>
            </view>
          </view>
        </GlassCard>
        <GlassCard v-else card-class="record-detail-card">
          <SectionLabel>夜间综合</SectionLabel>
          <text class="muted-text">这一天还没写夜间综合。</text>
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
          没有证明动作、提醒处理、今日观察或夜间综合时,这里会保持空态。
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
  if (detail.value.alignmentScore === null) return "这一天没有形成评分。";
  if (detail.value.alignmentScore >= 70) return "稳定推进:留下了多种推进证据。";
  if (detail.value.alignmentScore >= 40) return "在线:有真实动作,还能再压实。";
  if (detail.value.alignmentScore > 0) return "微弱推进:留下了证据,但还很轻。";
  return "这一天没有留下推进证据。";
});
const hasAnyData = computed(
  () =>
    detail.value.alignmentScore !== null ||
    detail.value.completedProofCount > 0 ||
    detail.value.todayNote.trim().length > 0 ||
    detail.value.reminderActions.length > 0 ||
    Boolean(detail.value.synthesis) ||
    detail.value.dayPromptResponses.length > 0 ||
    detail.value.actionLogs.length > 0,
);

function reminderActionLabel(action: ReminderAction) {
  if (action === "complete") return "完成提醒";
  if (action === "snooze") return "稍后提醒";
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
  if (!dateKey) return;
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
  font-size: 32rpx;
  line-height: 1.4;
}

.record-detail-hero__score {
  display: flex;
  gap: 8rpx;
  align-items: flex-end;
}

.record-detail-hero__score-value {
  color: #d1fae5;
  font-size: 64rpx;
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
  padding: 18rpx;
  border-radius: 18rpx;
  background: rgba(10, 10, 11, 0.34);
}

.record-detail-hero__fact-value {
  color: #f5f5f5;
  font-size: 24rpx;
  line-height: 1.2;
}

.record-detail-hero__fact-label,
.record-detail-card__meta,
.record-detail-review__label,
.record-detail-action__meta,
.record-detail-prompt__meta {
  color: #71717a;
  font-size: 20rpx;
}

.record-detail-card,
.record-detail-empty {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-detail-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-detail-list__item,
.record-detail-action {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
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
.record-detail-action__title,
.record-detail-prompt__answer {
  flex: 1;
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.55;
}

.record-detail-prompt {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: rgba(10, 10, 11, 0.34);
}
.record-detail-prompt__key {
  color: #d1fae5;
  font-size: 20rpx;
  font-weight: 600;
}

.record-detail-review {
  gap: 16rpx;
}

.record-detail-review__block {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-detail-block {
  display: flex;
  gap: 8rpx;
  flex-direction: column;
  padding-left: 12rpx;
}
.record-detail-block__title {
  color: #d4d4d8;
  font-size: 22rpx;
}
.record-detail-block__hint {
  color: #71717a;
  font-size: 20rpx;
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
