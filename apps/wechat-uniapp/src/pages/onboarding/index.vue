<template>
  <PageShell title="初始化" topbar-mode="tab" compact>
    <view class="onboarding-page">
      <view class="onboarding-hero">
        <SectionLabel>三步启动</SectionLabel>
        <text class="onboarding-hero__title">{{ stepTitle }}</text>
        <text class="muted-text">{{ stepDescription }}</text>

        <view class="progress-track">
          <view class="progress-bar" :style="{ width: `${progressPercent}%` }" />
        </view>
      </view>

      <view class="onboarding-steps">
        <view
          v-for="(item, index) in steps"
          :key="item.short"
          class="onboarding-step"
          :class="{ 'onboarding-step--active': currentStep === index }"
        >
          <text class="onboarding-step__index">0{{ index + 1 }}</text>
          <text class="onboarding-step__title">{{ item.short }}</text>
        </view>
      </view>

      <GlassCard v-if="currentStep === 0" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">愿景</text>
          <textarea
            v-model="visionText"
            class="textarea-shell"
            maxlength="260"
            auto-height
            placeholder="写下你真正想去的生活画面。"
          />
        </view>

        <view class="field-block">
          <text class="field-label">反愿景</text>
          <textarea
            v-model="antiVisionText"
            class="textarea-shell"
            maxlength="220"
            auto-height
            placeholder="写下你再也不想回去的旧状态。"
          />
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 1" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">身份句</text>
          <input
            v-model="identityStatement"
            class="input-shell"
            maxlength="40"
            placeholder="例如：我是毫不犹豫采取大量行动的人"
          />
        </view>

        <view class="field-block">
          <text class="field-label">反身份</text>
          <textarea
            v-model="antiIdentityText"
            class="textarea-shell"
            maxlength="220"
            auto-height
            placeholder="写清楚你不再愿意继续成为谁。"
          />
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 2" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">一年目标 · 主线任务</text>
          <text class="muted-text">一年后你必须看到什么变化,才算真的打破了旧模式?</text>
          <input
            v-model="yearGoal"
            class="input-shell"
            maxlength="32"
            placeholder="例如:用 365 天彻底重建日常系统"
          />
          <textarea
            v-model="yearGoalDescription"
            class="textarea-shell onboarding-card__small-textarea"
            maxlength="200"
            auto-height
            placeholder="一年后什么必须为真,你才会承认自己赢了?"
          />
        </view>

        <view class="field-block">
          <text class="field-label">一月项目 · Boss 战</text>
          <text class="muted-text">这个月要攻克的具体里程碑。它要服务于一年目标。</text>
          <input
            v-model="monthProject"
            class="input-shell"
            maxlength="32"
            placeholder="例如:连续 30 天跑通完整闭环"
          />
          <textarea
            v-model="monthProjectDescription"
            class="textarea-shell onboarding-card__small-textarea"
            maxlength="160"
            auto-height
            placeholder="做完这件事,你会拿到什么经验值?"
          />
        </view>
      </GlassCard>

      <GlassCard v-else card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">今天先做什么</text>
          <input
            v-model="proofTitle"
            class="input-shell"
            maxlength="32"
            placeholder="写一条今天可以真实完成的动作"
          />
          <textarea
            v-model="proofDescription"
            class="textarea-shell onboarding-card__small-textarea"
            maxlength="120"
            auto-height
            placeholder="可选:补一句判断标准。"
          />
        </view>

        <view class="reminder-pair">
          <view class="reminder-pair__item">
            <view class="reminder-pair__copy">
              <text class="field-label">白天提醒</text>
              <text class="muted-text">把你从惯性里拉回来。</text>
            </view>
            <picker mode="time" :value="dayReminderTime" @change="handleDayTimeChange">
              <view class="tag-chip tag-chip--active reminder-pair__time">{{ dayReminderTime }}</view>
            </picker>
          </view>

          <view class="reminder-pair__item">
            <view class="reminder-pair__copy">
              <text class="field-label">夜间复盘</text>
              <text class="muted-text">把今天整理成明天的修正。</text>
            </view>
            <picker mode="time" :value="nightReminderTime" @change="handleNightTimeChange">
              <view class="tag-chip tag-chip--active reminder-pair__time">{{ nightReminderTime }}</view>
            </picker>
          </view>
        </view>
      </GlassCard>
    </view>

    <template #footer>
      <view class="onboarding-footer">
        <button
          class="ghost-button onboarding-footer__button"
          :disabled="currentStep === 0"
          @tap="goPrevStep"
        >
          上一步
        </button>
        <button
          class="pill-button onboarding-footer__button"
          :disabled="!canProceed"
          @tap="goNextStep"
        >
          {{ currentStep === steps.length - 1 ? "进入今日" : "下一步" }}
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderRule } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();
const currentStep = ref(0);
const proofTitle = ref("");
const proofDescription = ref("");
const dayReminderTime = ref("11:30");
const nightReminderTime = ref("21:30");

