<template>
  <div class="today-page">
    <PageHeader title="今日" kicker="TODAY" :description="todayDateLabel">
      <template #actions>
        <button type="button" class="btn btn-ghost btn-sm" @click="openReminderSettings">
          <Bell :size="14" :stroke-width="iconStroke" />
          <span>提醒设置</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" @click="openNote">
          <Pencil :size="14" :stroke-width="iconStroke" />
          <span>写观察</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="openReview">
          <Moon :size="14" :stroke-width="iconStroke" />
          <span>进入复盘</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="today-grid">
        <section class="today-col today-col--main">
          <GlassCard v-if="!onboardingCompleted" variant="hero">
            <SectionLabel :icon="Sparkles">还没设过方向和目标</SectionLabel>
            <h2 class="today-quest__title">建议先花 20 分钟读一遍原文,想清楚再来设置。</h2>
            <p class="body-text">读完之后你会知道自己要去哪、不要回到哪。到时候再来填方向、身份和目标,每一个字都是你自己想出来的。</p>
            <div class="action-row">
              <button type="button" class="btn btn-primary" @click="$router.push('/path/article')">
                <BookOpenText :size="14" :stroke-width="iconStroke" />
                <span>先读原文</span>
              </button>
              <button type="button" class="btn btn-ghost" @click="openOnboarding">
                <Compass :size="14" :stroke-width="iconStroke" />
                <span>我想清楚了,直接设置</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard variant="hero">
            <SectionLabel :icon="Quote">今日语录</SectionLabel>
            <p class="today-quote">{{ dailyQuote.text }}</p>
          </GlassCard>

          <GlassCard variant="hero">
            <SectionLabel :icon="Target">今日主线</SectionLabel>
            <p class="muted-text faint-text">连接到你的一年目标</p>
            <h2 class="today-quest__title">{{ todayPlan.mainQuestTitle }}</h2>
            <p class="body-text">{{ todayPlan.mainQuestDescription }}</p>

            <div v-if="monthProject" class="today-month">
              <div class="today-month__head">
                <SectionLabel :icon="Swords">本月 Boss 战</SectionLabel>
                <span v-if="monthDaysLeft !== null" class="tag-chip tag-chip--active">
                  <CalendarDays :size="12" :stroke-width="2" />
                  <span>{{ monthDaysLeft }}</span>
                </span>
              </div>
              <p class="today-month__title">{{ monthProject }}</p>
            </div>

            <div class="today-quest__meta">
              <SectionLabel :icon="UserCheck">你是谁</SectionLabel>
              <p class="today-quest__identity">{{ identityStatement }}</p>
              <p class="muted-text today-quest__anti">不再回去:{{ antiIdentityText }}</p>
            </div>

            <div class="today-quest__note" @click="openNote">
              <div class="today-quest__note-head">
                <SectionLabel :icon="NotebookPen">今日观察</SectionLabel>
                <span class="faint-text">{{ hasNote ? "点这里继续写" : "点这里开始写" }}</span>
              </div>
              <p class="body-text today-quest__note-body">{{ notePreview }}</p>
            </div>
          </GlassCard>

          <ReminderPromptCard v-if="primaryPrompt" :prompt="primaryPrompt" @action="handleReminderAction" />

          <GlassCard>
            <div class="today-section__head">
              <div class="today-section__head-copy">
                <SectionLabel :icon="CheckCircle2">身份证明</SectionLabel>
                <h3 class="section-title">{{ proofProgressTitle }}</h3>
              </div>
              <span class="today-section__meta">{{ completedProofIds.length }}/{{ proofRules.length }}</span>
            </div>

            <div v-if="proofRules.length" class="today-proofs">
              <button
                v-for="rule in proofRules"
                :key="rule.id"
                type="button"
                class="today-proof"
                :class="{ 'today-proof--done': completedProofIds.includes(rule.id) }"
                @click="store.toggleProofCompletion(rule.id)"
              >
                <span class="today-proof__mark">
                  <Check v-if="completedProofIds.includes(rule.id)" :size="14" :stroke-width="2.5" />
                </span>
                <span class="today-proof__copy">
                  <span class="today-proof__title">{{ rule.title }}</span>
                  <span v-if="rule.description.trim()" class="today-proof__desc">{{ rule.description }}</span>
                </span>
              </button>
            </div>
            <EmptyState v-else :icon="ListChecks" title="还没有生效的证明法则" description="去身份页添加一条你今天真实会做的动作。">
              <button type="button" class="btn btn-edit btn-sm" @click="openIdentityEditor">
                <Pencil :size="14" :stroke-width="iconStroke" />
                <span>打开身份编辑</span>
              </button>
            </EmptyState>
          </GlassCard>
        </section>

        <aside class="today-col today-col--side">
          <GlassCard>
            <SectionLabel :icon="Gauge">今日进度</SectionLabel>
            <div class="today-score">
              <span class="today-score__value">{{ alignmentScore }}</span>
              <span class="today-score__unit">%</span>
            </div>
            <p class="muted-text">{{ alignmentHeadline }}</p>
            <div class="progress-track"><div class="progress-bar" :style="{ width: `${alignmentScore}%` }" /></div>
            <p class="faint-text today-score__hint">{{ alignmentHint }}</p>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Bell">提醒</SectionLabel>
            <p class="section-title">{{ reminderStatusTitle }}</p>
            <p class="muted-text">{{ reminderStatusBody }}</p>
            <div class="action-row">
              <button type="button" class="btn btn-ghost btn-sm" @click="openReminderSettings">
                <SlidersHorizontal :size="14" :stroke-width="iconStroke" />
                <span>调整时间</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="Flame">连续推进</SectionLabel>
            <div class="today-streak">
              <span class="today-streak__value">{{ streak.currentStreak }}</span>
              <span class="today-streak__unit">天</span>
            </div>
            <p class="muted-text">{{ streakCopy }}</p>
            <router-link to="/records" class="today-link">
              <span>查看完整轨迹</span>
              <ChevronRight :size="14" :stroke-width="iconStroke" />
            </router-link>
          </GlassCard>

          <GlassCard>
            <SectionLabel :icon="LineChart">最近 14 天</SectionLabel>
            <TrendChart :days="last14Days" :height="130" />
          </GlassCard>
        </aside>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Bell, BookOpenText, CalendarDays, Check, CheckCircle2, ChevronRight, Compass, Flame, Gauge,
  LineChart, ListChecks, Moon, NotebookPen, Pencil, Quote, SlidersHorizontal,
  Sparkles, Swords, Target, UserCheck,
} from "lucide-vue-next";
import { pickDailyQuote, tokens, useAppStore, parseDateKey, type ReminderAction } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import ReminderPromptCard from "@/components/common/ReminderPromptCard.vue";
import TrendChart from "@/components/records/TrendChart.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const store = useAppStore();

