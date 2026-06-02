<template>
  <div class="today-page">
    <PageHeader title="今日" kicker="TODAY" :description="todayDateLabel">
      <template #actions>
        <button type="button" class="btn btn-ghost btn-sm" @click="openJourneyMorning">
          <Sun :size="14" :stroke-width="iconStroke" />
          <span>一天流程</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" @click="openReminderSettings">
          <Bell :size="14" :stroke-width="iconStroke" />
          <span>提醒设置</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" @click="openNote">
          <Pencil :size="14" :stroke-width="iconStroke" />
          <span>写观察</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="openSynthesis">
          <Telescope :size="14" :stroke-width="iconStroke" />
          <span>今晚 3 件事</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="today-grid">
        <section class="today-col today-col--main">
          <!-- 首次柔化卡:7 天内 dismiss 后不再显示 -->
          <GlassCard
            v-if="!journeyCompleted && !onboardingCompleted && !hideJourneyHint"
            variant="hero"
          >
            <SectionLabel :icon="Sparkles">这套系统还有更深的一层</SectionLabel>
            <h2 class="today-quest__title">等你哪天有一整段安静的时间,可以试试 22 题。</h2>
            <p class="body-text">
              它不是任务,是一次和自己的认真对话——什么时候做都来得及。
            </p>
            <div class="action-row">
              <button type="button" class="btn btn-primary" @click="openArticle">
                <BookOpenText :size="14" :stroke-width="iconStroke" />
                <span>先读原文</span>
              </button>
              <button type="button" class="btn btn-edit" @click="openJourneyMorning">
                <Sun :size="14" :stroke-width="iconStroke" />
                <span>现在就开始</span>
              </button>
              <button type="button" class="btn btn-ghost btn-sm" @click="dismissJourneyHint">
                <span>等我准备好了</span>
              </button>
            </div>
          </GlassCard>

          <!-- 30 天没做完整校准时的温柔卡:用户可以选择「现在校准」或「跳过 30 天」 -->
          <GlassCard
            v-if="showRecalibrateCard"
            variant="hero"
          >
            <SectionLabel :icon="Telescope">方向定下来一阵子了</SectionLabel>
            <h2 class="today-quest__title">{{ recalibrateTitle }}</h2>
            <p class="body-text">
              人会变,方向也该跟着调整。花 5 分钟做一次完整校准,把当下的状态对一下方向。
            </p>
            <div class="action-row">
              <button type="button" class="btn btn-primary" @click="openFullReview">
                <Telescope :size="14" :stroke-width="iconStroke" />
                <span>现在校准</span>
              </button>
              <button type="button" class="btn btn-ghost btn-sm" @click="snoozeRecalibrate">
                <span>跳过 30 天</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard variant="hero">
            <SectionLabel :icon="Quote">今日语录</SectionLabel>
            <p class="today-quote">{{ dailyQuote.text }}</p>
            <p class="muted-text today-headline">{{ todayPlan.reminderHeadline }}</p>
          </GlassCard>

          <GlassCard variant="hero">
            <div class="today-lens-row">
              <SectionLabel :icon="Telescope">三维度</SectionLabel>
              <div class="today-lens-tabs">
                <button
                  v-for="lens in lenses"
                  :key="lens.value"
                  type="button"
                  class="today-lens-tab"
                  :class="{ 'today-lens-tab--active': activeLens === lens.value }"
                  @click="activeLens = lens.value"
                >
                  {{ lens.label }}
                </button>
              </div>
            </div>
            <p class="muted-text faint-text">{{ lensCopy.kicker }}</p>
            <h2 class="today-quest__title">{{ lensCopy.title }}</h2>
            <p class="body-text">{{ lensCopy.body }}</p>

            <div v-if="monthProject && activeLens === 'year'" class="today-month">
              <div class="today-month__head">
                <SectionLabel :icon="Swords">Boss 战(这个月目标)</SectionLabel>
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

          <ReminderPromptCard
            v-if="primaryPrompt"
            :prompt="primaryPrompt"
            @action="handleReminderAction"
          />

          <GlassCard>
            <div class="today-section__head">
              <div class="today-section__head-copy">
                <SectionLabel :icon="CheckCircle2">每日动作</SectionLabel>
                <h3 class="section-title">{{ proofProgressTitle }}</h3>
              </div>
              <span class="today-section__meta">
                {{ completedProofIds.length }}/{{ proofRules.length }}
              </span>
            </div>

            <div v-if="proofRules.length" class="today-proofs">
              <button
                v-for="rule in proofRules"
                :key="rule.id"
                type="button"
                class="today-proof"
                :class="{ 'today-proof--done': completedProofIds.includes(rule.id) }"
                @click="onProofClick(rule)"
              >
                <span class="today-proof__mark">
                  <Check
                    v-if="completedProofIds.includes(rule.id)"
                    :size="14"
                    :stroke-width="2.5"
                  />
                </span>
                <span class="today-proof__copy">
                  <span class="today-proof__title">{{ rule.title }}</span>
                  <span v-if="rule.description.trim()" class="today-proof__desc">
                    {{ rule.description }}
                  </span>
                  <span
                    v-if="rule.linkedYearGoal || rule.linkedMonthProject"
                    class="today-proof__links"
                  >
                    <span v-if="rule.linkedYearGoal" class="tag-chip">这一年的方向</span>
                    <span v-if="rule.linkedMonthProject" class="tag-chip">Boss 战(这个月目标)</span>
                  </span>
                  <transition name="cheer">
                    <span
                      v-if="cheerForRuleId === rule.id"
                      class="today-proof__cheer"
                    >
                      <span class="today-proof__cheer-dot" />
                      <span>{{ cheerText }}</span>
                    </span>
                  </transition>
                </span>
              </button>
            </div>
            <EmptyState
              v-else
              :icon="ListChecks"
              title="还没有每日动作"
              description="去身份页加一条今天就能做到的小事,或者保存一次晚上回顾,明天就有了。"
            >
              <button type="button" class="btn btn-edit btn-sm" @click="openIdentityEditor">
                <Pencil :size="14" :stroke-width="iconStroke" />
                <span>打开身份编辑</span>
              </button>
            </EmptyState>
          </GlassCard>
        </section>

        <aside class="today-col today-col--side">
          <!-- 替换原来的"今日推进度 X%"为"今天的样子" -->
          <GlassCard>
            <SectionLabel :icon="Sparkles">今天的样子</SectionLabel>
            <p class="today-status">{{ todayStatusText }}</p>
            <div class="today-status__row">
              <span
                v-for="(dot, idx) in 5"
                :key="idx"
                class="today-status__dot"
                :class="{ 'today-status__dot--filled': idx < statusFilled }"
              />
            </div>
          </GlassCard>

          <!-- 这一周 -->
          <GlassCard>
            <SectionLabel :icon="CalendarDays">这一周</SectionLabel>
            <div class="today-week">
              <div
                v-for="(day, idx) in weekDays"
                :key="day.dateKey"
                class="today-week__cell"
                :class="weekCellClass(day)"
                :title="`${day.label} · 完成 ${day.completedProofCount} 项`"
              >
                <span class="today-week__weekday">{{ weekdayShort(idx) }}</span>
              </div>
            </div>
            <p class="muted-text">{{ weekCopy }}</p>
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
              <button type="button" class="btn btn-ghost btn-sm" @click="openJourneyDay">
                <Sun :size="14" :stroke-width="iconStroke" />
                <span>白天 9 题</span>
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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Bell,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  LineChart,
  ListChecks,
  NotebookPen,
  Pencil,
  Quote,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Swords,
  Telescope,
  UserCheck,
} from "lucide-vue-next";
import {
  pickDailyQuote,
  tokens,
  useAppStore,
  parseDateKey,
  formatDateKey,
  type ReminderAction,
  type RecordDay,
} from "@guiling/core";
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

