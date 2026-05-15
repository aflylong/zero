<template>
  <div class="path-page">
    <PageHeader
      title="道路"
      kicker="PATH"
      description="愿景把你拉向前,反愿景在你松懈时把你拽回来。这里是你这一年要走的路。"
    >
      <template #actions>
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
          </GlassCard>

          <div class="path-row">
            <GlassCard>
              <SectionLabel :icon="AlertTriangle">反愿景</SectionLabel>
              <p class="path-body">{{ antiVisionText }}</p>
            </GlassCard>

            <GlassCard>
              <SectionLabel :icon="Flame">非改不可的理由</SectionLabel>
              <p class="path-body">{{ whyChangeText }}</p>
            </GlassCard>
          </div>

          <GlassCard variant="hero">
            <div class="path-section__head">
              <SectionLabel :icon="Target">一年目标 · 主线任务</SectionLabel>
              <span v-if="yearGoal" class="tag-chip">这是你的方向</span>
            </div>
            <p class="path-quest__title">{{ yearGoal }}</p>
            <p class="body-text">{{ yearGoalDescription }}</p>
          </GlassCard>

          <GlassCard>
            <div class="path-section__head">
              <SectionLabel :icon="Swords">一月项目 · Boss 战</SectionLabel>
              <span v-if="monthDeadline" class="tag-chip tag-chip--active">
                <CalendarDays :size="12" :stroke-width="2" />
                <span>{{ monthDeadline }}</span>
              </span>
            </div>
            <p class="path-section__title">{{ monthProject }}</p>
            <p class="body-text">{{ monthProjectDescription }}</p>
            <p class="faint-text">
              一月项目是你这个月要攻克的具体里程碑。它必须服务于一年目标。
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
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Compass,
  Flame,
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

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const store = useAppStore();

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
const whyChangeText = computed(
  () =>
    store.state.data.visionProfile.whyChangeText.trim() ||
    "写下你必须改变的真实理由,不是情绪化的口号。",
);
const yearGoal = computed(
  () =>
    store.state.data.visionProfile.yearGoal.trim() ||
    store.state.data.visionProfile.mainQuestTitle.trim() ||
    "先定下这一年要走到哪。",
);
const yearGoalDescription = computed(
  () =>
    store.state.data.visionProfile.yearGoalDescription.trim() ||
    store.state.data.visionProfile.mainQuestDescription.trim() ||
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
}

.path-body {
  margin: 0;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  line-height: 1.72;
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
