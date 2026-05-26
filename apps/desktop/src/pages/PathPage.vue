<template>
  <div class="path-page">
    <PageHeader
      title="道路"
      kicker="PATH"
      description="愿景把你拉向前,反愿景在你松懈时把你拽回来。"
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-success': showRings }"
          @click="showRings = !showRings"
        >
          <Layers :size="14" :stroke-width="iconStroke" />
          <span>{{ showRings ? "隐藏同心圆" : "看同心圆" }}</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" @click="openArticle">
          <BookOpenText :size="14" :stroke-width="iconStroke" />
          <span>读原文</span>
        </button>
        <button type="button" class="btn btn-edit btn-sm" @click="openEditor">
          <Pencil :size="14" :stroke-width="iconStroke" />
          <span>编辑道路</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="path-grid">
        <section class="path-col path-col--main">
          <GlassCard variant="hero">
            <SectionLabel :icon="Compass">愿景</SectionLabel>
            <p class="path-hero__body">{{ visionText }}</p>
            <p v-if="threeYearTuesday" class="muted-text">
              三年后周二:{{ threeYearTuesday }}
            </p>
            <p v-if="oneThingThisWeek" class="faint-text">
              这周一件事:{{ oneThingThisWeek }}
            </p>
          </GlassCard>

          <div class="path-row">
            <GlassCard>
              <SectionLabel :icon="AlertTriangle">反愿景</SectionLabel>
              <p class="path-body">{{ antiVisionText }}</p>
              <details v-if="hasAntiNarrative" class="path-details">
                <summary>展开三段叙事(5 / 10 / 尽头)</summary>
                <div class="path-narrative">
                  <p v-if="fiveYearTuesday">
                    <strong>5 年:</strong>{{ fiveYearTuesday }}
                  </p>
                  <p v-if="tenYearTuesday">
                    <strong>10 年:</strong>{{ tenYearTuesday }}
                  </p>
                  <p v-if="endOfLife">
                    <strong>尽头:</strong>{{ endOfLife }}
                  </p>
                </div>
              </details>
            </GlassCard>

            <GlassCard>
              <SectionLabel :icon="Crosshair">最近一次「看清是什么挡住了你」</SectionLabel>
              <p class="path-body">{{ enemyNameDisplay }}</p>
              <p class="faint-text">
                来自最近一次「晚上回顾」(N2)。每天复盘时它会自动更新。
              </p>
            </GlassCard>
          </div>

          <GlassCard variant="hero">
            <div class="path-section__head">
              <SectionLabel :icon="Target">一年方向</SectionLabel>
              <span v-if="yearGoal" class="tag-chip">这是你的方向</span>
            </div>
            <p class="path-quest__title">{{ yearGoal }}</p>
            <p class="body-text">{{ yearGoalDescription }}</p>
          </GlassCard>

          <GlassCard>
            <div class="path-section__head">
              <SectionLabel :icon="Swords">Boss 战(这个月目标)</SectionLabel>
              <span v-if="monthDeadline" class="tag-chip tag-chip--active">
                <CalendarDays :size="12" :stroke-width="2" />
                <span>{{ monthDeadline }}</span>
              </span>
            </div>
            <p class="path-section__title">{{ monthProject }}</p>
            <p class="body-text">{{ monthProjectDescription }}</p>
            <div v-if="bossXp.total > 0" class="path-boss-xp">
              <span class="path-boss-xp__label">XP</span>
              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{ width: `${bossXp.percent}%` }"
                />
              </div>
              <span class="path-boss-xp__value">
                {{ bossXp.done }} / {{ bossXp.total }} 战利品
              </span>
            </div>
            <p class="faint-text">
              一月项目是这个月要攻克的具体里程碑,服务于一年目标。
            </p>
          </GlassCard>

          <GlassCard>
            <div class="path-section__head">
              <SectionLabel :icon="Shield">约束 · 不能碰的红线</SectionLabel>
              <span class="faint-text">{{ constraints.length }} 条</span>
            </div>
            <div v-if="constraints.length" class="path-constraints">
              <div
                v-for="(item, idx) in constraints"
                :key="`constraint-${idx}`"
                class="path-constraint"
              >
                <ShieldCheck :size="14" :stroke-width="iconStroke" />
                <span>{{ item }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="Shield"
              title="还没设过约束"
              description="约束是你为了实现愿景,绝不愿意牺牲的东西。比如睡眠、家人、健康。它们是护栏,不是限制。"
            />
          </GlassCard>
        </section>

        <aside class="path-col path-col--side">
          <GlassCard v-if="showRings">
            <SectionLabel :icon="Layers">六组件同心圆</SectionLabel>
            <ConcentricRings />
            <p class="faint-text">
              原文 ch7-20:这些组件像一组同心圆 / 力场,把你的心智从分心里守护住。
            </p>
          </GlassCard>

          <button type="button" class="path-article" @click="openArticle">
            <div class="path-article__copy">
              <SectionLabel :icon="BookOpenText">方法原文</SectionLabel>
              <p class="path-article__title">{{ articleTitle }}</p>
              <p class="muted-text">
                已读 {{ articleProgress.completed }} / {{ articleProgress.total }} 章
              </p>
            </div>
            <ChevronRight :size="18" :stroke-width="iconStroke" />
          </button>

          <QuoteTicker kind="morning" />
        </aside>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Compass,
  Crosshair,
  Layers,
  Pencil,
  Shield,
  ShieldCheck,
  Swords,
  Target,
} from "lucide-vue-next";
import { articleSections, articleTitle, parseDateKey, tokens, useAppStore } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import QuoteTicker from "@/components/common/QuoteTicker.vue";
import ConcentricRings from "@/components/common/ConcentricRings.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const store = useAppStore();