onMounted(() => store.refreshReminderPrompts());

const todayPlan = computed(() => store.today.value.plan);
const todaySnapshot = computed(() => store.today.value.snapshot);
const identityStatement = computed(() => store.state.data.identityProfile.statement);
const antiIdentityText = computed(() => store.state.data.identityProfile.antiIdentityText);
const proofRules = computed(() => store.activeProofRules());
const completedProofIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const alignmentScore = computed(() => todaySnapshot.value.alignmentScore);
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const primaryPrompt = computed(() => pendingPrompts.value[0] ?? null);
const extraPrompts = computed(() => Math.max(0, pendingPrompts.value.length - 1));
const streak = computed(() => store.getRecordSummary({ endDateKey: store.state.activeDateKey }));
const last14Days = computed(() => store.getRecordDays({ endDateKey: store.state.activeDateKey, spanDays: 14 }));
const onboardingCompleted = computed(() => store.state.data.onboardingCompleted);

const monthProject = computed(() => store.state.data.visionProfile.monthProject.trim());
const monthDaysLeft = computed(() => {
  const raw = store.state.data.visionProfile.monthProjectDeadline;
  if (!raw) return null;
  try {
    const d = parseDateKey(raw);
    const today = parseDateKey(store.state.activeDateKey);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (diff < 0) return "已过期";
    if (diff === 0) return "今天截止";
    return `还剩 ${diff} 天`;
  } catch { return null; }
});

