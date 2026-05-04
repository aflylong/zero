<template>
  <PageShell
    title="初始化"
    topbar-mode="secondary"
    back-url="/pages/today/index"
  >
    <view class="onboarding-page">
      <view class="onboarding-hero">
        <SectionLabel>三步启动</SectionLabel>
        <text class="onboarding-hero__title">{{ stepTitle }}</text>
        <text class="body-text">{{ stepDescription }}</text>

        <view class="progress-track">
          <view class="progress-bar" :style="{ width: `${progressPercent}%` }" />
        </view>

        <view class="onboarding-steps">
          <view
            v-for="(item, index) in steps"
            :key="item.title"
            class="onboarding-step"
            :class="{ 'onboarding-step--active': currentStep === index }"
          >
            <text class="onboarding-step__index">0{{ index + 1 }}</text>
            <text class="onboarding-step__title">{{ item.short }}</text>
          </view>
        </view>
      </view>

      <GlassCard v-if="currentStep === 0" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">我想成为怎样的人生</text>
          <textarea
            v-model="visionText"
            class="textarea-shell"
            maxlength="300"
            auto-height
            placeholder="写下你真正想去的生活画面。"
          />
        </view>

        <view class="field-block">
          <text class="field-label">我拒绝回去的版本</text>
          <textarea
            v-model="antiVisionText"
            class="textarea-shell"
            maxlength="240"
            auto-height
            placeholder="写下那个你再也不想继续扮演的人。"
          />
        </view>

        <view class="field-block">
          <text class="field-label">为什么现在必须改变</text>
          <textarea
            v-model="whyChangeText"
            class="textarea-shell"
            maxlength="240"
            auto-height
            placeholder="把情绪换成理由，把理由换成行动压力。"
          />
        </view>

        <view class="field-block">
          <text class="field-label">当前主线任务</text>
          <input
            v-model="mainQuestTitle"
            class="input-shell"
            maxlength="24"
            placeholder="给这一阶段的任务起一个名字"
          />
          <textarea
            v-model="mainQuestDescription"
            class="textarea-shell"
            maxlength="220"
            auto-height
            placeholder="说明这条主线为什么值得你每天推进。"
          />
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 1" card-class="onboarding-card">
        <view class="field-block">
          <text class="field-label">身份陈述</text>
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

        <view class="field-block">
          <view class="field-row">
            <text class="field-label">核心信念</text>
            <button class="ghost-button" @tap="store.addBelief()">新增一条</button>
          </view>

          <view class="belief-list">
            <view
              v-for="(belief, index) in store.state.data.identityProfile.beliefs"
              :key="`belief-${index}`"
              class="belief-row"
            >
              <input
                :value="belief"
                class="input-shell belief-row__input"
                maxlength="40"
                placeholder="写一句会驱动行动的核心信念"
                @input="handleBeliefInput(index, $event)"
              />
              <button class="danger-button" @tap="store.removeBelief(index)">删除</button>
            </view>
          </view>
        </view>
      </GlassCard>

      <GlassCard v-else card-class="onboarding-card">
        <view class="field-block">
          <view class="field-row">
            <text class="field-label">证明法则</text>
            <button class="ghost-button" @tap="store.createProofRule()">新增法则</button>
          </view>

          <view class="rule-list">
            <view
              v-for="rule in store.state.data.proofRules"
              :key="rule.id"
              class="onboarding-rule"
            >
              <view class="field-row">
                <text class="tag-chip" :class="{ 'tag-chip--active': rule.active }">
                  {{ rule.active ? "生效中" : "已停用" }}
                </text>
                <view class="action-row">
                  <button class="ghost-button" @tap="toggleRuleActive(rule)">
                    {{ rule.active ? "停用" : "启用" }}
                  </button>
                  <button class="danger-button" @tap="store.removeProofRule(rule.id)">删除</button>
                </view>
              </view>
              <input
                :value="rule.title"
                class="input-shell"
                maxlength="32"
                placeholder="法则标题"
                @input="updateRuleField(rule, 'title', $event)"
              />
              <textarea
                :value="rule.description"
                class="textarea-shell onboarding-rule__textarea"
                maxlength="120"
                auto-height
                placeholder="把它写成可以真的完成的动作。"
                @input="updateRuleField(rule, 'description', $event)"
              />
            </view>
          </view>
        </view>

        <view class="field-block">
          <text class="field-label">提醒时间</text>
          <view class="reminder-list">
            <view
              v-for="rule in store.state.data.reminderRules"
              :key="rule.id"
              class="reminder-row"
            >
              <view class="reminder-row__copy">
                <text class="reminder-row__title">{{ rule.label }}</text>
                <text class="muted-text">{{ rule.message }}</text>
              </view>
              <view class="reminder-row__meta">
                <button class="ghost-button" @tap="toggleReminderEnabled(rule)">
                  {{ rule.enabled ? "已开启" : "已关闭" }}
                </button>
                <picker
                  mode="time"
                  :value="formatReminder(rule.hour, rule.minute)"
                  @change="handleReminderTimeChange(rule.id, $event)"
                >
                  <view class="tag-chip tag-chip--active">
                    {{ formatReminder(rule.hour, rule.minute) }}
                  </view>
                </picker>
              </view>
            </view>
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
          {{ currentStep === steps.length - 1 ? "完成启动" : "下一步" }}
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
import { useAppStore } from "@/stores/useAppStore";
import type { ProofRule, ReminderRule } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();
const currentStep = ref(0);