// 透镜 → 三维度。默认改成「今天的行动」(原来叫"每日反思")。
type Lens = "year" | "month" | "today";
const lenses: { value: Lens; label: string }[] = [
  { value: "today", label: "今天的行动" },
  { value: "month", label: "这个月重点" },
  { value: "year", label: "一年方向" },
];
const activeLens = ref<Lens>("today");

const todayPlan = computed(() => store.today.value.plan);
const todaySnapshot = computed(() => store.today.value.snapshot);
const identityStatement = computed(
  () => store.state.data.identityProfile.statement || "先决定你是谁",
);
const antiIdentityText = computed(
  () =>
    store.state.data.identityProfile.antiIdentityText ||
    "把那个你不愿再扮演的旧版本说清楚。",
);
const proofRules = computed(() => store.activeProofRules());
const completedProofIds = computed(() => todaySnapshot.value.completedProofRuleIds);
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const primaryPrompt = computed(() => pendingPrompts.value[0] ?? null);
const extraPrompts = computed(() => Math.max(0, pendingPrompts.value.length - 1));
const streak = computed(() =>
  store.getRecordSummary({ endDateKey: store.state.activeDateKey }),
);
const last14Days = computed(() =>
  store.getRecordDays({ endDateKey: store.state.activeDateKey, spanDays: 14 }),
);
const onboardingCompleted = computed(() => store.state.data.onboardingCompleted);
const journeyCompleted = computed(() => store.state.data.journeyCompleted);

