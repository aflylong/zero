<template>
  <PageShell title="快速设置" topbar-mode="secondary" back-url="/pages/today/index" compact>
    <view class="onboarding-page">
      <view class="onboarding-hero">
        <SectionLabel>四步启动</SectionLabel>
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

      <text class="onboarding-tip">
        想跑完整流程(原文 22 题)?
        <text class="onboarding-tip__link" @tap="goJourney">点这里去「一天流程」</text>
      </text>

      <GlassCard v-if="currentStep === 0" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">愿景</text>
          <textarea
            :value="visionText"
            class="textarea-shell"
            maxlength="260"
            auto-height
            placeholder="写下你真正想去的生活画面。"
            @input="onVisionInput($event)"
          />
        </view>

        <view class="field-block">
          <text class="field-label">反愿景</text>
          <textarea
            :value="antiVisionText"
            class="textarea-shell"
            maxlength="220"
            auto-height
            placeholder="写下你再也不想回去的旧状态。"
            @input="onAntiVisionInput($event)"
          />
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 1" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">身份句</text>
          <input
            :value="identityStatement"
            class="input-shell"
            maxlength="40"
            placeholder="例如:我是想到就动、绝不拖到明天的人"
            @input="onIdentityInput($event)"
          />
        </view>

        <view class="field-block">
          <text class="field-label">必须放弃的旧身份</text>
          <textarea
            :value="antiIdentityText"
            class="textarea-shell"
            maxlength="220"
            auto-height
            placeholder="写清楚你不再愿意继续成为谁。"
            @input="onAntiIdentityInput($event)"
          />
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 2" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">一年方向</text>
          <text class="muted-text">一年后你必须看到什么变化,才算真的打破了旧模式?</text>
          <input
            :value="yearGoal"
            class="input-shell"
            maxlength="32"
            placeholder="例如:用 365 天彻底重建日常系统"
            @input="onYearGoalInput($event)"
          />
          <textarea
            :value="yearGoalDescription"
            class="textarea-shell onboarding-card__small-textarea"
            maxlength="200"
            auto-height
            placeholder="一年后什么必须为真,你才会承认自己赢了?"
            @input="onYearGoalDescInput($event)"
          />
        </view>

        <view class="field-block">
          <text class="field-label">Boss 战(这个月目标)</text>
          <text class="muted-text">这个月要攻克的具体里程碑。它要服务于一年目标。</text>
          <input
            :value="monthProject"
            class="input-shell"
            maxlength="32"
            placeholder="例如:连续 30 天跑通完整闭环"
            @input="onMonthProjectInput($event)"
          />
          <textarea
            :value="monthProjectDescription"
            class="textarea-shell onboarding-card__small-textarea"
            maxlength="160"
            auto-height
            placeholder="做完这件事,你会拿到什么经验值?"
            @input="onMonthDescInput($event)"
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
              <text class="field-label">早晨开掘</text>
              <text class="muted-text">睁开眼就先问自己几个问题。</text>
            </view>
            <picker mode="time" :value="morningReminderTime" @change="handleMorningTimeChange">
              <view class="tag-chip tag-chip--active reminder-pair__time">{{ morningReminderTime }}</view>
            </picker>
          </view>

          <view class="reminder-pair__item">
            <view class="reminder-pair__copy">
              <text class="field-label">晚上回顾</text>
              <text class="muted-text">把今天压成明天的方向。</text>
            </view>
            <picker mode="time" :value="nightReminderTime" @change="handleNightTimeChange">
              <view class="tag-chip tag-chip--active reminder-pair__time">{{ nightReminderTime }}</view>
            </picker>
          </view>
        </view>

        <text class="muted-text">
          白天 6 个时间点和 3 个通勤反思会种好默认推送时间。可以在「提醒设置」里随时调整或关闭。
        </text>
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
import { dayPrompts } from "@/static/content/dayPrompts";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderRule } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();
const currentStep = ref(0);
const proofTitle = ref("");
const proofDescription = ref("");
const morningReminderTime = ref("07:30");
const nightReminderTime = ref("21:30");

const steps = [
  {
    short: "方向",
    title: "先把方向定住:你要去哪,你不要回到哪。",
    description: "这一步只定方向,后面再细。",
  },
  {
    short: "身份",
    title: "用一句话决定你今天起按什么身份行动。",
    description: "身份句拉齐行为,反身份阻止你退回旧版本。",
  },
  {
    short: "目标",
    title: "把一年目标和这个月的项目说清楚。",
    description: "一年定方向,一月定具体里程碑。一年定方向,一月定里程碑。",
  },
  {
    short: "启动",
    title: "设一条今天的动作和提醒时间。",
    description: "9 条白天提醒会自动种好。",
  },
] as const;

const visionText = computed(() => store.state.data.visionProfile.visionText);
const antiVisionText = computed(() => store.state.data.visionProfile.antiVisionText);
const identityStatement = computed(() => store.state.data.identityProfile.statement);
const antiIdentityText = computed(() => store.state.data.identityProfile.antiIdentityText);
const yearGoal = computed(() => store.state.data.visionProfile.yearGoal);
const yearGoalDescription = computed(() => store.state.data.visionProfile.yearGoalDescription);
const monthProject = computed(() => store.state.data.visionProfile.monthProject);
const monthProjectDescription = computed(() => store.state.data.visionProfile.monthProjectDescription);

function evtVal(e: UniValueEvent): string {
  return String(e.detail?.value ?? "");
}