const steps = [
  {
    short: "方向",
    title: "先写清楚你要去哪里,以及你不要回到哪里。",
    description: "这一步只定方向,不做长篇设置。",
  },
  {
    short: "身份",
    title: "用一句话决定你今天要按什么身份行动。",
    description: "身份句负责拉齐行为,反身份负责阻止你退回旧版本。",
  },
  {
    short: "目标",
    title: "把一年目标和这个月的项目说清楚。",
    description: "原文里这叫主线任务和 Boss 战。一年定方向,一月定里程碑。",
  },
  {
    short: "启动",
    title: "设置今天第一条证明动作和提醒时间。",
    description: "先让系统跑起来,后续再到道路和身份页细调。",
  },
] as const;

const visionText = computed({
  get: () => store.state.data.visionProfile.visionText,
  set: (value: string) => store.updateVisionProfile({ visionText: value }),
});

const antiVisionText = computed({
  get: () => store.state.data.visionProfile.antiVisionText,
  set: (value: string) => store.updateVisionProfile({ antiVisionText: value }),
});

const identityStatement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (value: string) => store.updateIdentityProfile({ statement: value }),
});

const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (value: string) => store.updateIdentityProfile({ antiIdentityText: value }),
});

const progressPercent = computed(() => ((currentStep.value + 1) / steps.length) * 100);
const stepTitle = computed(() => steps[currentStep.value]?.title ?? steps[0].title);
const stepDescription = computed(() => steps[currentStep.value]?.description ?? steps[0].description);
const yearGoal = computed({
  get: () => store.state.data.visionProfile.yearGoal,
  set: (value: string) => store.updateVisionProfile({ yearGoal: value }),
});

const yearGoalDescription = computed({
  get: () => store.state.data.visionProfile.yearGoalDescription,
  set: (value: string) => store.updateVisionProfile({ yearGoalDescription: value }),
});

const monthProject = computed({
  get: () => store.state.data.visionProfile.monthProject,
  set: (value: string) => store.updateVisionProfile({ monthProject: value }),
});

const monthProjectDescription = computed({
  get: () => store.state.data.visionProfile.monthProjectDescription,
  set: (value: string) => store.updateVisionProfile({ monthProjectDescription: value }),
});

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return Boolean(visionText.value.trim() && antiVisionText.value.trim());
  }

  if (currentStep.value === 1) {
    return Boolean(identityStatement.value.trim() && antiIdentityText.value.trim());
  }

  if (currentStep.value === 2) {
    return Boolean(yearGoal.value.trim() && monthProject.value.trim());
  }

  return Boolean(proofTitle.value.trim() && dayReminderTime.value && nightReminderTime.value);
});