// 「等我准备好了」一键 dismiss 7 天。用 localStorage 持久化。
const HINT_DISMISS_KEY = "guiling.journeyHintDismissedUntil";
const hintDismissUntil = ref<number>(
  Number(localStorage.getItem(HINT_DISMISS_KEY) ?? 0) || 0,
);
const hideJourneyHint = computed(() => Date.now() < hintDismissUntil.value);
function dismissJourneyHint() {
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
  hintDismissUntil.value = until;
  localStorage.setItem(HINT_DISMISS_KEY, String(until));
}

// 30 天后的「重新校准方向」温柔卡。同样支持「跳过 30 天」一键 dismiss。
const RECAL_DISMISS_KEY = "guiling.recalibrateDismissedUntil";
const recalDismissUntil = ref<number>(
  Number(localStorage.getItem(RECAL_DISMISS_KEY) ?? 0) || 0,
);
const showRecalibrateCard = computed(() => {
  // 还没跑完 22 题、还没设过任何方向时,不打扰
  if (!journeyCompleted.value && !onboardingCompleted.value) return false;
  if (Date.now() < recalDismissUntil.value) return false;
  // 找最近一次完整校准时间
  const map = store.state.data.nightSynthesisByDate ?? {};
  let lastFull: string | null = null;
  for (const ns of Object.values(map)) {
    if (ns.lastFullReviewAt && (!lastFull || ns.lastFullReviewAt > lastFull)) {
      lastFull = ns.lastFullReviewAt;
    }
  }
  if (!lastFull) {
    // 从来没做过完整校准 —— 但用户可能是从老版本升级上来的(旧数据 N1-N5 都填过)
    // 这种情况:看 visionProfile 是否非空,如果非空就把"老版本=已校准"近似为"30 天前刚校准"
    // 即:只要 onboarding 完成 + 距 onboarding 已经超过 30 天就显示
    return false;
  }
  const days = Math.floor(
    (Date.now() - new Date(lastFull).getTime()) / (24 * 60 * 60 * 1000),
  );
  return days >= 30;
});
const recalibrateTitle = computed(() => {
  const map = store.state.data.nightSynthesisByDate ?? {};
  let lastFull: string | null = null;
  for (const ns of Object.values(map)) {
    if (ns.lastFullReviewAt && (!lastFull || ns.lastFullReviewAt > lastFull)) {
      lastFull = ns.lastFullReviewAt;
    }
  }
  if (!lastFull) return "要不要再校准一下?";
  const days = Math.floor(
    (Date.now() - new Date(lastFull).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (days < 60) return `方向定下来一个月了,要不要再校准一下?`;
  if (days < 90) return `方向定下来两个月了,要不要再校准一下?`;
  return `方向已经过去 ${Math.floor(days / 30)} 个月了,值得花几分钟重新看看`;
});
function snoozeRecalibrate() {
  const until = Date.now() + 30 * 24 * 60 * 60 * 1000;
  recalDismissUntil.value = until;
  localStorage.setItem(RECAL_DISMISS_KEY, String(until));
}
function openFullReview() {
  // 进入 JourneyNightPage 后默认会展开完整 5 步(因为 lastFullReviewAt 已经超过 30 天)
  // 这里加个 query 标记让目标页强制展开
  router.push({ path: "/journey/night", query: { fullReview: "1" } });
}

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
  } catch {
    return null;
  }
});