const steps = [
  {
    short: "方向",
    title: "先写清楚你想去哪里，以及为什么现在必须改变。",
    description: "愿景和反愿景决定你往哪走，主线任务决定这一周如何真正推进。",
  },
  {
    short: "身份",
    title: "先决定你是谁，再给这句话配上会驱动行动的信念。",
    description: "身份句负责定调，核心信念负责在你犹豫时把行为重新拉回来。",
  },
  {
    short: "系统",
    title: "把证明法则和提醒时间设好，让系统从今天开始自动运行。",
    description: "第一版先用站内提醒，后面接微信订阅消息时会沿用同一套模型。",
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

const whyChangeText = computed({
  get: () => store.state.data.visionProfile.whyChangeText,
  set: (value: string) => store.updateVisionProfile({ whyChangeText: value }),
});

const mainQuestTitle = computed({
  get: () => store.state.data.visionProfile.mainQuestTitle,
  set: (value: string) => store.updateVisionProfile({ mainQuestTitle: value }),
});

const mainQuestDescription = computed({
  get: () => store.state.data.visionProfile.mainQuestDescription,
  set: (value: string) => store.updateVisionProfile({ mainQuestDescription: value }),
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
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return Boolean(
      visionText.value.trim() &&
        antiVisionText.value.trim() &&
        whyChangeText.value.trim() &&
        mainQuestTitle.value.trim() &&
        mainQuestDescription.value.trim(),
    );
  }

  if (currentStep.value === 1) {
    return Boolean(
      identityStatement.value.trim() &&
        antiIdentityText.value.trim() &&
        store.state.data.identityProfile.beliefs.some((belief) => belief.trim()),
    );
  }

  return store.state.data.proofRules.some(
    (rule) => rule.active && rule.title.trim() && rule.description.trim(),
  );
});

function formatReminder(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function detectSuggestedStep() {
  const step0Ready = Boolean(
    visionText.value.trim() &&
      antiVisionText.value.trim() &&
      whyChangeText.value.trim() &&
      mainQuestTitle.value.trim() &&
      mainQuestDescription.value.trim(),
  );
  const step1Ready = Boolean(
    identityStatement.value.trim() &&
      antiIdentityText.value.trim() &&
      store.state.data.identityProfile.beliefs.some((belief) => belief.trim()),
  );

  if (!step0Ready) {
    return 0;
  }

  if (!step1Ready) {
    return 1;
  }

  return 2;
}

function eventValue(event: UniValueEvent) {
  return event.detail?.value ?? "";
}

function handleBeliefInput(index: number, event: UniValueEvent) {
  store.updateBelief(index, eventValue(event));
}

function updateRuleField(rule: ProofRule, field: "title" | "description", event: UniValueEvent) {
  store.upsertProofRule({
    ...rule,
    [field]: eventValue(event),
  });
}

function toggleRuleActive(rule: ProofRule) {
  store.upsertProofRule({
    ...rule,
    active: !rule.active,
  });
}

function toggleReminderEnabled(rule: ReminderRule) {
  store.updateReminderRule(rule.id, {
    enabled: !rule.enabled,
  });
}

function handleReminderTimeChange(ruleId: string, event: UniValueEvent) {
  const value = eventValue(event);
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return;
  }

  store.updateReminderRule(ruleId, {
    hour,
    minute,
  });
}

function goPrevStep() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function goToToday() {
  uni.reLaunch({ url: "/pages/today/index" });
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

  store.completeOnboarding({
    visionProfile: { ...store.state.data.visionProfile },
    identityProfile: {
      ...store.state.data.identityProfile,
      beliefs: [...store.state.data.identityProfile.beliefs],
    },
    proofRules: store.state.data.proofRules.map((rule) => ({ ...rule })),
    reminderRules: store.state.data.reminderRules.map((rule) => ({ ...rule })),
  });

  uni.showToast({
    title: "系统已启动",
    icon: "success",
  });

  setTimeout(() => {
    goToToday();
  }, 180);
}

onShow(() => {
  store.initialize();
  if (store.state.data.onboardingCompleted) {
    goToToday();
    return;
  }

  currentStep.value = detectSuggestedStep();
});
</script>

<style scoped lang="scss">
.onboarding-page,
.onboarding-hero,
.onboarding-card,
.field-block,
.belief-list,
.rule-list,
.reminder-list,
.reminder-row,
.reminder-row__copy {
  display: flex;
  flex-direction: column;
}

.onboarding-page {
  gap: 24rpx;
}

.onboarding-hero,
.onboarding-card,
.field-block,
.belief-list,
.rule-list,
.reminder-list,
.reminder-row {
  gap: 18rpx;
}

.onboarding-hero__title,
.reminder-row__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
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

.field-row,
.belief-row,
.reminder-row__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.belief-row {
  align-items: stretch;
}

.belief-row__input {
  flex: 1;
}

.onboarding-rule {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(10, 10, 11, 0.34);
}

.onboarding-rule__textarea {
  min-height: 140rpx;
}

.reminder-row {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(10, 10, 11, 0.34);
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
