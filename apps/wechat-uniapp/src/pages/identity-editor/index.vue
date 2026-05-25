<template>
  <PageShell
    title="编辑身份"
    topbar-mode="secondary"
    back-url="/pages/identity/index"
  >
    <view class="editor-page">
      <view class="editor-hero">
        <SectionLabel>定义与证据</SectionLabel>
        <text class="editor-hero__title">把身份句、原则和每日杠杆整理清楚。</text>
        <text class="muted-text">实时保存。改完直接回去就行。</text>
      </view>

      <GlassCard card-class="editor-card">
        <view class="editor-fields">
          <view class="field-block">
            <text class="field-label">我是谁</text>
            <input
              :value="statement"
              class="input-shell"
              maxlength="40"
              placeholder="给自己一条锋利、会驱动行动的身份句"
              @input="setStatement($event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">我不再是谁</text>
            <textarea
              :value="antiIdentityText"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="把你拒绝继续扮演的旧版本说清楚。"
              @input="setAntiIdentity($event)"
            />
          </view>

          <view class="field-block">
            <view class="field-row">
              <text class="field-label">原则</text>
              <button class="ghost-button" @tap="store.addPrinciple()">新增原则</button>
            </view>
            <view class="belief-list">
              <view
                v-for="(p, index) in principles"
                :key="`p-edit-${index}`"
                class="belief-row"
              >
                <input
                  :value="p"
                  class="input-shell belief-row__input"
                  maxlength="40"
                  placeholder="写一句你愿意反复执行的话"
                  @input="handlePrincipleInput(index, $event)"
                />
                <button class="danger-button" @tap="store.removePrinciple(index)">删除</button>
              </view>
            </view>
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="editor-card">
        <view class="field-row">
          <text class="field-label">每日杠杆</text>
          <button class="ghost-button" @tap="store.createProofRule()">新增杠杆</button>
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
                maxlength="48"
                placeholder="例如:9:30-11:00 写作 90 分钟"
                @input="updateRuleField(rule, 'title', $event)"
              />
              <textarea
                :value="rule.description"
                class="textarea-shell identity-rule__textarea"
                maxlength="160"
                auto-height
                placeholder="补一句什么算完成,什么才是真正的证据。"
                @input="updateRuleField(rule, 'description', $event)"
              />

              <view class="identity-rule__links">
                <button
                  class="ghost-button identity-rule__link-chip"
                  :class="{ 'identity-rule__link-chip--on': rule.linkedYearGoal }"
                  @tap="toggleLinkYear(rule)"
                >
                  {{ rule.linkedYearGoal ? "✓ " : "" }}关联一年目标
                </button>
                <button
                  class="ghost-button identity-rule__link-chip"
                  :class="{ 'identity-rule__link-chip--on': rule.linkedMonthProject }"
                  @tap="toggleLinkMonth(rule)"
                >
                  {{ rule.linkedMonthProject ? "✓ " : "" }}关联一月项目
                </button>
              </view>

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
                  {{ rule.active ? "停用" : "重新启用" }}
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
import { switchToTab } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { ProofRule } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();

const statement = computed(() => store.state.data.identityProfile.statement);
const antiIdentityText = computed(() => store.state.data.identityProfile.antiIdentityText);
const principles = computed(() => store.state.data.identityProfile.principles);

function evtVal(e: UniValueEvent) {
  return String(e.detail?.value ?? "");
}

function setStatement(e: UniValueEvent) {
  store.updateIdentityProfile({ statement: evtVal(e) });
}
function setAntiIdentity(e: UniValueEvent) {
  store.updateIdentityProfile({ antiIdentityText: evtVal(e) });
}
function handlePrincipleInput(index: number, e: UniValueEvent) {
  store.updatePrinciple(index, evtVal(e));
}

function updateRuleField(rule: ProofRule, field: "title" | "description", e: UniValueEvent) {
  store.upsertProofRule({ ...rule, [field]: evtVal(e) });
}

function updateRuleCadence(rule: ProofRule, cadence: ProofRule["cadence"]) {
  store.upsertProofRule({ ...rule, cadence });
}

function toggleRuleActive(rule: ProofRule) {
  store.upsertProofRule({ ...rule, active: !rule.active });
}

function toggleLinkYear(rule: ProofRule) {
  store.upsertProofRule({ ...rule, linkedYearGoal: !rule.linkedYearGoal });
}

function toggleLinkMonth(rule: ProofRule) {
  store.upsertProofRule({ ...rule, linkedMonthProject: !rule.linkedMonthProject });
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

.editor-page { gap: 24rpx; }
.editor-hero,
.editor-card,
.editor-fields,
.field-block,
.belief-list,
.rule-list { gap: 18rpx; }

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
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: rgba(10, 10, 11, 0.34);
}

.identity-rule__fields {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.identity-rule__textarea {
  min-height: 140rpx;
}

.identity-rule__links {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.identity-rule__link-chip {
  font-size: 22rpx;
}

.identity-rule__link-chip--on {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.22);
  color: #d1fae5;
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
