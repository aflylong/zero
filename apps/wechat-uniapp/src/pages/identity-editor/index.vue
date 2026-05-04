<template>
  <PageShell>
    <view class="editor-page">
      <view class="editor-page__top">
        <button class="editor-page__link" @tap="goBack">返回身份</button>
      </view>

      <view class="editor-page__hero">
        <text class="section-label">身份编辑</text>
        <text class="page-title editor-page__title">把身份句、核心信念和证明法则整理成一个独立编辑面。</text>
        <text class="muted-text">这里也是实时保存，主 tab 不再往下拖一整段编辑器。</text>
      </view>

      <view class="glass-card editor-card">
        <view class="editor-fields">
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
            <view class="belief-list">
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
            <view class="rule-list">
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
import { computed } from "vue";
import PageShell from "@/components/PageShell.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { ProofRule } from "@/types/app";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();

const statement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (value: string) => store.updateIdentityProfile({ statement: value }),
});

const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (value: string) => store.updateIdentityProfile({ antiIdentityText: value }),
});

const beliefs = computed(() => store.state.data.identityProfile.beliefs);

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

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/identity/index" });
}
</script>

<style scoped lang="scss">
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.editor-page__top {
  display: flex;
  gap: 28rpx;
  align-items: center;
}

.editor-page__link {
  color: #71717a;
  font-size: 24rpx;
}

.editor-page__hero {
  display: flex;
  flex-direction: column;
}

.editor-page__title {
  max-width: 620rpx;
}

.editor-card {
  padding: 34rpx 32rpx;
}

.editor-fields,
.field-block,
.belief-list,
.rule-list {
  display: flex;
  flex-direction: column;
}

.editor-fields {
  gap: 24rpx;
}

.field-block,
.belief-list,
.rule-list {
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