const showRings = ref(false);

const visionText = computed(
  () =>
    store.state.data.visionProfile.visionText.trim() ||
    "把你想去的生活画面写清楚。这里是整个系统的远方。",
);
const antiVisionText = computed(
  () =>
    store.state.data.visionProfile.antiVisionText.trim() ||
    "把你不愿回去的生活说清楚。它会在你松懈时把你拽回来。",
);
const fiveYearTuesday = computed(
  () => store.state.data.visionProfile.fiveYearTuesday.trim(),
);
const tenYearTuesday = computed(
  () => store.state.data.visionProfile.tenYearTuesday.trim(),
);
const endOfLife = computed(
  () => store.state.data.visionProfile.endOfLife.trim(),
);
const threeYearTuesday = computed(
  () => store.state.data.visionProfile.threeYearTuesday.trim(),
);
const oneThingThisWeek = computed(
  () => store.state.data.visionProfile.oneThingThisWeek.trim(),
);
const hasAntiNarrative = computed(
  () =>
    Boolean(
      fiveYearTuesday.value || tenYearTuesday.value || endOfLife.value,
    ),
);

const yearGoal = computed(
  () =>
    store.state.data.visionProfile.yearGoal.trim() ||
    "先定下这一年要走到哪。",
);
const yearGoalDescription = computed(
  () =>
    store.state.data.visionProfile.yearGoalDescription.trim() ||
    "一年后你必须看到什么变化,才算真的打破了旧模式?",
);
const monthProject = computed(
  () =>
    store.state.data.visionProfile.monthProject.trim() ||
    "这个月要攻克的具体里程碑是什么?",
);
const monthProjectDescription = computed(
  () =>
    store.state.data.visionProfile.monthProjectDescription.trim() ||
    "想清楚:做完这件事,一年目标是不是更近了一步?",
);
const monthDeadline = computed(() => {
  const raw = store.state.data.visionProfile.monthProjectDeadline;
  if (!raw) return "";
  try {
    const d = parseDateKey(raw);
    return `截止 ${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "";
  }
});
const constraints = computed(() =>
  store.state.data.visionProfile.constraints.filter((c) => c.trim()),
);

// Boss 战进度:用过去 30 天里"完成 60% 以上每日动作"的天数作为参考
const bossXp = computed(() => {
  const days = store.getRecordDays({
    endDateKey: store.state.activeDateKey,
    spanDays: 30,
  });
  const total = 30;
  const done = days.filter(
    (d) => (d.alignmentScore ?? 0) > 0 && d.completedProofCount > 0,
  ).length;
  const percent = Math.min(100, Math.round((done / total) * 100));
  return { total, done, percent };
});

// 最近一次"看清是什么挡住了你"
const enemyNameDisplay = computed(() => {
  const map = store.state.data.nightSynthesisByDate ?? {};
  const keys = Object.keys(map).sort();
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    const ns = map[keys[i]];
    if (ns?.enemyName?.trim()) return ns.enemyName.trim();
  }
  return "还没写下来过。今晚做「晚上回顾」时把它写在 N2 那一格里就行。";
});

const articleProgress = computed(() => ({
  completed: store.state.data.articleProgress.completedSectionIds.length,
  total: articleSections.length,
}));

function openEditor() {
  router.push("/path/edit");
}
function openArticle() {
  router.push("/path/article");
}
</script>

<style lang="scss" scoped>
.path-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.path-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.path-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.path-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.path-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.path-hero__body {
  margin: 0;
  font-size: var(--si-font-2xl);
  line-height: 1.45;
  color: var(--si-color-text-main);
  letter-spacing: -0.01em;
  white-space: pre-line;
}

.path-body {
  margin: 0;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  line-height: 1.72;
  white-space: pre-line;
}

.path-quest__title {
  margin: 0;
  font-size: var(--si-font-xl);
  line-height: 1.35;
  color: var(--si-color-brand-text);
  font-weight: var(--si-weight-semibold);
}

.path-section__title {
  margin: 0;
  font-size: var(--si-font-lg);
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
}

.path-details {
  margin-top: 8px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
}

.path-details summary {
  cursor: pointer;
  margin-bottom: 6px;
}

.path-narrative {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-soft);
  line-height: 1.65;
}

.path-narrative p {
  margin: 0;
}

.path-boss-xp {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
}

.path-boss-xp__label,
.path-boss-xp__value {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.path-constraints {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-constraint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);

  :deep(svg) {
    color: var(--si-color-info);
    flex-shrink: 0;
  }
}

.path-article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-2xl);
  background: var(--si-color-surface-card-soft);
  color: var(--si-color-text-soft);
  text-align: left;
  transition: border-color 140ms ease, background 140ms ease;

  &:hover {
    border-color: rgba(113, 113, 122, 0.6);
    background: var(--si-color-surface-card);
    color: var(--si-color-text-main);
  }
}

.path-article__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.path-article__title {
  margin: 0;
  font-size: var(--si-font-lg);
  line-height: 1.35;
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
}
</style>
