<template>
  <div class="identity-editor">
    <PageHeader
      title="编辑身份"
      kicker="IDENTITY / EDIT"
      description="实时保存。改完直接回去就行。"
      back
      back-to="/identity"
    />

    <PageBody>
      <div class="identity-editor__frame">
        <GlassCard>
          <div class="form-field">
            <label class="form-label">我是谁</label>
            <input
              v-model="statement"
              class="form-input"
              maxlength="40"
              placeholder="给自己一条锋利、会驱动行动的身份句"
            />
          </div>

          <div class="form-field">
            <label class="form-label">我不再是谁</label>
            <textarea
              v-model="antiIdentityText"
              class="form-textarea"
              maxlength="220"
              placeholder="把你拒绝继续扮演的旧版本说清楚。"
            />
          </div>
        </GlassCard>

        <GlassCard>
          <div class="identity-editor__head">
            <SectionLabel :icon="Sparkles">原则</SectionLabel>
            <button type="button" class="btn btn-ghost btn-sm" @click="store.addPrinciple()">
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>新增原则</span>
            </button>
          </div>

          <div v-if="principles.length" class="identity-editor__belief-list">
            <div
              v-for="(p, index) in principles"
              :key="`p-edit-${index}`"
              class="identity-editor__belief"
            >
              <input
                :value="p"
                class="form-input"
                maxlength="40"
                placeholder="写一句你愿意反复执行的话"
                @input="onPrincipleInput(index, $event)"
              />
              <button
                type="button"
                class="btn btn-destructive btn-sm btn-icon"
                title="删除"
                @click="store.removePrinciple(index)"
              >
                <Trash2 :size="14" :stroke-width="iconStroke" />
              </button>
            </div>
          </div>

          <EmptyState
            v-else
            :icon="Sparkles"
            title="还没有原则"
            description="点上方「新增原则」,写一条你愿意反复执行的话。"
          />
        </GlassCard>

        <GlassCard>
          <div class="identity-editor__head">
            <SectionLabel :icon="CheckCircle2">每日杠杆</SectionLabel>
            <button type="button" class="btn btn-ghost btn-sm" @click="store.createProofRule()">
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>新增杠杆</span>
            </button>
          </div>

          <div v-if="proofRules.length" class="identity-editor__rule-list">
            <article
              v-for="rule in proofRules"
              :key="rule.id"
              class="identity-editor__rule"
            >
              <header class="identity-editor__rule-head">
                <span
                  class="tag-chip"
                  :class="{ 'tag-chip--active': rule.active }"
                >
                  <component
                    :is="rule.active ? CheckCircle2 : CircleDashed"
                    :size="12"
                    :stroke-width="2"
                  />
                  <span>{{ rule.active ? "已启用" : "已停用" }}</span>
                </span>
                <button
                  type="button"
                  class="btn btn-destructive btn-sm"
                  @click="store.removeProofRule(rule.id)"
                >
                  <Trash2 :size="14" :stroke-width="iconStroke" />
                  <span>删除</span>
                </button>
              </header>

              <input
                :value="rule.title"
                class="form-input"
                maxlength="48"
                placeholder="例如:9:30-11:00 写作 90 分钟"
                @input="updateRuleField(rule, 'title', $event)"
              />
              <textarea
                :value="rule.description"
                class="form-textarea"
                maxlength="160"
                placeholder="补一句什么算完成,什么才是真正的证据。"
                @input="updateRuleField(rule, 'description', $event)"
              />

              <div class="identity-editor__rule-links">
                <label class="identity-editor__rule-link">
                  <input
                    type="checkbox"
                    :checked="rule.linkedYearGoal ?? false"
                    @change="toggleLinkYear(rule, $event)"
                  />
                  <span>关联一年目标(主线)</span>
                </label>
                <label class="identity-editor__rule-link">
                  <input
                    type="checkbox"
                    :checked="rule.linkedMonthProject ?? false"
                    @change="toggleLinkMonth(rule, $event)"
                  />
                  <span>关联一月项目(Boss 战)</span>
                </label>
              </div>

              <div class="action-row">
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="rule.cadence === 'daily' ? 'btn-success' : 'btn-ghost'"
                  @click="updateRuleCadence(rule, 'daily')"
                >
                  <CalendarDays :size="14" :stroke-width="iconStroke" />
                  <span>每日</span>
                </button>
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="rule.cadence === 'weekly' ? 'btn-success' : 'btn-ghost'"
                  @click="updateRuleCadence(rule, 'weekly')"
                >
                  <CalendarRange :size="14" :stroke-width="iconStroke" />
                  <span>每周</span>
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  @click="toggleRuleActive(rule)"
                >
                  <component
                    :is="rule.active ? Pause : Play"
                    :size="14"
                    :stroke-width="iconStroke"
                  />
                  <span>{{ rule.active ? "停用" : "重新启用" }}</span>
                </button>
              </div>
            </article>
          </div>

          <EmptyState
            v-else
            :icon="ListChecks"
            title="还没有每日杠杆"
            description="一条可验证的动作,比十句口号更有用。"
          />
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-vue-next";
import { tokens, useAppStore, type ProofRule } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const principles = computed(() => store.state.data.identityProfile.principles);
const proofRules = computed(() => store.state.data.proofRules);

const statement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (v: string) => store.updateIdentityProfile({ statement: v }),
});
const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (v: string) => store.updateIdentityProfile({ antiIdentityText: v }),
});

function onPrincipleInput(index: number, e: Event) {
  store.updatePrinciple(index, (e.target as HTMLInputElement).value);
}

function updateRuleField(rule: ProofRule, field: "title" | "description", e: Event) {
  store.upsertProofRule({
    ...rule,
    [field]: (e.target as HTMLInputElement | HTMLTextAreaElement).value,
  });
}

function updateRuleCadence(rule: ProofRule, cadence: ProofRule["cadence"]) {
  store.upsertProofRule({ ...rule, cadence });
}

function toggleRuleActive(rule: ProofRule) {
  store.upsertProofRule({ ...rule, active: !rule.active });
}

function toggleLinkYear(rule: ProofRule, e: Event) {
  store.upsertProofRule({
    ...rule,
    linkedYearGoal: (e.target as HTMLInputElement).checked,
  });
}

function toggleLinkMonth(rule: ProofRule, e: Event) {
  store.upsertProofRule({
    ...rule,
    linkedMonthProject: (e.target as HTMLInputElement).checked,
  });
}
</script>

<style lang="scss" scoped>
.identity-editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.identity-editor__frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 880px;
}

.identity-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.identity-editor__belief-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.identity-editor__belief {
  display: flex;
  gap: 10px;
  align-items: center;
}

.identity-editor__belief .form-input {
  flex: 1;
}

.identity-editor__rule-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.identity-editor__rule {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-card-soft);
}

.identity-editor__rule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.identity-editor__rule-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-inset);
  font-size: var(--si-font-sm);
  color: var(--si-color-text-soft);
}

.identity-editor__rule-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
</style>