const todayDateLabel = computed(() => {
  const date = parseDateKey(store.state.activeDateKey);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${weekdays[date.getDay()]}`;
});

const hasNote = computed(() => todaySnapshot.value.todayNote.trim().length > 0);
const notePreview = computed(() =>
  hasNote.value ? todaySnapshot.value.todayNote : "今天还没写。一句话就行——把现在的真实状态留下来。",
);

const dailyQuote = computed(() => {
  const hour = new Date().getHours();
  const slot = hour < 11 ? "morning" : hour < 19 ? "daytime" : "night";
  return pickDailyQuote(store.state.activeDateKey, slot);
});

const proofProgressTitle = computed(() => {
  if (!proofRules.value.length) return "先把今天要证明的动作建起来";
  if (completedProofIds.value.length === proofRules.value.length) return "今天的证明全部到手了";
  return "把今天最关键的那个动作先做掉";
});

const alignmentHeadline = computed(() => {
  if (alignmentScore.value >= 80) return "节奏稳得住,继续这样跑。";
  if (alignmentScore.value >= 60) return "整体在线,但还能压实一点。";
  return "今天明显被带偏了,需要一次纠偏。";
});

const alignmentHint = computed(() => {
  if (!proofRules.value.length) return "去身份页先补几条证明法则。这里的分数才有意义。";
  return `${completedProofIds.value.length}/${proofRules.value.length} 条证明已完成。提醒处理和今日观察也会算进分数。`;
});

const reminderStatusTitle = computed(() => {
  if (extraPrompts.value > 0) return `还有 ${extraPrompts.value} 条提醒等你处理`;
  if (primaryPrompt.value) return "有一条提醒在等你";
  return "现在没有要处理的提醒";
});

const reminderStatusBody = computed(() => {
  if (primaryPrompt.value) return `先处理「${primaryPrompt.value.label}」,剩下的会排着队来。`;
  return "白天打断、夜间复盘的时间都可以随时调整。";
});

const streakCopy = computed(() => {
  if (streak.value.currentStreak > 0) return "你正在累积连续性。这是身份最可靠的证据。";
  if (streak.value.trackedDays > 0) return "轨迹还在,只是断了一下。今天重新接上。";
  return "今天留下第一条快照,系统就开始发力了。";
});

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  store.resolveReminder(ruleId, action);
  if (action === "complete" && prompt?.kind === "night") openReview();
}

function openNote() { router.push("/today/note"); }
function openReview() { router.push("/today/review"); }
function openReminderSettings() { router.push("/today/reminders"); }
function openIdentityEditor() { router.push("/identity/edit"); }
function openOnboarding() { router.push("/onboarding"); }
</script>

<style lang="scss" scoped>
.today-page { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.today-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  @media (max-width: 1080px) { grid-template-columns: 1fr; }
}

.today-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

.today-quote {
  margin: 0;
  font-size: var(--si-font-xl);
  line-height: 1.55;
  color: var(--si-color-brand-text);
  font-weight: var(--si-weight-medium);
}

.today-quest__title { margin: 0; font-size: var(--si-font-2xl); line-height: 1.3; color: var(--si-color-text-main); font-weight: 600; }

.today-quest__meta, .today-quest__note, .today-month {
  display: flex; flex-direction: column; gap: 6px; padding: 14px 0 0;
  border-top: 1px solid rgba(39, 39, 42, 0.6);
}
.today-quest__note { cursor: pointer; }

.today-month__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.today-month__title { margin: 0; font-size: var(--si-font-md); color: var(--si-color-text-soft); }

.today-quest__note-head { display: flex; align-items: center; justify-content: space-between; }
.today-quest__note-body { margin: 0; font-size: var(--si-font-sm); }
.today-quest__identity { margin: 0; font-size: var(--si-font-lg); color: var(--si-color-text-main); font-weight: var(--si-weight-semibold); }
.today-quest__anti { margin: 0; font-size: var(--si-font-sm); }

.today-section__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.today-section__head-copy { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.today-section__meta { color: var(--si-color-text-muted); font-size: var(--si-font-sm); }

.today-proofs { display: flex; flex-direction: column; gap: 10px; }

.today-proof {
  display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px;
  border: 1px solid var(--si-color-border-subtle); border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-card-soft); text-align: left; color: var(--si-color-text-soft);
  transition: background 140ms ease, border-color 140ms ease;
}
.today-proof:hover { border-color: rgba(113, 113, 122, 0.6); background: rgba(24, 24, 27, 0.72); }
.today-proof--done { border-color: var(--si-color-brand-border); background: var(--si-color-brand-bg-soft); color: var(--si-color-brand-text); }

.today-proof__mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; margin-top: 2px;
  border: 1px solid var(--si-color-text-disabled); border-radius: 999px;
  color: var(--si-color-brand); flex-shrink: 0;
}
.today-proof--done .today-proof__mark { border-color: var(--si-color-brand-border); background: var(--si-color-brand); color: var(--si-color-brand-deep); }

.today-proof__copy { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.today-proof__title { font-size: var(--si-font-md); color: inherit; }
.today-proof__desc { font-size: var(--si-font-sm); color: var(--si-color-text-faint); line-height: 1.6; }

.today-score, .today-streak { display: flex; align-items: baseline; gap: 8px; }
.today-score__value, .today-streak__value { font-size: var(--si-font-4xl); line-height: 1; color: var(--si-color-text-main); font-weight: 300; letter-spacing: -0.02em; }
.today-score__unit, .today-streak__unit { color: var(--si-color-text-faint); font-size: var(--si-font-md); }
.today-score__hint { font-size: var(--si-font-xs); }

.today-link { display: inline-flex; align-items: center; gap: 4px; color: var(--si-color-text-soft); font-size: var(--si-font-sm); &:hover { color: var(--si-color-brand-text); } }
</style>
