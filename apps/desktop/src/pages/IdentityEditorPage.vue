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
            <SectionLabel :icon="Sparkles">核心信念</SectionLabel>
            <button type="button" class="btn btn-ghost btn-sm" @click="store.addBelief()">
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>新增信念</span>
            </button>
          </div>

          <div v-if="beliefs.length" class="identity-editor__belief-list">
            <div
              v-for="(belief, index) in beliefs"
              :key="`belief-edit-${index}`"
              class="identity-editor__belief"
            >
              <input
                :value="belief"
                class="form-input"
                maxlength="40"
                placeholder="写一句你愿意反复执行的信念"
                @input="onBeliefInput(index, $event)"
              />
              <button
                type="button"
                class="btn btn-destructive btn-sm btn-icon"
                title="删除"
                @click="store.removeBelief(index)"
              >
                <Trash2 :size="14" :stroke-width="iconStroke" />
              </button>
            </div>
          </div>

          <EmptyState
            v-else
            :icon="Sparkles"
            title="还没有信念条目"
            description="点上方「新增信念」,写一条你愿意反复执行的话。"
          />
        </GlassCard>

        <GlassCard>
          <div class="identity-editor__head">
            <SectionLabel :icon="CheckCircle2">证明法则</SectionLabel>
            <button type="button" class="btn btn-ghost btn-sm" @click="store.createProofRule()">
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>新增法则</span>
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
                maxlength="32"
                placeholder="例如:想到就动,5 分钟内开始"
                @input="updateRuleField(rule, 'title', $event)"
              />
              <textarea
                :value="rule.description"
                class="form-textarea"
                maxlength="120"
                placeholder="补一句什么算完成,什么才是真正的证据。"
                @input="updateRuleField(rule, 'description', $event)"
              />

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
                  <span>{{ rule.active ? "停用法则" : "重新启用" }}</span>
                </button>
              </div>
            </article>
          </div>

          <EmptyState
            v-else
            :icon="ListChecks"
            title="还没有证明法则"
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

const beliefs = computed(() => store.state.data.identityProfile.beliefs);
const proofRules = computed(() => store.state.data.proofRules);

const statement = computed({
  get: () => store.state.data.identityProfile.statement,
  set: (v: string) => store.updateIdentityProfile({ statement: v }),
});
const antiIdentityText = computed({
  get: () => store.state.data.identityProfile.antiIdentityText,
  set: (v: string) => store.updateIdentityProfile({ antiIdentityText: v }),
});

function onBeliefInput(index: number, e: Event) {
  store.updateBelief(index, (e.target as HTMLInputElement).value);
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
</style>
