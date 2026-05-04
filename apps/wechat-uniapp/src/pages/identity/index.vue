<template>
  <PageShell tab-key="identity">
    <view class="identity-page">
      <view class="identity-heading">
        <view class="identity-heading__icon">
          <view class="identity-heading__spark" />
        </view>
        <text class="page-title">身份</text>
      </view>

      <view class="identity-section">
        <SectionLabel>你是谁</SectionLabel>
        <view class="identity-statement-panel">
          <text class="identity-statement-panel__text">{{ statementPreview }}</text>
        </view>
      </view>

      <view class="identity-section">
        <view class="identity-collapse" @tap="showAntiIdentity = !showAntiIdentity">
          <text class="identity-collapse__label">你正在抛弃的</text>
          <text class="identity-collapse__chevron" :class="{ 'identity-collapse__chevron--open': showAntiIdentity }">
            ⌄
          </text>
        </view>
        <view v-if="showAntiIdentity" class="identity-anti-panel">
          <text class="identity-anti-panel__text">{{ antiIdentityPreview }}</text>
        </view>
      </view>

      <view class="identity-section">
        <SectionLabel>你要去向何方</SectionLabel>
        <text class="identity-section__headline">{{ visionPreview }}</text>
      </view>

      <view class="identity-section">
        <SectionLabel>核心信念</SectionLabel>
        <view v-if="beliefs.length" class="identity-belief-list">
          <view
            v-for="(belief, index) in beliefs"
            :key="`identity-belief-${index}`"
            class="identity-belief"
          >
            <view class="identity-belief__dot" />
            <text class="identity-belief__text">{{ belief }}</text>
          </view>
        </view>
        <view v-else class="identity-empty">
          <text class="identity-empty__title">还没有核心信念</text>
          <text class="muted-text">先写下一句你愿意反复执行的信念，页面的重心就会立起来。</text>
        </view>
      </view>

      <view class="identity-actions">
        <button class="identity-actions__link" @tap="showEditor = !showEditor">
          {{ showEditor ? "收起编辑区" : "编辑身份" }}
        </button>
        <button v-if="!store.state.data.onboardingCompleted" class="identity-actions__link" @tap="openOnboarding">
          初始化
        </button>
      </view>

      <view v-if="showEditor" class="glass-card identity-editor">
        <view class="identity-editor__fields">
          <view class="field-block">
            <text class="field-label">我是谁</text>
            <input
              v-model="statement"
              class="input-shell"
              maxlength="40"
              placeholder="给自己一条锋利、会驱动行动的身份句子"
            />
          </view>

          <view class="field-block">
            <text class="field-label">我不再是谁</text>
            <textarea
              v-model="antiIdentityText"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="把你拒绝继续扮演的旧版本说清楚。"
            />
          </view>

          <view class="field-block">
            <view class="field-row">
              <text class="field-label">核心信念</text>
              <button class="ghost-button" @tap="store.addBelief()">新增一条</button>
            </view>
            <view class="identity-editor__beliefs">
              <view
                v-for="(belief, index) in beliefs"
                :key="`belief-edit-${index}`"
                class="belief-row"
              >
                <input
                  :value="belief"
                  class="input-shell belief-row__input"
                  maxlength="40"
                  placeholder="写一句你愿意反复执行的信念"
                  @input="handleBeliefInput(index, $event)"
                />
                <button class="danger-button" @tap="store.removeBelief(index)">删除</button>
              </view>
            </view>
          </view>

          <view class="field-block">
            <view class="field-row">
              <text class="field-label">证明法则</text>
              <button class="ghost-button" @tap="store.createProofRule()">新增法则</button>
            </view>
            <view class="identity-editor__rules">
              <view
                v-for="rule in store.state.data.proofRules"
                :key="rule.id"
                class="identity-rule"
              >
                <view class="identity-rule__top">
                  <text class="tag-chip" :class="{ 'tag-chip--active': rule.active }">
                    {{ rule.active ? "已启用" : "已停用" }}
                  </text>
                  <button class="danger-button" @tap="store.removeProofRule(rule.id)">删除</button>
                </view>

                <view class="identity-rule__fields">
                  <input
                    :value="rule.title"
                    class="input-shell"
                    maxlength="32"
                    placeholder="例如：决定后 5 分钟内开始行动"
                    @input="updateRuleField(rule, 'title', $event)"
                  />
                  <textarea
                    :value="rule.description"
                    class="textarea-shell identity-rule__textarea"
                    maxlength="120"
                    auto-height
                    placeholder="补充一下什么算完成，什么才是真正的证据。"
                    @input="updateRuleField(rule, 'description', $event)"
                  />
                  <view class="action-row">
                    <button
                      class="ghost-button identity-cadence-chip"
                      :class="{ 'identity-cadence-chip--active': rule.cadence === 'daily' }"
                      @tap="updateRuleCadence(rule, 'daily')"
                    >
                      每日
                    </button>
                    <button
                      class="ghost-button identity-cadence-chip"
                      :class="{ 'identity-cadence-chip--active': rule.cadence === 'weekly' }"
                      @tap="updateRuleCadence(rule, 'weekly')"
                    >
                      每周
                    </button>
                    <button class="ghost-button" @tap="toggleRuleActive(rule)">
                      {{ rule.active ? "停用法则" : "重新启用" }}
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { ProofRule } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();
const showAntiIdentity = ref(false);
const showEditor = ref(false);