const lensCopy = computed(() => {
  const v = store.state.data.visionProfile;
  if (activeLens.value === "year") {
    return {
      kicker: "用一年的尺度看今天",
      title: v.yearGoal || "先把这一年要走到哪定下来",
      body: v.yearGoalDescription || todayPlan.value.yearGoalDescription || "",
    };
  }
  if (activeLens.value === "month") {
    return {
      kicker: "这个月要拿下的事",
      title: v.monthProject || "这个月要攻克的具体里程碑",
      body: v.monthProjectDescription || "",
    };
  }
  // today
  const blocks = proofRules.value.slice(0, 3);
  return {
    kicker: "今天要做的几件小事",
    title:
      blocks.length > 0
        ? "今天的 2-3 件小事"
        : "还没排好今天",
    body:
      blocks.length > 0
        ? blocks.map((b) => `· ${b.title}`).join("\n")
        : "保存一次「晚上回顾」,明天就有了。或者去身份页加一条。",
  };
});

const todayDateLabel = computed(() => {
  const date = parseDateKey(store.state.activeDateKey);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${weekdays[date.getDay()]}`;
});

const hasNote = computed(() => todaySnapshot.value.todayNote.trim().length > 0);
const notePreview = computed(() =>
  hasNote.value
    ? todaySnapshot.value.todayNote
    : "今天还没写。一句话就行——把现在的真实状态留下来。",
);

const dailyQuote = computed(() => {
  const hour = new Date().getHours();
  const slot = hour < 11 ? "morning" : hour < 19 ? "daytime" : "night";
  return pickDailyQuote(store.state.activeDateKey, slot);
});

const proofProgressTitle = computed(() => {
  if (!proofRules.value.length) return "先把今天的 2-3 件小事定下来";
  if (completedProofIds.value.length === proofRules.value.length)
    return "今天都做完了,稳住";
  return "把今天最重要的那件先做掉";
});

// "今天的样子"五挡正向语句(替换原来 X% 进度条)
const todayHasNote = computed(() => todaySnapshot.value.todayNote.trim().length > 0);
const todayHasSynthesis = computed(() => {
  const ns = store.state.data.nightSynthesisByDate?.[store.state.activeDateKey];
  return Boolean(ns && (ns.stuckReason || ns.enemyName || ns.visionMantra));
});
const statusFilled = computed(() => {
  const done = completedProofIds.value.length;
  const total = proofRules.value.length;
  // 0/1/2/3+/全部+观察+综合 → 0..5
  if (total > 0 && done === total && todayHasNote.value && todayHasSynthesis.value) return 5;
  if (done >= 3) return 4;
  if (done === 2) return 3;
  if (done === 1) return 2;
  return done > 0 ? 1 : 0;
});
const todayStatusText = computed(() => {
  const done = completedProofIds.value.length;
  const total = proofRules.value.length;
  if (total > 0 && done === total && todayHasNote.value && todayHasSynthesis.value)
    return "今天从头到尾认真过完了";
  if (done >= 3) return "今天就是你想成为的样子";
  if (done === 2) return "今天有那个你想成为的人的样子了";
  if (done === 1) return "已经动起来了";
  return "今天还没开始也没关系,做一件小事就行";
});

// —— 鼓励微反馈 —— 点完一个动作后短暂出一行字
const cheerForRuleId = ref<string | null>(null);
const cheerText = ref("");
let cheerTimer: ReturnType<typeof setTimeout> | null = null;
function onProofClick(rule: { id: string; title: string }) {
  const wasDone = completedProofIds.value.includes(rule.id);
  store.toggleProofCompletion(rule.id);
  // 只在「从未完成 → 完成」时弹鼓励
  if (!wasDone) {
    const count = countCompletionsForRule(rule.id, rule.title);
    cheerText.value = composeCheer(count, rule.title);
    cheerForRuleId.value = rule.id;
    if (cheerTimer) clearTimeout(cheerTimer);
    cheerTimer = setTimeout(() => {
      cheerForRuleId.value = null;
    }, 3000);
  }
}
// 从 actionLogs 里数当前规则的完成次数(包括本次)
function countCompletionsForRule(ruleId: string, _title: string): number {
  const logs = store.state.data.actionLogs;
  return logs.filter((l) => l.type === "proof-complete" && l.refId === ruleId).length;
}
function composeCheer(count: number, title: string): string {
  if (count <= 1) return `第一次做完「${title}」,记住这种感觉`;
  if (count <= 6) return `这周第 ${count} 次做完「${title}」了`;
  if (count <= 29) return `第 ${count} 次做完「${title}」,你已经熟了`;
  return `第 ${count} 次做完「${title}」,这事已经成你的习惯了`;
}

// —— 这一周 ——
const weekDays = computed<RecordDay[]>(() => {
  // 取本周的周一到周日(以今天为参照),不足天数用空 day
  const today = parseDateKey(store.state.activeDateKey);
  const dow = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const daysFromStore = store.getRecordDays({
    endDateKey: store.state.activeDateKey,
    spanDays: 21,
  });
  const result: RecordDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatDateKey(d);
    const found = daysFromStore.find((day) => day.dateKey === key);
    result.push(
      found ?? {
        dateKey: key,
        label: "",
        weekday: "",
        alignmentScore: null,
        completedProofCount: 0,
        note: "",
        hasNightReview: false,
      },
    );
  }
  return result;
});
function weekCellClass(day: RecordDay) {
  const isFuture = day.dateKey > store.state.activeDateKey;
  if (isFuture) return "today-week__cell--future";
  const c = day.completedProofCount;
  if (c >= 4) return "today-week__cell--bright";
  if (c >= 2) return "today-week__cell--mid";
  if (c >= 1) return "today-week__cell--soft";
  return "today-week__cell--empty";
}
function weekdayShort(idx: number): string {
  return ["一", "二", "三", "四", "五", "六", "日"][idx];
}
const weekActiveDays = computed(
  () => weekDays.value.filter((d) => d.completedProofCount >= 1).length,
);
const weekCopy = computed(() => {
  const n = weekActiveDays.value;
  if (n === 0) return "新的一周,什么时候开始都行";
  if (n === 1) return "本周已经动了 1 天";
  if (n === 2) return "本周保持了 2 天有行动";
  if (n <= 4) return `本周保持了 ${n} 天有行动,稳住`;
  if (n <= 6) return `本周保持了 ${n} 天有行动,这就是节奏`;
  return "这一周每天都在动,挺好";
});

const reminderStatusTitle = computed(() => {
  if (extraPrompts.value > 0) return `还有 ${extraPrompts.value} 条提醒等你处理`;
  if (primaryPrompt.value) return "有一条提醒在等你";
  return "现在没有要处理的提醒";
});

const reminderStatusBody = computed(() => {
  if (primaryPrompt.value)
    return `先处理「${primaryPrompt.value.label}」,剩下的会排着队来。`;
  return "日常只保留目标锚点;完整 9 题会在重启日当天按时间段提醒。";
});

const streakCopy = computed(() => {
  if (streak.value.currentStreak > 0)
    return "你正在保持节奏,这种「在线感」最值钱。";
  if (streak.value.trackedDays > 0)
    return "轨迹还在,只是断了一下。今天重新接上就行。";
  return "今天留下第一条记录,系统就开始跑起来了。";
});

function handleReminderAction(ruleId: string, action: ReminderAction) {
  const prompt = pendingPrompts.value.find((item) => item.ruleId === ruleId);
  if (action === "complete" && prompt?.promptKey) {
    if (prompt.kind === "morning") {
      router.push("/journey/morning");
    } else if (prompt.kind === "night") {
      router.push("/journey/night");
    } else {
      router.push("/journey/day");
    }
  }
  store.resolveReminder(ruleId, action);
}

function openNote() {
  router.push("/today/note");
}
function openSynthesis() {
  router.push("/journey/night");
}
function openReminderSettings() {
  router.push("/today/reminders");
}
function openIdentityEditor() {
  router.push("/identity/edit");
}
function openArticle() {
  router.push("/path/article");
}
function openJourneyMorning() {
  router.push("/journey/morning");
}
function openJourneyDay() {
  router.push("/journey/day");
}
</script>

<style lang="scss" scoped>
.today-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.today-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.today-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.today-quote {
  margin: 0;
  font-size: var(--si-font-xl);
  line-height: 1.55;
  color: var(--si-color-brand-text);
  font-weight: var(--si-weight-medium);
}

.today-headline {
  margin: 0;
  font-size: var(--si-font-sm);
}

.today-lens-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.today-lens-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 2px;
  border-radius: var(--si-radius-pill);
  background: var(--si-color-surface-inset);
}

.today-lens-tab {
  padding: 4px 10px;
  border-radius: var(--si-radius-pill);
  border: 0;
  background: transparent;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  cursor: pointer;
}

.today-lens-tab--active {
  background: var(--si-color-brand);
  color: var(--si-color-brand-deep);
}

.today-quest__title {
  margin: 0;
  font-size: var(--si-font-2xl);
  line-height: 1.3;
  color: var(--si-color-text-main);
  font-weight: 600;
  white-space: pre-line;
}

.today-quest__meta,
.today-quest__note,
.today-month {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 0 0;
  border-top: 1px solid rgba(39, 39, 42, 0.6);
}

.today-quest__note {
  cursor: pointer;
}

.today-month__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.today-month__title {
  margin: 0;
  font-size: var(--si-font-md);
  color: var(--si-color-text-soft);
}

.today-quest__note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.today-quest__note-body {
  margin: 0;
  font-size: var(--si-font-sm);
}

.today-quest__identity {
  margin: 0;
  font-size: var(--si-font-lg);
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
}

.today-quest__anti {
  margin: 0;
  font-size: var(--si-font-sm);
}

.today-section__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.today-section__head-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.today-section__meta {
  color: var(--si-color-text-muted);
  font-size: var(--si-font-sm);
}

.today-proofs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-proof {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-card-soft);
  text-align: left;
  color: var(--si-color-text-soft);
  transition: background 140ms ease, border-color 140ms ease;
  cursor: pointer;
}

.today-proof:hover {
  border-color: rgba(113, 113, 122, 0.6);
  background: rgba(24, 24, 27, 0.72);
}

.today-proof--done {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);
}

.today-proof__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 2px;
  border: 1px solid var(--si-color-text-disabled);
  border-radius: 999px;
  color: var(--si-color-brand);
  flex-shrink: 0;
}

.today-proof--done .today-proof__mark {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand);
  color: var(--si-color-brand-deep);
}

.today-proof__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.today-proof__title {
  font-size: var(--si-font-md);
  color: inherit;
}

.today-proof__desc {
  font-size: var(--si-font-sm);
  color: var(--si-color-text-faint);
  line-height: 1.6;
}

.today-proof__links {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.today-proof__cheer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: var(--si-font-xs);
  color: var(--si-color-brand);
}

.today-proof__cheer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--si-color-brand);
  box-shadow: 0 0 8px var(--si-color-brand);
}

.cheer-enter-active,
.cheer-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.cheer-enter-from,
.cheer-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.today-status {
  margin: 8px 0 12px;
  font-size: var(--si-font-md);
  line-height: 1.55;
  color: var(--si-color-text-main);
}

.today-status__row {
  display: flex;
  gap: 6px;
}

.today-status__dot {
  flex: 1 1 0;
  height: 4px;
  border-radius: 2px;
  background: rgba(113, 113, 122, 0.25);
}

.today-status__dot--filled {
  background: var(--si-color-brand);
}

.today-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin: 8px 0 12px;
}

.today-week__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 6px;
  font-size: var(--si-font-xs);
  color: var(--si-color-text-faint);
  background: rgba(63, 63, 70, 0.35);
}

.today-week__weekday {
  font-size: 11px;
}

.today-week__cell--empty {
  background: rgba(63, 63, 70, 0.35);
}
.today-week__cell--soft {
  background: rgba(16, 185, 129, 0.25);
  color: var(--si-color-brand-text);
}
.today-week__cell--mid {
  background: rgba(16, 185, 129, 0.55);
  color: var(--si-color-brand-deep);
}
.today-week__cell--bright {
  background: var(--si-color-brand);
  color: var(--si-color-brand-deep);
  font-weight: var(--si-weight-semibold);
}
.today-week__cell--future {
  background: rgba(63, 63, 70, 0.18);
  color: rgba(113, 113, 122, 0.5);
}

.today-streak {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.today-streak__value {
  font-size: var(--si-font-4xl);
  line-height: 1;
  color: var(--si-color-text-main);
  font-weight: 300;
  letter-spacing: -0.02em;
}

.today-streak__unit {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-md);
}

.today-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  &:hover {
    color: var(--si-color-brand-text);
  }
}
</style>
