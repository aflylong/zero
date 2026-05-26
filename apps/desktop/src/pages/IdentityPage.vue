<template>
  <div class="identity-page">
    <PageHeader
      title="身份"
      kicker="IDENTITY"
      description="先决定你是谁,再用每天的动作去验证它。"
    >
      <template #actions>
        <button type="button" class="btn btn-edit btn-sm" @click="openEditor">
          <Pencil :size="14" :stroke-width="iconStroke" />
          <span>编辑身份</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="identity-grid">
        <section class="identity-col identity-col--main">
          <GlassCard>
            <SectionLabel :icon="GitBranch">身份翻转 3 阶段</SectionLabel>
            <p class="muted-text">
              原文 ch6 中段:翻转身份会按
              「失调 → 不确定 → 发现」 三个阶段发生。点击切换你当下的位置。
            </p>
            <div class="identity-stages">
              <button
                v-for="s in stages"
                :key="s.value"
                type="button"
                class="identity-stage"
                :class="{ 'identity-stage--active': stage === s.value }"
                @click="setStage(s.value)"
              >
                <span class="identity-stage__name">{{ s.label }}</span>
                <span class="identity-stage__desc">{{ s.description }}</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard variant="hero">
            <SectionLabel :icon="UserCheck">你是谁</SectionLabel>
            <p class="identity-hero__title">{{ statement }}</p>
            <p class="muted-text">不再回去:{{ antiIdentity }}</p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Repeat">为什么要在第 6 步打断循环</SectionLabel>
            <p class="muted-text">
              原文 ch3-3..11:身份按 8 步循环形成。在「行为变成『我是那种人』」这一步前,
              你还能选;过了之后,你会捍卫这个身份,陷入战或逃。
            </p>
            <ol class="identity-loop">
              <li v-for="(item, idx) in loopSteps" :key="idx" :class="loopClass(idx)">
                <span class="identity-loop__index">{{ idx + 1 }}</span>
                <span class="identity-loop__text">{{ item }}</span>
              </li>
            </ol>
            <p class="faint-text">
              「证明法则」就是你打断这个循环的工具:用每天的真实动作,反向把"那个人"塑造出来。
            </p>
          </GlassCard>

          <GlassCard>
            <div class="identity-section__head">
              <SectionLabel :icon="Sparkles">原则</SectionLabel>
              <span class="faint-text">{{ principles.length }} 条</span>
            </div>
            <p class="muted-text">
              你愿意反复执行的话。原文 K6 把它当作「同心圆」最外层的规则。
            </p>
            <div v-if="principles.length" class="identity-beliefs">
              <div
                v-for="(p, index) in principles"
                :key="`p-${index}`"
                class="identity-belief"
              >
                <span class="identity-belief__dot">
                  <Dot :size="16" :stroke-width="iconStroke" />
                </span>
                <span class="identity-belief__text">{{ p }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="Sparkles"
              title="还没写过原则"
              description="先写一句你愿意反复执行的话,身份才会真正站住。"
            />
          </GlassCard>
        </section>

        <aside class="identity-col identity-col--side">
          <GlassCard>
            <div class="identity-section__head">
              <SectionLabel :icon="CheckCircle2">每日动作</SectionLabel>
              <button type="button" class="btn btn-ghost btn-sm" @click="openEditor">
                <SlidersHorizontal :size="14" :stroke-width="iconStroke" />
                <span>管理</span>
              </button>
            </div>

            <p class="identity-rules__title">{{ ruleSummary }}</p>

            <div v-if="activeRules.length" class="identity-rules">
              <div
                v-for="rule in activeRules"
                :key="rule.id"
                class="identity-rule"
              >
                <span class="identity-rule__title">{{ rule.title }}</span>
                <span v-if="rule.description.trim()" class="identity-rule__desc">
                  {{ rule.description }}
                </span>
                <span
                  v-if="rule.linkedYearGoal || rule.linkedMonthProject"
                  class="identity-rule__link"
                >
                  <span v-if="rule.linkedYearGoal" class="tag-chip">这一年的方向</span>
                  <span v-if="rule.linkedMonthProject" class="tag-chip">Boss 战(这个月目标)</span>
                </span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="ListChecks"
              title="还没有每日动作"
              description="去编辑页加一条今天就能做到的小事。"
            />
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
  CheckCircle2,
  Dot,
  GitBranch,
  ListChecks,
  Pencil,
  Repeat,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
} from "lucide-vue-next";
import { tokens, useAppStore, type IdentityStage } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

