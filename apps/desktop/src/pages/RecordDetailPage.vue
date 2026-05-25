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
            <p class="record-detail__title">{{ detail.yearGoalTitle }}</p>
            <p class="body-text">{{ detail.yearGoalDescription }}</p>
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

          <GlassCard v-if="detail.dayPromptResponses.length">
            <SectionLabel :icon="Sun">白天打断作答</SectionLabel>
            <div class="record-detail-list">
              <div
                v-for="r in detail.dayPromptResponses"
                :key="`${r.promptKey}-${r.answeredAt}`"
                class="record-detail-prompt"
              >
                <span class="record-detail-prompt__key">{{ r.promptKey }}</span>
                <span class="record-detail-prompt__answer">{{ r.answer }}</span>
                <span class="record-detail-prompt__meta">{{ formatTime(r.answeredAt) }}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard v-if="detail.synthesis">
            <SectionLabel :icon="Telescope">夜间综合(N1-N5)</SectionLabel>
            <div class="record-detail-review">
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">N1 卡住的真正原因</span>
                <p class="body-text">{{ detail.synthesis.stuckReason || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">N2 命名敌人</span>
                <p class="body-text">{{ detail.synthesis.enemyName || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">N3 反愿景压缩</span>
                <p class="body-text">{{ detail.synthesis.antiVisionMantra || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">N4 愿景 MVP</span>
                <p class="body-text">{{ detail.synthesis.visionMantra || "未填写" }}</p>
              </div>
              <div class="record-detail-review__block">
                <span class="record-detail-review__label">N5 三透镜</span>
                <p class="body-text">一年:{{ detail.synthesis.yearLens || "—" }}</p>
                <p class="body-text">一月:{{ detail.synthesis.monthLens || "—" }}</p>
                <p
                  v-if="detail.synthesis.tomorrowBlocks.length"
                  class="body-text"
                >
                  明日时间块:
                </p>
                <ul class="record-detail-blocks">
                  <li
                    v-for="b in detail.synthesis.tomorrowBlocks"
                    :key="b.id"
                  >
                    {{ b.title }}<span v-if="b.timeHint"> · {{ b.timeHint }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          <GlassCard v-if="!detail.synthesis">
            <SectionLabel :icon="Moon">夜间综合</SectionLabel>
            <EmptyState :icon="Moon" title="这一天还没写夜间综合" />
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
  Sun,
  Target,
  Telescope,
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

.record-detail-prompt {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  font-size: var(--si-font-sm);
  color: var(--si-color-text-soft);
  line-height: 1.55;
}

.record-detail-prompt__key {
  color: var(--si-color-brand-text);
  font-size: var(--si-font-xs);
  font-weight: var(--si-weight-semibold);
}

.record-detail-prompt__answer {
  color: var(--si-color-text-soft);
}

.record-detail-prompt__meta {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.record-detail-blocks {
  margin: 6px 0 0;
  padding-left: 18px;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  line-height: 1.6;
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