const statement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (value: string) => store.updateIdentityProfile({ statement: value }),
});

const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (value: string) => store.updateIdentityProfile({ antiIdentityText: value }),
});

const beliefs = computed(() => store.state.data.identityProfile.beliefs);
const visionPreview = computed(
  () =>
    store.state.data.visionProfile.visionText.trim() ||
    "先决定你真正要去向哪里，身份才有明确的方向。",
);
const antiIdentityPreview = computed(
  () =>
    antiIdentityText.value.trim() ||
    "把那个你不愿再继续扮演的旧版本说清楚，它会提醒你别重新回去。",
);
const statementPreview = computed(() => statement.value.trim() || "先决定你是谁");

function eventValue(event: UniValueEvent) {
  return event.detail?.value ?? "";
}

function handleBeliefInput(index: number, event: UniValueEvent) {
  store.updateBelief(index, eventValue(event));
}

function updateRuleField(
  rule: ProofRule,
  field: "title" | "description",
  event: UniValueEvent,
) {
  store.upsertProofRule({
    ...rule,
    [field]: eventValue(event),
  });
}

function updateRuleCadence(rule: ProofRule, cadence: ProofRule["cadence"]) {
  store.upsertProofRule({
    ...rule,
    cadence,
  });
}

function toggleRuleActive(rule: ProofRule) {
  store.upsertProofRule({
    ...rule,
    active: !rule.active,
  });
}

function openOnboarding() {
  uni.navigateTo({
    url: "/pages/onboarding/index",
  });
}
</script>

<style scoped lang="scss">
.identity-page {
  display: flex;
  flex-direction: column;
  gap: 54rpx;
}

.identity-heading {
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.identity-heading__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: 999rpx;
  background: rgba(6, 78, 59, 0.16);
}

.identity-heading__spark {
  width: 14rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: #34d399;
  box-shadow: 0 0 20rpx rgba(52, 211, 153, 0.5);
}

.identity-section {
  display: flex;
  flex-direction: column;
}

.identity-statement-panel {
  padding: 46rpx 36rpx;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 30rpx;
  background: linear-gradient(145deg, rgba(6, 78, 59, 0.18), rgba(17, 24, 39, 0.06));
}

.identity-statement-panel__text {
  color: #ecfdf5;
  font-size: 56rpx;
  line-height: 1.24;
}

.identity-collapse {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.identity-collapse__label {
  color: #71717a;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.identity-collapse__chevron {
  color: #52525b;
  font-size: 24rpx;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.identity-collapse__chevron--open {
  transform: rotate(180deg);
}

.identity-anti-panel {
  margin-top: 16rpx;
  padding: 30rpx 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.26);
}

.identity-anti-panel__text {
  color: #a1a1aa;
  font-size: 28rpx;
  line-height: 1.7;
  font-style: italic;
}

.identity-section__headline {
  color: #f4f4f5;
  font-size: 42rpx;
  line-height: 1.58;
}

.identity-belief-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.identity-belief {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 28rpx 30rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.34);
}

.identity-belief__dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 14rpx;
  border-radius: 999rpx;
  background: #34d399;
  flex-shrink: 0;
}

.identity-belief__text {
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.68;
}

.identity-empty {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.identity-empty__title {
  color: #f4f4f5;
  font-size: 30rpx;
  line-height: 1.46;
}

.identity-actions {
  display: flex;
  gap: 28rpx;
  align-items: center;
  flex-wrap: wrap;
}

.identity-actions__link {
  color: #71717a;
  font-size: 24rpx;
}

.identity-editor {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.identity-editor__fields,
.identity-editor__beliefs,
.identity-editor__rules,
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

.field-row,
.belief-row {
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

.identity-rule {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 28rpx;
  border: 1px solid rgba(39, 39, 42, 0.7);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.26);
}

.identity-rule__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.identity-rule__fields {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.identity-rule__textarea {
  min-height: 140rpx;
}

.identity-cadence-chip--active {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(6, 95, 70, 0.28);
  color: #d1fae5;
}
</style>