const statement = computed(
  () => store.state.data.identityProfile.statement.trim() || "先决定你是谁",
);
const antiIdentity = computed(
  () =>
    store.state.data.identityProfile.antiIdentityText.trim() ||
    "把那个你不愿再扮演的旧版本说清楚。",
);
const principles = computed(() =>
  store.state.data.identityProfile.principles.filter((b) => b.trim()),
);
const activeRules = computed(() => store.activeProofRules());
const stage = computed(() => store.state.data.identityProfile.stage);

const stages: { value: IdentityStage; label: string; description: string }[] = [
  {
    value: "dissonance",
    label: "失调",
    description: "你感觉自己不属于当前生活,对没进展彻底厌倦。",
  },
  {
    value: "uncertainty",
    label: "不确定",
    description: "你还不知道下一步,但已经在实验。",
  },
  {
    value: "discovery",
    label: "发现",
    description: "你清晰到分心不再有分量。",
  },
];

const loopSteps = [
  "你想达成一个目标",
  "你通过那个目标的透镜来感知现实",
  "你只会注意到能帮你达成目标的信息(学习)",
  "你朝目标行动,获得正在接近的反馈",
  "你重复这种行为,直到它自动化(条件作用)",
  "这种行为变成「我是谁」的一部分 ← 在这里打断",
  "你会捍卫你的身份,以维持心理一致性",
  "你的身份塑造新的目标,循环重启",
];

function loopClass(idx: number) {
  return {
    "identity-loop__step--break": idx === 5,
  };
}

const ruleSummary = computed(() => {
  if (!activeRules.value.length) return "还没写下「每日动作」。";
  return `当前生效 ${activeRules.value.length} 条每日动作,它们决定你每天怎么证明这句话。`;
});

function openEditor() {
  router.push("/identity/edit");
}

function setStage(next: IdentityStage) {
  store.setIdentityStage(next);
}
</script>

<style lang="scss" scoped>
.identity-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.identity-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.identity-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.identity-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.identity-stage {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-md);
  background: transparent;
  text-align: left;
  color: var(--si-color-text-faint);
  transition: background 120ms ease, border-color 120ms ease;
}

.identity-stage:hover {
  background: var(--si-color-surface-card-soft);
  color: var(--si-color-text-soft);
}

.identity-stage--active {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);
}

.identity-stage__name {
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.identity-stage__desc {
  font-size: var(--si-font-xs);
  line-height: 1.55;
}

.identity-hero__title {
  margin: 0;
  font-size: var(--si-font-2xl);
  font-weight: 600;
  line-height: 1.3;
  color: var(--si-color-text-main);
  letter-spacing: -0.01em;
}

.identity-loop {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.identity-loop li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  line-height: 1.6;
}

.identity-loop__step--break {
  border: 1px dashed var(--si-color-warning);
  background: rgba(124, 45, 18, 0.18);
  color: var(--si-color-warning);
}

.identity-loop__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--si-color-bg-app-black);
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.identity-loop__text {
  flex: 1;
}

.identity-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.identity-beliefs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.identity-belief {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-inset);
}

.identity-belief__dot {
  display: inline-flex;
  color: var(--si-color-brand);
  margin-top: 2px;
}

.identity-belief__text {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  line-height: 1.6;
}

.identity-rules__title {
  margin: 0;
  color: var(--si-color-text-main);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.identity-rules {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.identity-rule {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-inset);
}

.identity-rule__title {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
}

.identity-rule__desc {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
  line-height: 1.6;
}

.identity-rule__link {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
</style>