function formatReminder(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseReminder(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return {
    hour: Number.isNaN(hour) ? 9 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
}

function eventValue(event: UniValueEvent) {
  return event.detail?.value ?? "";
}

function createReminderRule(input: {
  source?: ReminderRule;
  kind: "day" | "night";
  time: string;
  label: string;
  message: string;
}): ReminderRule {
  const parsed = parseReminder(input.time);
  return {
    id: input.source?.id ?? `reminder-${input.kind}-onboarding`,
    kind: input.kind,
    label: input.label,
    hour: parsed.hour,
    minute: parsed.minute,
    enabled: true,
    deliveryMode: "in-app",
    subscriptionStatus: "pending",
    message: input.message,
    snoozedUntil: null,
  };
}

function hydrateDrafts() {
  const activeRule =
    store.activeProofRules()[0] ??
    store.state.data.proofRules[0] ??
    null;
  const dayReminder =
    store.state.data.reminderRules.find((rule) => rule.kind === "day") ??
    null;
  const nightReminder =
    store.state.data.reminderRules.find((rule) => rule.kind === "night") ??
    null;

  proofTitle.value = activeRule?.title ?? "";
  proofDescription.value = activeRule?.description ?? "";
  dayReminderTime.value = dayReminder ? formatReminder(dayReminder.hour, dayReminder.minute) : "11:30";
  nightReminderTime.value = nightReminder ? formatReminder(nightReminder.hour, nightReminder.minute) : "21:30";
}

function detectSuggestedStep() {
  // 永远从第一步开始,不替用户跳步。
  return 0;
}

function handleDayTimeChange(event: UniValueEvent) {
  dayReminderTime.value = eventValue(event) || dayReminderTime.value;
}

function handleNightTimeChange(event: UniValueEvent) {
  nightReminderTime.value = eventValue(event) || nightReminderTime.value;
}

function goPrevStep() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function goNextStep() {
  if (!canProceed.value) {
    uni.showToast({
      title: "先完成当前步骤",
      icon: "none",
    });
    return;
  }

  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
    return;
  }

  const existingDayReminder = store.state.data.reminderRules.find((rule) => rule.kind === "day");
  const existingNightReminder = store.state.data.reminderRules.find((rule) => rule.kind === "night");

  store.completeOnboarding({
    visionProfile: {
      ...store.state.data.visionProfile,
    },
    identityProfile: {
      ...store.state.data.identityProfile,
      beliefs: [...store.state.data.identityProfile.beliefs],
    },
    proofRules: [
      {
        id: store.activeProofRules()[0]?.id ?? "rule-onboarding-proof",
        title: proofTitle.value.trim(),
        description: proofDescription.value.trim(),
        cadence: "daily",
        active: true,
        sortOrder: 1,
      },
    ],
    reminderRules: [
      createReminderRule({
        source: existingDayReminder,
        kind: "day",
        time: dayReminderTime.value,
        label: "白天对齐提醒",
        message: "暂停 30 秒，确认你现在做的事是否像你定义的那个人。",
      }),
      createReminderRule({
        source: existingNightReminder,
        kind: "night",
        time: nightReminderTime.value,
        label: "夜间复盘提醒",
        message: "把今天重新整合成明天的燃料，完成你的夜间复盘。",
      }),
    ],
  });

  uni.showToast({
    title: "系统已启动",
    icon: "success",
  });

  setTimeout(() => {
    switchToTab(TODAY_PAGE_PATH);
  }, 180);
}

onShow(() => {
  store.initialize();
  if (store.state.data.onboardingCompleted) {
    switchToTab(TODAY_PAGE_PATH);
    return;
  }

  hydrateDrafts();
  currentStep.value = detectSuggestedStep();
});
</script>

<style scoped lang="scss">
.onboarding-page,
.onboarding-hero,
.onboarding-card,
.field-block,
.reminder-pair,
.reminder-pair__copy {
  display: flex;
  flex-direction: column;
}

.onboarding-page {
  gap: 24rpx;
}

.onboarding-hero,
.onboarding-card,
.field-block,
.reminder-pair {
  gap: 18rpx;
}

.onboarding-hero__title {
  color: #f5f5f5;
  font-size: 38rpx;
  line-height: 1.34;
}

.onboarding-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.onboarding-step {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 18rpx 16rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 18rpx;
  background: rgba(24, 24, 27, 0.28);
}

.onboarding-step--active {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.18);
}

.onboarding-step__index {
  color: #71717a;
  font-size: 18rpx;
}

.onboarding-step__title {
  color: #d4d4d8;
  font-size: 22rpx;
}

.field-label {
  color: #f4f4f5;
  font-size: 24rpx;
  line-height: 1.4;
}

.onboarding-card__small-textarea {
  min-height: 136rpx;
}

.reminder-pair__item {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(10, 10, 11, 0.34);
}

.reminder-pair__copy {
  flex: 1;
  gap: 6rpx;
  min-width: 0;
}

.reminder-pair__time {
  min-width: 132rpx;
  text-align: center;
}

.onboarding-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.onboarding-footer__button {
  justify-content: center;
}
</style>
