<template>
  <PageShell tab-key="identity">
    <view class="section-stack">
      <GradientHeroCard>
        <view class="section-stack">
          <text class="hero-title">{{ statementPreview }}</text>
          <text class="body-text">
            用身份句子决定方向，再把核心信念和证明法则变成每天都能执行、能记录、能验证的动作。
          </text>
          <view class="action-row">
            <text class="tag-chip tag-chip--active">
              {{ activeRuleCount }} 条生效法则
            </text>
            <text class="tag-chip">
              {{ store.state.data.identityProfile.beliefs.length }} 条核心信念
            </text>
          </view>
        </view>
      </GradientHeroCard>

      <GlassCard>
        <SectionLabel>身份陈述</SectionLabel>
        <view class="section-stack">
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
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>核心信念</SectionLabel>
        <view class="section-stack">
          <text class="muted-text">
            这些句子不是用来安慰自己，而是用来在你犹豫时逼你做出一致行动。
          </text>
          <view class="section-stack">
            <view
              v-for="(belief, index) in store.state.data.identityProfile.beliefs"
              :key="`identity-belief-${index}`"
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
          <button class="ghost-button block-button" @tap="store.addBelief()">新增核心信念</button>
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>证明法则</SectionLabel>
        <view class="section-stack">
          <text class="muted-text">
            你的身份要靠证据维持。每条法则都应该让你一眼知道今天是否做到了。
          </text>
          <view class="section-stack">
            <view
              v-for="rule in store.state.data.proofRules"
              :key="rule.id"
              class="glass-card rule-card"
            >
              <view class="field-row">
                <text class="tag-chip" :class="{ 'tag-chip--active': rule.active }">
                  {{ rule.active ? "已启用" : "已停用" }}
                </text>
                <button class="danger-button" @tap="store.removeProofRule(rule.id)">删除</button>
              </view>
              <view class="section-stack">
                <input
                  :value="rule.title"
                  class="input-shell"
                  maxlength="32"
                  placeholder="例如：决定后 5 分钟内开始行动"
                  @input="updateRuleField(rule, 'title', $event)"
                />
                <textarea
                  :value="rule.description"
                  class="textarea-shell rule-card__textarea"
                  maxlength="120"
                  auto-height
                  placeholder="补充一下什么算完成，什么才是真正的证据。"
                  @input="updateRuleField(rule, 'description', $event)"
                />
                <view class="action-row">
                  <button
                    class="ghost-button cadence-chip"
                    :class="{ 'cadence-chip--active': rule.cadence === 'daily' }"
                    @tap="updateRuleCadence(rule, 'daily')"
                  >
                    每日
                  </button>
                  <button
                    class="ghost-button cadence-chip"
                    :class="{ 'cadence-chip--active': rule.cadence === 'weekly' }"
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
          <button class="ghost-button block-button" @tap="store.createProofRule()">新增证明法则</button>
        </view>
      </GlassCard>
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
import type { ProofRule } from "@/types/app";

const store = useAppStore();

const statement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (value: string) => store.updateIdentityProfile({ statement: value }),
});

const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (value: string) => store.updateIdentityProfile({ antiIdentityText: value }),
});

const statementPreview = computed(() => statement.value.trim() || "先决定你是谁");
const activeRuleCount = computed(
  () => store.state.data.proofRules.filter((rule) => rule.active).length,
);

onShow(() => {
  if (!store.state.data.onboardingCompleted) {
    uni.reLaunch({ url: "/pages/onboarding/index" });
  }
});

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
</script>

<style scoped lang="scss">
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
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.belief-row {
  align-items: stretch;
}

.belief-row__input {
  flex: 1;
}

.rule-card {
  gap: 22rpx;
  padding: 28rpx;
  border-radius: 26rpx;
}

.rule-card__textarea {
  min-height: 140rpx;
}

.cadence-chip--active {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(6, 95, 70, 0.28);
  color: #d1fae5;
}

.block-button {
  justify-content: center;
}
</style>
