<template>
  <div class="onboarding-page">
    <PageHeader
      title="快速设置"
      kicker="SETUP"
      :description="headerDesc"
      back
      back-to="/today"
    />
    <PageBody>
      <div class="onboarding__frame">
        <GlassCard variant="hero">
          <SectionLabel :icon="Compass">{{ stepMeta.kicker }}</SectionLabel>
          <h2 class="onboarding__title">{{ stepMeta.title }}</h2>
          <p class="muted-text">{{ stepMeta.description }}</p>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: `${progress}%` }" />
          </div>
          <ol class="onboarding__steps">
            <li
              v-for="(item, index) in steps"
              :key="item.short"
              class="onboarding__step"
              :class="{ 'onboarding__step--active': currentStep === index }"
            >
              <span class="onboarding__step-index">0{{ index + 1 }}</span>
              <span class="onboarding__step-title">{{ item.short }}</span>
            </li>
          </ol>
          <p class="faint-text onboarding__lite-hint">
            原文要求的「整整一天 22 题」流程在
            <button type="button" class="onboarding__inline-link" @click="goJourney">
              一天流程
            </button>
            页里。这里是简版,先把方向和身份占住位。
          </p>
        </GlassCard>

        <GlassCard v-if="currentStep === 0">
          <div class="form-field">
            <label class="form-label">愿景(可后续替换为三年后周二叙事)</label>
            <textarea
              v-model="visionText"
              class="form-textarea"
              maxlength="260"
              placeholder="你想去到的生活是什么样?写到能在脑子里看见画面。"
            />
          </div>
          <div class="form-field">
            <label class="form-label">反愿景</label>
            <textarea
              v-model="antiVisionText"
              class="form-textarea"
              maxlength="220"
              placeholder="那个你不愿再回去的旧自己是什么样?写出来,它就拽不动你了。"
            />
          </div>
        </GlassCard>

        <GlassCard v-else-if="currentStep === 1">
          <div class="form-field">
            <label class="form-label">身份句</label>
            <input
              v-model="identityStatement"
              class="form-input"
              maxlength="40"
              placeholder="例如:我是那种想到就做、绝不拖到明天的人"
            />
          </div>
          <div class="form-field">
            <label class="form-label">必须放弃的旧身份</label>
            <textarea
              v-model="antiIdentityText"
              class="form-textarea"
              maxlength="220"
              placeholder="那个你不再愿意继续扮演的旧版本——把它说清楚。"
            />
          </div>
        </GlassCard>

        <template v-else-if="currentStep === 2">
          <GlassCard>
            <SectionLabel :icon="Target">一年方向</SectionLabel>
            <p class="muted-text">一年后必须看到什么变化,才算真的打破了旧模式?</p>
            <div class="form-field">
              <label class="form-label">标题</label>
              <input
                v-model="yearGoal"
                class="form-input"
                maxlength="32"
                placeholder="例如:用 365 天彻底重建日常系统"
              />
            </div>
            <div class="form-field">
              <label class="form-label">具体说明</label>
              <textarea
                v-model="yearGoalDescription"
                class="form-textarea"
                maxlength="200"
                placeholder="一年后什么必须为真,你才会承认自己赢了?"
              />
            </div>
          </GlassCard>
          <GlassCard>
            <SectionLabel :icon="Swords">Boss 战(这个月目标)</SectionLabel>
            <p class="muted-text">这个月要攻克的具体里程碑。要服务于一年目标。</p>
            <div class="form-field">
              <label class="form-label">标题</label>
              <input
                v-model="monthProject"
                class="form-input"
                maxlength="32"
                placeholder="例如:连续 30 天跑通完整闭环"
              />
            </div>
            <div class="form-field">
              <label class="form-label">说明</label>
              <textarea
                v-model="monthProjectDescription"
                class="form-textarea"
                maxlength="160"
                placeholder="做完这件事,你会拿到什么经验值?"
              />
            </div>
          </GlassCard>
        </template>

        <GlassCard v-else>
          <SectionLabel :icon="Rocket">今天就启动</SectionLabel>
          <p class="muted-text">
            写一条今天就能完成的真实动作。
            日常会保留目标偏航检查和晚上证据审查;原文 9 题只在你开启重启日时按时间段触发。
          </p>
          <div class="form-field">
            <label class="form-label">今天先做什么</label>
            <input
              v-model="proofTitle"
              class="form-input"
              maxlength="32"
              placeholder="今天可以真实完成的一个动作"
            />
            <textarea
              v-model="proofDescription"
              class="form-textarea"
              maxlength="120"
              placeholder="可选:补一句什么算完成。"
            />
          </div>
          <div class="reminder-pair">
            <div class="reminder-pair__item">
              <div class="reminder-pair__copy">
                <span class="form-label">早晨开掘</span>
                <span class="muted-text">睁开眼就先问自己几个问题。</span>
              </div>
              <input
                v-model="morningReminderTime"
                type="time"
                class="form-input reminder-pair__time"
              />
            </div>
            <div class="reminder-pair__item">
              <div class="reminder-pair__copy">
                <span class="form-label">晚上回顾</span>
                <span class="muted-text">把今天压成明天的方向。</span>
              </div>
              <input
                v-model="nightReminderTime"
                type="time"
                class="form-input reminder-pair__time"
              />
            </div>
          </div>
          <p class="faint-text">
            想跑完整重启日时,进入「早晨开掘」或在「提醒设置」里开启今日重启提醒。
          </p>
        </GlassCard>

        <footer class="onboarding__foot">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="currentStep === 0"
            @click="prevStep"
          >
            <ChevronLeft :size="14" :stroke-width="iconStroke" />
            <span>上一步</span>
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            <span>{{
              currentStep === steps.length - 1 ? "完成,进入今日" : "下一步"
            }}</span>
            <ChevronRight :size="14" :stroke-width="iconStroke" />
          </button>
        </footer>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Rocket,
  Swords,
  Target,
} from "lucide-vue-next";
import {
  tokens,
  useAppStore,
  type ReminderRule,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

const headerDesc =
  "几分钟把方向、身份、目标占住位。每一步都可以稍后改。";

const steps = [
  { short: "方向", kicker: "STEP 1 · 方向", title: "先把方向定住:你要去哪,你不要回到哪。", description: "这一步只定方向。" },
  { short: "身份", kicker: "STEP 2 · 身份", title: "用一句话决定你今天起按什么身份行动。", description: "身份句拉齐行为,反身份阻止你退回旧版本。" },
  { short: "目标", kicker: "STEP 3 · 目标层级", title: "把一年方向和这个月要拿下的事说清楚。", description: "一年定方向,一月定具体里程碑。" },
  { short: "启动", kicker: "STEP 4 · 启动", title: "设一条今天的动作和提醒时间。", description: "日常提醒先跟目标推进走。" },
] as const;

const visionText = computed({
  get: () => store.state.data.visionProfile.visionText,
  set: (v: string) => store.updateVisionProfile({ visionText: v }),
});
const antiVisionText = computed({
  get: () => store.state.data.visionProfile.antiVisionText,
  set: (v: string) => store.updateVisionProfile({ antiVisionText: v }),
});
const identityStatement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (v: string) => store.updateIdentityProfile({ statement: v }),
});
const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (v: string) => store.updateIdentityProfile({ antiIdentityText: v }),
});
const yearGoal = computed({
  get: () => store.state.data.visionProfile.yearGoal,
  set: (v: string) => store.updateVisionProfile({ yearGoal: v }),
});
const yearGoalDescription = computed({
  get: () => store.state.data.visionProfile.yearGoalDescription,
  set: (v: string) => store.updateVisionProfile({ yearGoalDescription: v }),
});
const monthProject = computed({
  get: () => store.state.data.visionProfile.monthProject,
  set: (v: string) => store.updateVisionProfile({ monthProject: v }),
});
const monthProjectDescription = computed({
  get: () => store.state.data.visionProfile.monthProjectDescription,
  set: (v: string) => store.updateVisionProfile({ monthProjectDescription: v }),
});

