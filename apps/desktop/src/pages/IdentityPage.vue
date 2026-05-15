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
          <GlassCard variant="hero">
            <SectionLabel :icon="UserCheck">你是谁</SectionLabel>
            <p class="identity-hero__title">{{ statement }}</p>
            <p class="muted-text">不再回去:{{ antiIdentity }}</p>
          </GlassCard>

          <GlassCard>
            <div class="identity-section__head">
              <SectionLabel :icon="Sparkles">核心信念</SectionLabel>
              <span class="faint-text">{{ beliefs.length }} 条</span>
            </div>
            <div v-if="beliefs.length" class="identity-beliefs">
              <div
                v-for="(belief, index) in beliefs"
                :key="`belief-${index}`"
                class="identity-belief"
              >
                <span class="identity-belief__dot">
                  <Dot :size="16" :stroke-width="iconStroke" />
                </span>
                <span class="identity-belief__text">{{ belief }}</span>
              </div>
            </div>
            <EmptyState
              v-else
              :icon="Sparkles"
              title="还没写过核心信念"
              description="先写一句你愿意反复执行的信念,身份才会真正站住。"
            />
          </GlassCard>
        </section>

        <aside class="identity-col identity-col--side">
          <GlassCard>
            <div class="identity-section__head">
              <SectionLabel :icon="CheckCircle2">证明法则</SectionLabel>
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
              </div>
            </div>
            <EmptyState
              v-else
              :icon="ListChecks"
              title="还没有生效的法则"
              description="去编辑页加一条今天就能做到的真实动作。"
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
  ListChecks,
  Pencil,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
} from "lucide-vue-next";
import { tokens, useAppStore } from "@guiling/core";
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
const beliefs = computed(() =>
  store.state.data.identityProfile.beliefs.filter((b) => b.trim()),
);
const activeRules = computed(() => store.activeProofRules());

const ruleSummary = computed(() => {
  if (!activeRules.value.length) return "还没有可验证的身份动作。";
  return `当前生效 ${activeRules.value.length} 条法则,它们决定你每天怎么证明这句话。`;
});

function openEditor() {
  router.push("/identity/edit");
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

.identity-hero__title {
  margin: 0;
  font-size: var(--si-font-2xl);
  font-weight: 600;
  line-height: 1.3;
  color: var(--si-color-text-main);
  letter-spacing: -0.01em;
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
</style>
