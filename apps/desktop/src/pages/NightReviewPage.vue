<template>
  <div class="night-page">
    <PageHeader
      title="夜间复盘"
      kicker="NIGHT REVIEW"
      :description="reviewSubtitle"
      back
      back-to="/today"
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="!canSave"
          @click="finalize"
        >
          <Save :size="14" :stroke-width="iconStroke" />
          <span>保存复盘</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="night-grid">
        <div class="night-col night-col--main">
          <GlassCard>
            <SectionLabel :icon="Gauge">主观对齐分数</SectionLabel>
            <div class="night-score-row">
              <div class="night-score">
                <span class="night-score__value">{{ form.alignmentScore }}</span>
                <span class="night-score__unit">/ 100</span>
              </div>
              <p class="muted-text">{{ scoreHint }}</p>
            </div>
            <input
              v-model.number="form.alignmentScore"
              type="range"
              min="0"
              max="100"
              step="5"
              class="night-slider"
              @input="dirty = true"
            />
            <div class="night-score__marks">
              <span>惯性</span>
              <span>纠偏</span>
              <span>对齐</span>
              <span>推进</span>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="ThumbsUp">赢点</SectionLabel>
            <textarea
              v-model="form.winsText"
              class="form-textarea night-textarea"
              maxlength="500"
              placeholder="今天哪几个动作最像你想成为的那个人?"
              @input="dirty = true"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="AlertTriangle">偏离点</SectionLabel>
            <textarea
              v-model="form.missesText"
              class="form-textarea night-textarea"
              maxlength="500"
              placeholder="哪些时刻被惯性、分心或逃避带偏了?"
              @input="dirty = true"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Brain">反思</SectionLabel>
            <textarea
              v-model="form.reflectionText"
              class="form-textarea night-textarea"
              maxlength="500"
              placeholder="赢点和偏离点背后,真正的问题是什么?"
              @input="dirty = true"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Sunrise">明日修正</SectionLabel>
            <textarea
              v-model="form.tomorrowFixesText"
              class="form-textarea night-textarea"
              maxlength="500"
              placeholder="明天最小但最关键的修正动作是什么?"
              @input="dirty = true"
            />
          </GlassCard>
        </div>

        <aside class="night-col night-col--side">
          <GlassCard>
            <SectionLabel :icon="Sparkles">今日快照</SectionLabel>
            <div class="night-summary-grid">
              <div class="night-summary__item">
                <span class="night-summary__value">{{ completedProofCount }}</span>
                <span class="night-summary__label">完成的证明</span>
              </div>
              <div class="night-summary__item">
                <span class="night-summary__value">{{ snapshot.alignmentScore }}%</span>
                <span class="night-summary__label">系统给的分数</span>
              </div>
            </div>
            <p class="muted-text night-summary__note">
              {{ snapshot.todayNote.trim() || "今天还没写今日观察。" }}
            </p>
          </GlassCard>

          <GlassCard v-if="monthProject">
            <SectionLabel :icon="Swords">本月 Boss 战</SectionLabel>
            <p class="night-month__title">{{ monthProject }}</p>
            <p class="muted-text">{{ monthProjectDescription }}</p>
            <p class="faint-text">写完复盘后问自己一句:今天有没有让这个项目近一步?</p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Info">复盘是干嘛的</SectionLabel>
            <p class="body-text">
              不是用来自责的。是把今天的偏离压成明天的修正动作,让系统越跑越顺。
            </p>
            <QuoteTicker kind="night" />
          </GlassCard>

          <p
            class="night-dirty-hint"
            :class="{ 'night-dirty-hint--dirty': dirty }"
          >
            {{ dirty ? "有未保存修改" : "已同步到当前草稿" }}
          </p>
        </aside>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  Brain,
  Gauge,
  Info,
  Save,
  Sparkles,
  Sunrise,
  Swords,
  ThumbsUp,
} from "lucide-vue-next";
import { tokens, useAppStore, parseDateKey } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import QuoteTicker from "@/components/common/QuoteTicker.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

