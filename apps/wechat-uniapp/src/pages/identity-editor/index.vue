<template>
  <PageShell
    title="身份编辑"
    topbar-mode="secondary"
    back-url="/pages/identity/index"
  >
    <view class="editor-page">
      <view class="editor-hero">
        <SectionLabel>定义与证据</SectionLabel>
        <text class="editor-hero__title">把身份句、核心信念和证明法则整理成一个独立编辑面。</text>
        <text class="muted-text">这里也是实时保存，身份 tab 只保留摘要和方向感。</text>
      </view>

      <GlassCard card-class="editor-card">
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
        </view>
      </GlassCard>

      <GlassCard card-class="editor-card">
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
      </GlassCard>
    </view>

    <template #footer>
      <button class="pill-button editor-footer__button" @tap="goBack">返回身份</button>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { ensureOnboardingReady, switchToTab } from "@/services/navigation";
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

  switchToTab("/pages/identity/index");
}

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }
});
</script>

<style scoped lang="scss">
.editor-page,
.editor-hero,
.editor-card,
.editor-fields,
.field-block,
.belief-list,
.rule-list {
  display: flex;
  flex-direction: column;
}

.editor-page {
  gap: 24rpx;
}

.editor-hero,
.editor-card,
.editor-fields,
.field-block,
.belief-list,
.rule-list {
  gap: 18rpx;
}

.editor-hero__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
}

.field-label {
  color: #f4f4f5;
  font-size: 24rpx;
  line-height: 1.4;
}

.field-row,
.belief-row,
.identity-rule__top {
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
  padding: 26rpx;
  border-radius: 24rpx;
  background: rgba(10, 10, 11, 0.34);
}

.identity-rule__fields {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.identity-rule__textarea {
  min-height: 140rpx;
}

.identity-cadence-chip--active {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.22);
}

.editor-footer__button {
  width: 100%;
  justify-content: center;
}
</style>