function onVisionInput(e: UniValueEvent) {
  store.updateVisionProfile({ visionText: evtVal(e) });
}
function onAntiVisionInput(e: UniValueEvent) {
  store.updateVisionProfile({ antiVisionText: evtVal(e) });
}
function onIdentityInput(e: UniValueEvent) {
  store.updateIdentityProfile({ statement: evtVal(e) });
}
function onAntiIdentityInput(e: UniValueEvent) {
  store.updateIdentityProfile({ antiIdentityText: evtVal(e) });
}
function onYearGoalInput(e: UniValueEvent) {
  store.updateVisionProfile({ yearGoal: evtVal(e) });
}
function onYearGoalDescInput(e: UniValueEvent) {
  store.updateVisionProfile({ yearGoalDescription: evtVal(e) });
}
function onMonthProjectInput(e: UniValueEvent) {
  store.updateVisionProfile({ monthProject: evtVal(e) });
}
function onMonthDescInput(e: UniValueEvent) {
  store.updateVisionProfile({ monthProjectDescription: evtVal(e) });
}

const progressPercent = computed(() => ((currentStep.value + 1) / steps.length) * 100);
const stepTitle = computed(() => steps[currentStep.value]?.title ?? steps[0].title);
const stepDescription = computed(() => steps[currentStep.value]?.description ?? steps[0].description);

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
  return Boolean(
    proofTitle.value.trim() && morningReminderTime.value && nightReminderTime.value,
  );
});

function parseReminder(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return {
    hour: Number.isNaN(hour) ? 9 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
}

function buildReminder(input: {
  kind: "morning" | "day" | "commute" | "night";
  hour: number;
  minute: number;
  label: string;
  message: string;
  promptKey?: string;
}): ReminderRule {
  return {
    id: `reminder-${input.kind}-${input.promptKey ?? Math.random().toString(36).slice(2, 6)}`,
    kind: input.kind,
    promptKey: input.promptKey,
    label: input.label,
    hour: input.hour,
    minute: input.minute,
    enabled: true,
    deliveryMode: "in-app",
    subscriptionStatus: "pending",
    message: input.message,
    snoozedUntil: null,
  };
}

function buildAllReminders(): ReminderRule[] {
  const m = parseReminder(morningReminderTime.value);
  const n = parseReminder(nightReminderTime.value);

  const list: ReminderRule[] = [
    buildReminder({
      kind: "morning",
      hour: m.hour,
      minute: m.minute,
      label: "早晨开掘",
      message: "如果今天什么都不变,我能接受吗?打开「一天流程」继续未答的题。",
      promptKey: "morning-excavation",
    }),
    buildReminder({
      kind: "night",
      hour: n.hour,
      minute: n.minute,
      label: "晚上回顾",
      message: "晚上 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度。",
      promptKey: "night-synthesis",
    }),
  ];

  for (const dp of dayPrompts) {
    if (dp.kind === "day" && dp.hour !== undefined && dp.minute !== undefined) {
      list.push(
        buildReminder({
          kind: "day",
          hour: dp.hour,
          minute: dp.minute,
          label: dp.label,
          message: dp.question,
          promptKey: dp.key,
        }),
      );
    } else if (dp.kind === "commute") {
      // 通勤题默认时间:W1 早 6:50、W2 中午 12:30、W3 晚 19:00
      const defaults: Record<string, [number, number]> = {
        "w1-commute": [6, 50],
        "w2-commute": [12, 30],
        "w3-commute": [19, 0],
      };
      const [h, m] = defaults[dp.key] ?? [7, 0];
      list.push(
        buildReminder({
          kind: "commute",
          hour: h,
          minute: m,
          label: dp.label,
          message: dp.question,
          promptKey: dp.key,
        }),
      );
    }
  }

  return list;
}

function handleMorningTimeChange(event: UniValueEvent) {
  morningReminderTime.value = evtVal(event) || morningReminderTime.value;
}

function handleNightTimeChange(event: UniValueEvent) {
  nightReminderTime.value = evtVal(event) || nightReminderTime.value;
}

function goPrevStep() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function goNextStep() {
  if (!canProceed.value) {
    uni.showToast({ title: "先完成当前步骤", icon: "none" });
    return;
  }

  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
    return;
  }

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
        id: "rule-onboarding-proof",
        title: proofTitle.value.trim(),
        description: proofDescription.value.trim(),
        cadence: "daily",
        active: true,
        sortOrder: 1,
      },
    ],
    reminderRules: buildAllReminders(),
  });

  uni.showToast({ title: "系统已启动", icon: "success" });
  setTimeout(() => switchToTab(TODAY_PAGE_PATH), 200);
}

function goJourney() {
  uni.navigateTo({ url: "/pages/journey-morning/index" });
}

onShow(() => {
  store.initialize();
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

.onboarding-page { gap: 22rpx; }
.onboarding-hero,
.onboarding-card,
.field-block,
.reminder-pair { gap: 18rpx; }

.onboarding-hero__title {
  color: #f5f5f5;
  font-size: 38rpx;
  line-height: 1.34;
}

.onboarding-tip {
  padding: 16rpx 18rpx;
  border: 1px dashed rgba(82, 82, 91, 0.6);
  border-radius: 16rpx;
  color: #a1a1aa;
  font-size: 24rpx;
  line-height: 1.55;
}

.onboarding-tip__link {
  color: #34d399;
  text-decoration: underline;
}

.onboarding-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
}

.onboarding-step {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 14rpx 12rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 14rpx;
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
  padding: 22rpx;
  border-radius: 22rpx;
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