const dirty = ref(false);
const form = reactive({
  alignmentScore: 0,
  winsText: "",
  missesText: "",
  reflectionText: "",
  tomorrowFixesText: "",
});

const dateKey = computed(() => store.state.activeDateKey);
const snapshot = computed(() => store.today.value.snapshot);
const completedProofCount = computed(() => snapshot.value.completedProofRuleIds.length);
const existingReview = computed(() => store.state.data.nightReviews[dateKey.value] ?? null);
const pendingNightPromptId = computed(
  () =>
    store.state.pendingReminderPrompts.find((p) => p.kind === "night")?.ruleId ?? null,
);
const monthProject = computed(() => store.state.data.visionProfile.monthProject.trim());
const monthProjectDescription = computed(
  () => store.state.data.visionProfile.monthProjectDescription.trim(),
);

const reviewSubtitle = computed(() => {
  const d = parseDateKey(dateKey.value);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
});

const scoreHint = computed(() => {
  if (form.alignmentScore >= 80) return "今天的行动和身份很对齐。";
  if (form.alignmentScore >= 60) return "主线在,但还有能压实的地方。";
  if (form.alignmentScore >= 40) return "今天被带偏了不少,明天需要一次明显纠偏。";
  return "偏离严重。先回到最小的真实动作。";
});

const canSave = computed(
  () => dirty.value || Boolean(existingReview.value) || form.alignmentScore > 0,
);

function hydrate() {
  const review = existingReview.value;
  form.alignmentScore = review?.alignmentScore ?? snapshot.value.alignmentScore ?? 0;
  form.winsText = review?.winsText ?? "";
  form.missesText = review?.missesText ?? "";
  form.reflectionText = review?.reflectionText ?? "";
  form.tomorrowFixesText = review?.tomorrowFixesText ?? "";
  dirty.value = false;
}

watch(dateKey, hydrate, { immediate: true });

function persistDraft() {
  if (!dirty.value) return;
  store.saveNightReview({
    dateKey: dateKey.value,
    alignmentScore: form.alignmentScore,
    winsText: form.winsText,
    missesText: form.missesText,
    reflectionText: form.reflectionText,
    tomorrowFixesText: form.tomorrowFixesText,
  });
  dirty.value = false;
}

function finalize() {
  store.saveNightReview({
    dateKey: dateKey.value,
    alignmentScore: form.alignmentScore,
    winsText: form.winsText,
    missesText: form.missesText,
    reflectionText: form.reflectionText,
    tomorrowFixesText: form.tomorrowFixesText,
  });
  if (pendingNightPromptId.value) {
    store.resolveReminder(pendingNightPromptId.value, "complete");
  }
  dirty.value = false;
  router.push("/today");
}

onBeforeUnmount(() => persistDraft());
</script>

<style lang="scss" scoped>
.night-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.night-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.night-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.night-score-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.night-score {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.night-score__value {
  font-size: var(--si-font-4xl);
  font-weight: 300;
  line-height: 1;
  color: var(--si-color-brand);
  letter-spacing: -0.02em;
}

.night-score__unit {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-md);
}

.night-slider {
  width: 100%;
  accent-color: var(--si-color-brand);
}

.night-score__marks {
  display: flex;
  justify-content: space-between;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.night-textarea {
  min-height: 120px;
  font-size: var(--si-font-md);
  line-height: 1.65;
}

.night-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.night-summary__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--si-color-brand-border);
  border-radius: var(--si-radius-lg);
  background: var(--si-color-brand-bg-soft);
}

.night-summary__value {
  color: var(--si-color-brand-text);
  font-size: var(--si-font-xl);
  font-weight: 600;
  line-height: 1;
}

.night-summary__label {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.night-summary__note {
  margin: 0;
  font-size: var(--si-font-sm);
}

.night-month__title {
  margin: 0;
  font-size: var(--si-font-md);
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
}

.night-dirty-hint {
  margin: 0;
  padding: 6px 2px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.night-dirty-hint--dirty {
  color: var(--si-color-warning);
}
</style>
