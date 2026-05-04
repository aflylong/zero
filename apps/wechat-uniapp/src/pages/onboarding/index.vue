<template>
  <PageShell>
    <view class="section-stack">
      <GradientHeroCard card-class="onboarding-hero">
        <view class="section-stack">
          <text class="hero-title">把第一版系统装进今天。</text>
          <text class="body-text">
            先写清楚你要去的地方、你是谁、以及你打算如何每天证明它。这里的内容会直接成为后续页面和提醒系统的真实数据。
          </text>
          <view class="section-stack onboarding-hero__meta">
            <view class="progress-track">
              <view class="progress-bar" :style="{ width: `${completionPercent}%` }" />
            </view>
            <view class="onboarding-hero__row">
              <text class="muted-text">完成度 {{ completionPercent }}%</text>
              <text class="accent-text">{{ store.state.data.proofRules.length }} 条证明法则</text>
            </view>
          </view>
        </view>
      </GradientHeroCard>

      <GlassCard>
        <SectionLabel>愿景</SectionLabel>
        <view class="section-stack">
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
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>身份</SectionLabel>
        <view class="section-stack">
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
            <view class="section-stack">
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
                <button
                  class="danger-button belief-row__remove"
                  @tap="store.removeBelief(index)"
                >
                  删除
                </button>
              </view>
            </view>
          </view>
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>主线</SectionLabel>
        <view class="section-stack">
          <view class="field-block">
            <text class="field-label">主线任务标题</text>
            <input
              v-model="mainQuestTitle"
              class="input-shell"
              maxlength="24"
              placeholder="给这一阶段的任务起一个名字"
            />
          </view>
          <view class="field-block">
            <text class="field-label">主线任务说明</text>
            <textarea
              v-model="mainQuestDescription"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="说明这条主线为什么值得你每天推进。"
            />
          </view>
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>证明法则</SectionLabel>
        <view class="section-stack">
          <text class="muted-text">
            每条法则都应该是能被完成、被拒绝、被记录的动作，而不是模糊口号。
          </text>
          <view class="section-stack">
            <view
              v-for="rule in store.state.data.proofRules"
              :key="rule.id"
              class="glass-card onboarding-rule"
            >
              <view class="field-row">
                <text class="tag-chip" :class="{ 'tag-chip--active': rule.active }">
                  {{ rule.active ? "生效中" : "已停用" }}
                </text>
                <view class="action-row onboarding-rule__actions">
                  <button class="ghost-button" @tap="toggleRuleActive(rule)">
                    {{ rule.active ? "停用" : "启用" }}
                  </button>
                  <button class="danger-button" @tap="store.removeProofRule(rule.id)">
                    删除
                  </button>
                </view>
              </view>
              <view class="section-stack">
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
          <button class="ghost-button onboarding-add-button" @tap="store.createProofRule()">
            新增证明法则
          </button>
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>提醒预设</SectionLabel>
        <view class="section-stack">
          <text class="muted-text">
            把白天提醒和夜间复盘时间提前设好。完成 onboarding 后，今日页会按这里的时间产生真实站内提醒。
          </text>
          <view class="section-stack">
            <view
              v-for="rule in store.state.data.reminderRules"
              :key="rule.id"
              class="glass-card reminder-row"
            >
              <view class="field-row">
                <view class="section-stack reminder-row__copy">
                  <text class="field-label">{{ rule.label }}</text>
                  <text class="muted-text">{{ rule.message }}</text>
                </view>
                <button class="ghost-button" @tap="toggleReminderEnabled(rule)">
                  {{ rule.enabled ? "已开启" : "已关闭" }}
                </button>
              </view>
              <picker
                mode="time"
                :value="formatReminder(rule.hour, rule.minute)"
                @change="handleReminderTimeChange(rule.id, $event)"
              >
                <view class="tag-chip tag-chip--active reminder-row__time">
                  {{ formatReminder(rule.hour, rule.minute) }}
                </view>
              </picker>
            </view>
          </view>
        </view>
      </GlassCard>

      <view class="action-row onboarding-footer">
        <button class="ghost-button" @tap="goToToday" :disabled="!store.state.data.onboardingCompleted">
          已完成后直接进入今日
        </button>
        <button class="pill-button onboarding-submit" :disabled="!canFinish" @tap="finishOnboarding">
          完成 onboarding
        </button>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { ProofRule, ReminderRule } from "@/types/app";

const store = useAppStore();

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

const completionPercent = computed(() => {
  const checkpoints = [
    visionText.value.trim(),
    antiVisionText.value.trim(),
    whyChangeText.value.trim(),
    mainQuestTitle.value.trim(),
    mainQuestDescription.value.trim(),
    identityStatement.value.trim(),
    antiIdentityText.value.trim(),
    ...store.state.data.identityProfile.beliefs.map((belief) => belief.trim()),
    ...store.state.data.proofRules
      .filter((rule) => rule.active)
      .flatMap((rule) => [rule.title.trim(), rule.description.trim()]),
  ];
  const filled = checkpoints.filter(Boolean).length;
  return Math.round((filled / Math.max(checkpoints.length, 1)) * 100);
});

const canFinish = computed(() => {
  return Boolean(
    visionText.value.trim() &&
      antiVisionText.value.trim() &&
      whyChangeText.value.trim() &&
      mainQuestTitle.value.trim() &&
      mainQuestDescription.value.trim() &&
      identityStatement.value.trim() &&
      antiIdentityText.value.trim() &&
      store.state.data.identityProfile.beliefs.some((belief) => belief.trim()) &&
      store.state.data.proofRules.some(
        (rule) => rule.active && rule.title.trim() && rule.description.trim(),
      ),
  );
});

onShow(() => {
  if (store.state.data.onboardingCompleted) {
    goToToday();
  }
});

function goToToday() {
  uni.reLaunch({ url: "/pages/today/index" });
}

function eventValue(event: Event) {
  return (event as Event & { detail?: { value?: string } }).detail?.value ?? "";
}

function handleBeliefInput(index: number, event: Event) {
  store.updateBelief(index, eventValue(event));
}

function updateRuleField(
  rule: ProofRule,
  field: "title" | "description",
  event: Event,
) {
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

function handleReminderTimeChange(ruleId: string, event: Event) {
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

function formatReminder(hour: ReminderRule["hour"], minute: ReminderRule["minute"]) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function finishOnboarding() {
  if (!canFinish.value) {
    uni.showToast({
      title: "先补齐关键内容",
      icon: "none",
    });
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
</script>

<style scoped lang="scss">
.onboarding-hero {
  position: relative;
  overflow: hidden;
}

.onboarding-hero__meta {
  gap: 14rpx;
}

.onboarding-hero__row,
.field-row,
.belief-row {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.field-label {
  color: #f4f4f5;
  font-size: 24rpx;
  line-height: 1.4;
}

.belief-row {
  align-items: stretch;
}

.belief-row__input {
  flex: 1;
}

.belief-row__remove {
  flex-shrink: 0;
}

.onboarding-rule {
  gap: 22rpx;
  padding: 28rpx;
  border-radius: 26rpx;
}

.reminder-row {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 26rpx;
}

.reminder-row__copy {
  flex: 1;
}

.reminder-row__time {
  align-self: flex-start;
}

.onboarding-rule__actions {
  justify-content: flex-end;
}

.onboarding-rule__textarea {
  min-height: 140rpx;
}

.onboarding-add-button,
.onboarding-submit {
  flex: 1;
  justify-content: center;
}

.onboarding-footer {
  padding-bottom: 12rpx;
}
</style>
