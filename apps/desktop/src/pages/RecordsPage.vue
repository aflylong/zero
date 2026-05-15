<template>
  <div class="records-page">
    <PageHeader
      title="记录"
      kicker="RECORDS"
      description="连续天数和轨迹。点击任一格查看那一天的完整快照。"
    />

    <PageBody>
      <div class="records-grid">
        <section class="records-col records-col--main">
          <GlassCard>
            <div class="records-window">
              <button
                type="button"
                class="btn btn-ghost btn-sm btn-icon"
                :disabled="!recordWindow.hasPrevWindow"
                @click="shift(-35)"
              >
                <ChevronLeft :size="14" :stroke-width="iconStroke" />
              </button>
              <div class="records-window__center">
                <SectionLabel :icon="CalendarDays">35 天窗口</SectionLabel>
                <span class="records-window__range">{{ rangeLabel }}</span>
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-sm btn-icon"
                :disabled="!recordWindow.hasNextWindow"
                @click="shift(35)"
              >
                <ChevronRight :size="14" :stroke-width="iconStroke" />
              </button>
            </div>

            <HeatmapGrid
              :days="recordWindow.days"
              :active-date-key="activeHeatmapDate"
              @select="openDetail"
            />

            <div class="records-legend">
              <span class="records-legend__item">
                <span class="records-legend__swatch records-legend__swatch--aligned" />
                稳定推进
              </span>
              <span class="records-legend__item">
                <span class="records-legend__swatch records-legend__swatch--off" />
                偏离
              </span>
              <span class="records-legend__item">
                <span class="records-legend__dot" />
                已写夜间复盘
              </span>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="LineChart">对齐分数趋势</SectionLabel>
            <TrendChart :days="recordWindow.days" />
          </GlassCard>

          <div class="records-split">
            <GlassCard>
              <SectionLabel :icon="BarChart3">最近 7 天完成条数</SectionLabel>
              <CompletionBars :days="last7Days" :denominator="activeProofCount" />
            </GlassCard>

            <GlassCard>
              <SectionLabel :icon="TrendingUp">趋势摘要</SectionLabel>
              <p class="section-title">{{ trendHeadline }}</p>
              <p class="muted-text">{{ trendBody }}</p>
            </GlassCard>
          </div>
        </section>

        <aside class="records-col records-col--side">
          <GlassCard variant="hero">
            <SectionLabel :icon="Flame">连续推进</SectionLabel>
            <div class="records-streak">
              <span class="records-streak__value">{{ overallSummary.currentStreak }}</span>
              <span class="records-streak__unit">天</span>
            </div>
            <p class="muted-text">{{ streakCopy }}</p>
            <QuoteTicker :kind="overallSummary.currentStreak > 0 ? 'streak' : 'setback'" />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Activity">统计</SectionLabel>
            <div class="records-stats">
              <div class="records-stat">
                <span class="records-stat__value">{{ windowSummary.averageAlignment }}%</span>
                <span class="records-stat__label">平均对齐</span>
              </div>
              <div class="records-stat">
                <span class="records-stat__value">
                  {{ windowSummary.completedDays }}/{{ windowSummary.trackedDays }}
                </span>
                <span class="records-stat__label">对齐天数</span>
              </div>
              <div class="records-stat">
                <span class="records-stat__value">{{ overallSummary.bestStreak }}</span>
                <span class="records-stat__label">最佳连续</span>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  LineChart,
  TrendingUp,
} from "lucide-vue-next";
import { parseDateKey, tokens, useAppStore } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import HeatmapGrid from "@/components/records/HeatmapGrid.vue";
import TrendChart from "@/components/records/TrendChart.vue";
import CompletionBars from "@/components/records/CompletionBars.vue";
import QuoteTicker from "@/components/common/QuoteTicker.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

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

const last7Days = computed(() =>
  store.getRecordDays({ endDateKey: todayDateKey.value, spanDays: 7 }),
);

const activeProofCount = computed(() => Math.max(1, store.activeProofRules().length));

function fmt(d: string) {
  const date = parseDateKey(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
const rangeLabel = computed(
  () => `${fmt(recordWindow.value.startDateKey)} - ${fmt(recordWindow.value.endDateKey)}`,
);

const trendHeadline = computed(() => {
  if (!windowSummary.value.trackedDays) return "这个窗口里还没留下记录。";
  if (windowSummary.value.averageAlignment >= 80) return "这段时间整体推进很稳。";
  if (windowSummary.value.averageAlignment >= 60) return "整体在线,还有些松动。";
  return "这段时间偏离明显,需要更主动地纠偏。";
});

const trendBody = computed(() => {
  if (!windowSummary.value.trackedDays) {
    return "开始用今日页、提醒和夜间复盘后,这里会长出可翻看的真实轨迹。";
  }
  return `当前窗口记录了 ${windowSummary.value.trackedDays} 天,其中 ${windowSummary.value.completedDays} 天达到 60 分以上。`;
});

const streakCopy = computed(() => {
  if (overallSummary.value.currentStreak > 0) {
    return "你正在累积连续性。这是身份最可靠的证据。";
  }
  if (overallSummary.value.trackedDays > 0) {
    return "轨迹还在,只是断了一下。今天重新接上。";
  }
  return "今天留下第一条快照,系统就开始发力了。";
});

function shift(offset: number) {
  store.shiftRecordWindow(offset);
}

function openDetail(dateKey: string) {
  router.push({ name: "record-detail", params: { dateKey } });
}
</script>

<style lang="scss" scoped>
.records-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.records-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.records-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.records-split {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.records-window {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.records-window__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.records-window__range {
  color: var(--si-color-text-main);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-medium);
}

.records-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.records-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.records-legend__swatch {
  width: 12px;
  height: 12px;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 4px;
  background: var(--si-color-surface-card);
}

.records-legend__swatch--aligned {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg);
}

.records-legend__swatch--off {
  border-color: rgba(82, 82, 91, 0.72);
  background: rgba(39, 39, 42, 0.85);
}

.records-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--si-color-brand);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
}

.records-streak {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.records-streak__value {
  font-size: var(--si-font-4xl);
  font-weight: 300;
  line-height: 1;
  color: var(--si-color-brand-text);
  letter-spacing: -0.02em;
}

.records-streak__unit {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-md);
}

.records-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.records-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
}

.records-stat__value {
  color: var(--si-color-text-main);
  font-size: var(--si-font-lg);
  font-weight: var(--si-weight-semibold);
  line-height: 1;
}

.records-stat__label {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}
</style>