const currentStep = ref(0);
const proofTitle = ref("");
const proofDescription = ref("");
const morningReminderTime = ref("07:30");
const nightReminderTime = ref("21:30");

const stepMeta = computed(() => steps[currentStep.value] ?? steps[0]);
const progress = computed(() => ((currentStep.value + 1) / steps.length) * 100);

const canProceed = computed(() => {
  if (currentStep.value === 0)
    return Boolean(visionText.value.trim() && antiVisionText.value.trim());
  if (currentStep.value === 1)
    return Boolean(
      identityStatement.value.trim() && antiIdentityText.value.trim(),
    );
  if (currentStep.value === 2)
    return Boolean(yearGoal.value.trim() && monthProject.value.trim());
  return Boolean(
    proofTitle.value.trim() &&
      morningReminderTime.value &&
      nightReminderTime.value,
  );
});

function prevStep() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function nextStep() {
  if (!canProceed.value) return;
  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
    return;
  }
  finish();
}

function buildReminder(
  kind: "morning" | "day" | "night" | "commute",
  hour: number,
  minute: number,
  label: string,
  message: string,
  promptKey?: string,
  daysOfWeek?: number[],
): ReminderRule {
  return {
    id: `reminder-${kind}-${promptKey ?? Math.random().toString(36).slice(2, 6)}`,
    kind,
    promptKey,
    label,
    hour,
    minute,
    enabled: true,
    daysOfWeek,
    deliveryMode: "system-notification",
    subscriptionStatus: "accepted",
    message,
    snoozedUntil: null,
  };
}

