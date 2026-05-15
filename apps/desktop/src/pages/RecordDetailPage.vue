<template>
  <div class="record-detail-page">
    <PageHeader
      :title="detailTitle"
      kicker="RECORD"
      :description="detailDateLabel"
      back
      back-to="/records"
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="!detail.prevDateKey"
          @click="jump(detail.prevDateKey)"
        >
          <ChevronLeft :size="14" :stroke-width="iconStroke" />
          <span>前一天</span>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="!detail.nextDateKey"
          @click="jump(detail.nextDateKey)"
        >
          <span>后一天</span>
          <ChevronRight :size="14" :stroke-width="iconStroke" />
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div v-if="hasAnyData" class="record-detail-grid">
        <section class="record-detail-col record-detail-col--main">
          <GlassCard variant="hero">
            <SectionLabel :icon="Target">当天主线</SectionLabel>
            <p class="record-detail__title">{{ detail.mainQuestTitle }}</p>
            <p class="body-text">{{ detail.mainQuestDescription }}</p>
            <p class="muted-text">
              对齐身份:{{ detail.focusTheme || "尚未定义" }}
            </p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="CheckCircle2">证明动作</SectionLabel>
            <div
              v-if="detail.completedProofRuleTitles.length"
              class="record-detail-list"
            >
              <div
                v-for="title in detail.completedProofRuleTitles"
                :key="title"
                class="record-detail-item"
              >
                <Check :size="14" :stroke-width="2" class="record-detail-item__icon" />
                <span>{{ title }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="CheckCircle2"
              title="这一天没有完成的证明"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Bell">提醒处理</SectionLabel>
            <div
              v-if="detail.reminderActions.length"
              class="record-detail-list"
            >
              <div
                v-for="item in detail.reminderActions"
                :key="`${item.reminderId}-${item.actedAt}`"
                class="record-detail-action"
              >
                <span class="record-detail-action__title">
                  {{ reminderLabel(item.action) }}
                </span>
                <span class="record-detail-action__meta">{{ formatTime(item.actedAt) }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="Bell"
              title="这一天没有提醒处理记录"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="NotebookPen">今日观察</SectionLabel>
            <p class="body-text">
              {{ detail.todayNote.trim() || "这一天没有留下今日观察。" }}
            </p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Moon">夜间复盘</SectionLabel>
            <div v-if="detail.hasNightReview" class="record-detail-review">
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">赢点</span>
                <p class="body-text">{{ detail.winsText || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">偏离点</span>
                <p class="body-text">{{ detail.missesText || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">反思</span>
                <p class="body-text">{{ detail.reflectionText || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">明日修正</span>
                <p class="body-text">{{ detail.tomorrowFixesText || "未填写" }}</p>
              </div>
            </div>
            <EmptyState v-else :icon="Moon" title="这一天还没写夜间复盘" />
          </GlassCard>

          <GlassCard v-if="detail.actionLogs.length">
            <SectionLabel :icon="Activity">动作轨迹</SectionLabel>
            <div class="record-detail-list">
              <div
                v-for="log in detail.actionLogs"
                :key="log.id"
                class="record-detail-action"
              >
                <span class="record-detail-action__title">{{ log.label }}</span>
                <span class="record-detail-action__meta">{{ formatTime(log.createdAt) }}</span>
              </div>
            </div>
          </GlassCard>
        </section>

        <aside class="record-detail-col record-detail-col--side">
          <GlassCard>
            <SectionLabel :icon="Gauge">系统分数</SectionLabel>
            <div class="record-detail__score">
              <span class="record-detail__score-value">{{ scoreLabel }}</span>
              <span class="record-detail__score-unit">分</span>
            </div>
            <p class="muted-text">{{ scoreHint }}</p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="CheckCircle2">完成统计</SectionLabel>
            <div class="record-detail__stats">
              <div class="record-detail__stat">
                <span class="record-detail__stat-value">
                  {{ detail.completedProofCount }}/{{ detail.totalProofCount }}
                </span>
                <span class="record-detail__stat-label">证明完成</span>
              </div>
              <div class="record-detail__stat">
                <span class="record-detail__stat-value">{{ detail.reminderActions.length }}</span>
                <span class="record-detail__stat-label">提醒处理</span>
              </div>
              <div class="record-detail__stat">
                <span class="record-detail__stat-value">
                  {{ detail.hasNightReview ? "已写" : "未写" }}
                </span>
                <span class="record-detail__stat-label">夜间复盘</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="LineChart">最近 14 天趋势</SectionLabel>
            <TrendChart :days="surroundingDays" :height="130" />
          </GlassCard>
        </aside>
      </div>

      <EmptyState
        v-else
        :icon="CalendarX"
        title="这一天没有形成完整记录"
        description="没有证明动作、提醒处理、今日观察或夜间复盘时,这里会保持空态。"
      />
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Activity,
  Bell,
  CalendarX,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LineChart,
  Moon,
  NotebookPen,
  Target,
} from "lucide-vue-next";
import {
  parseDateKey,
  tokens,
  useAppStore,
  type ReminderAction,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import TrendChart from "@/components/records/TrendChart.vue";

const iconStroke = tokens.iconStrokeWidth;
const route = useRoute();
const router = useRouter();
const store = useAppStore();

const dateKey = computed(() => {
  const param = Array.isArray(route.params.dateKey)
    ? route.params.dateKey[0]
    : route.params.dateKey;
  return /^\d{4}-\d{2}-\d{2}$/.test(param ?? "") ? (param as string) : store.state.activeDateKey;
});

const detail = computed(() => store.getRecordDetail(dateKey.value));

const detailDateLabel = computed(() => {
  const d = parseDateKey(detail.value.dateKey);
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
});

const detailTitle = computed(() => {
  const d = parseDateKey(detail.value.dateKey);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${weekdays[d.getDay()]}`;
});

const scoreLabel = computed(() =>
  detail.value.alignmentScore === null ? "--" : String(detail.value.alignmentScore),
);

const scoreHint = computed(() => {
  if (detail.value.alignmentScore === null) return "这一天没有形成评分。";
  if (detail.value.alignmentScore >= 80) return "稳定推进:行动和身份高度对齐。";
  if (detail.value.alignmentScore >= 60) return "基本对齐:主要方向在线。";
  return "偏离:这一天更容易被惯性、分心或拖延带走。";
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

const surroundingDays = computed(() =>
  store.getRecordDays({ endDateKey: dateKey.value, spanDays: 14 }),
);

function reminderLabel(action: ReminderAction) {
  if (action === "complete") return "完成提醒";
  if (action === "snooze") return "稍后提醒";
  return "跳过提醒";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

function jump(next: string | null) {
  if (!next) return;
  router.replace({ name: "record-detail", params: { dateKey: next } });
}
</script>

<style lang="scss" scoped>
.record-detail-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.record-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.record-detail-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.record-detail__title {
  margin: 0;
  font-size: var(--si-font-xl);
  line-height: 1.35;
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
}

.record-detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-detail-item,
.record-detail-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  line-height: 1.5;
}

.record-detail-action {
  justify-content: space-between;
}

.record-detail-item__icon {
  color: var(--si-color-brand);
}

.record-detail-action__meta {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.record-detail-review {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.record-detail-review__block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-detail-review__label {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.record-detail__score {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.record-detail__score-value {
  font-size: var(--si-font-4xl);
  font-weight: 300;
  line-height: 1;
  color: var(--si-color-brand-text);
  letter-spacing: -0.02em;
}

.record-detail__score-unit {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-md);
}

.record-detail__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.record-detail__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
}

.record-detail__stat-value {
  color: var(--si-color-text-main);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
  line-height: 1;
}

.record-detail__stat-label {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}
</style>