function parseTime(raw: string): [number, number] {
  const [h, m] = raw.split(":").map(Number);
  return [Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0];
}

function buildAllReminders(): ReminderRule[] {
  const [mh, mm] = parseTime(morningReminderTime.value);
  const [nh, nm] = parseTime(nightReminderTime.value);

  const reminders: ReminderRule[] = [
    buildReminder(
      "morning",
      mh,
      mm,
      "早晨开掘",
      "如果今天什么都不变,我能接受吗?打开「一天流程」继续未答的题。",
      "morning-excavation",
    ),
    buildReminder(
      "day",
      15,
      15,
      "目标偏航检查",
      "你今天最重要的事推进了吗?如果没有,今晚你准备拿什么借口安慰自己?",
      "daily-course-check",
    ),
    buildReminder(
      "night",
      nh,
      nm,
      "晚上证据审查",
      "今天留下的证据,配得上你说的目标吗?写下今晚 3 件事。",
      "night-synthesis",
    ),
  ];

  return reminders;
}

function finish() {
  store.completeOnboarding({
    visionProfile: {
      ...store.state.data.visionProfile,
      constraints: [...store.state.data.visionProfile.constraints],
    },
    identityProfile: {
      ...store.state.data.identityProfile,
      principles: [...store.state.data.identityProfile.principles],
    },
    proofRules: [
      {
        id: "rule-first",
        title: proofTitle.value.trim(),
        description: proofDescription.value.trim(),
        cadence: "daily",
        active: true,
        sortOrder: 1,
      },
    ],
    reminderRules: buildAllReminders(),
  });
  router.push("/today");
}

function goJourney() {
  router.push("/journey/morning");
}
</script>

<style lang="scss" scoped>
.onboarding-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.onboarding__frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
}
.onboarding__title {
  margin: 0;
  font-size: var(--si-font-xl);
  font-weight: 600;
  line-height: 1.35;
  color: var(--si-color-text-main);
}
.onboarding__steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.onboarding__step {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-card-soft);
}
.onboarding__step--active {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
}
.onboarding__step-index {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}
.onboarding__step-title {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
}
.onboarding__lite-hint {
  margin: 0;
  font-size: var(--si-font-xs);
}
.onboarding__inline-link {
  background: transparent;
  border: 0;
  color: var(--si-color-brand-text);
  text-decoration: underline;
  cursor: pointer;
  padding: 0 2px;
  font-size: inherit;
}
.reminder-pair {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reminder-pair__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-inset);
}
.reminder-pair__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.reminder-pair__time {
  width: 140px;
  text-align: center;
}
.onboarding__foot {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;
}
</style>
