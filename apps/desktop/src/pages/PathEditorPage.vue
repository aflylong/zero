<template>
  <div class="path-editor-page">
    <PageHeader
      title="编辑道路"
      kicker="PATH / EDIT"
      description="实时保存。改完直接回去就行。"
      back
      back-to="/path"
    />

    <PageBody>
      <div class="path-editor-frame">
        <GlassCard>
          <SectionLabel :icon="Compass">愿景</SectionLabel>
          <div class="form-field">
            <label class="form-label">愿景概述</label>
            <textarea
              v-model="visionText"
              class="form-textarea"
              maxlength="300"
              placeholder="描述你想去的生活、工作和关系。要具体到能在脑子里看见画面。"
            />
          </div>
          <div class="form-field">
            <label class="form-label">Q12 · 三年后理想周二</label>
            <textarea
              v-model="threeYearTuesday"
              class="form-textarea"
              maxlength="500"
              placeholder="忘掉「现实性」。三年后的普通周二:在哪醒来?第一念头?9-18 点做什么?"
            />
          </div>
          <div class="form-field">
            <label class="form-label">Q14 · 这周会做的一件事</label>
            <input
              v-model="oneThingThisWeek"
              class="form-input"
              maxlength="80"
              placeholder="例如:周三晚上把那篇拖了三周的稿子发出去。"
            />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="AlertTriangle">反愿景</SectionLabel>
          <div class="form-field">
            <label class="form-label">反愿景概述</label>
            <textarea
              v-model="antiVisionText"
              class="form-textarea"
              maxlength="500"
              placeholder="那个你不愿回去的旧自己。这股不舒服会在松懈时把你拽回来。"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Q5 · 5 年后无变化的周二</label>
            <textarea
              v-model="fiveYearTuesday"
              class="form-textarea"
              maxlength="500"
              placeholder="醒来地点 / 身体感觉 / 第一念头 / 谁在身边 / 9-18 点 / 22 点"
            />
          </div>
          <div class="form-field">
            <label class="form-label">Q6 · 10 年后周二</label>
            <textarea
              v-model="tenYearTuesday"
              class="form-textarea"
              maxlength="500"
              placeholder="错过了什么 / 哪些机会关闭 / 谁放弃你 / 不在场时人们怎么评价"
            />
          </div>
          <div class="form-field">
            <label class="form-label">Q7 · 人生尽头</label>
            <textarea
              v-model="endOfLife"
              class="form-textarea"
              maxlength="500"
              placeholder="你从未感受 / 尝试 / 成为的"
            />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Target">一年目标 · 主线任务</SectionLabel>
          <p class="muted-text">
            一年后必须看到什么变化,才算真的打破了旧模式?这是这一年里唯一的优先事项。
          </p>
          <div class="form-field">
            <label class="form-label">标题</label>
            <input
              v-model="yearGoal"
              class="form-input"
              maxlength="32"
              placeholder="例如:用 365 天彻底重建日常系统"
            />
          </div>
          <div class="form-field">
            <label class="form-label">具体说明</label>
            <textarea
              v-model="yearGoalDescription"
              class="form-textarea"
              maxlength="240"
              placeholder="一年后什么必须为真,你才会承认自己赢了?"
            />
          </div>
          <div class="path-editor__archive">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="!yearGoal.trim()"
              @click="openArchive('year')"
            >
              <Archive :size="14" :stroke-width="iconStroke" />
              <span>归档这条一年目标</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Swords">一月项目 · Boss 战</SectionLabel>
          <p class="muted-text">
            这个月要攻克的具体里程碑。要服务于一年目标。
          </p>
          <div class="form-field">
            <label class="form-label">标题</label>
            <input
              v-model="monthProject"
              class="form-input"
              maxlength="32"
              placeholder="例如:连续 30 天跑通完整闭环"
            />
          </div>
          <div class="form-field">
            <label class="form-label">说明</label>
            <textarea
              v-model="monthProjectDescription"
              class="form-textarea"
              maxlength="200"
              placeholder="把这个月要做的事写清楚。做完它,会拿到什么经验值?"
            />
          </div>
          <div class="form-field">
            <label class="form-label">截止日期 · 可选</label>
            <input
              v-model="monthDeadline"
              type="date"
              class="form-input path-editor__date"
            />
          </div>
          <div class="path-editor__archive">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="!monthProject.trim()"
              @click="openArchive('month')"
            >
              <Archive :size="14" :stroke-width="iconStroke" />
              <span>归档这条一月项目</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div class="path-editor__row-head">
            <SectionLabel :icon="Shield">约束 · 不能碰的红线</SectionLabel>
            <button type="button" class="btn btn-ghost btn-sm" @click="store.addConstraint()">
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>添加</span>
            </button>
          </div>
          <p class="muted-text">
            为了实现一年目标,绝不愿意牺牲什么?睡眠、家人、健康、价值观——这些是护栏,不是限制。
          </p>

          <div v-if="constraints.length" class="path-editor__list">
            <div
              v-for="(item, idx) in constraints"
              :key="`constraint-edit-${idx}`"
              class="path-editor__row"
            >
              <input
                :value="item"
                class="form-input"
                maxlength="40"
                placeholder="例如:不牺牲睡眠"
                @input="onConstraintInput(idx, $event)"
              />
              <button
                type="button"
                class="btn btn-destructive btn-sm btn-icon"
                title="删除"
                @click="store.removeConstraint(idx)"
              >
                <Trash2 :size="14" :stroke-width="iconStroke" />
              </button>
            </div>
          </div>
          <EmptyState
            v-else
            :icon="Shield"
            title="还没设过约束"
            description="点上方「添加」,先写一条你绝不会让步的事。"
          />
        </GlassCard>

        <div class="path-editor__foot">
          <p class="faint-text">所有修改已保存到本地。</p>
          <div class="action-row">
            <button type="button" class="btn btn-ghost btn-sm" @click="openArticle">
              <BookOpenText :size="14" :stroke-width="iconStroke" />
              <span>读原文</span>
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="goBack">
              <ArrowLeft :size="14" :stroke-width="iconStroke" />
              <span>回到道路</span>
            </button>
          </div>
        </div>
      </div>
    </PageBody>

    <GoalArchiveDialog
      :open="archiveOpen"
      :type="archiveType"
      :title="archiveTitle"
      @close="archiveOpen = false"
      @confirm="confirmArchive"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BookOpenText,
  Compass,
  Plus,
  Shield,
  Swords,
  Target,
  Trash2,
} from "lucide-vue-next";
import { tokens, useAppStore, type GoalStatus } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import GoalArchiveDialog from "@/components/common/GoalArchiveDialog.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

const visionText = computed({
  get: () => store.state.data.visionProfile.visionText,
  set: (v: string) => store.updateVisionProfile({ visionText: v }),
});
const antiVisionText = computed({
  get: () => store.state.data.visionProfile.antiVisionText,
  set: (v: string) => store.updateVisionProfile({ antiVisionText: v }),
});
const fiveYearTuesday = computed({
  get: () => store.state.data.visionProfile.fiveYearTuesday,
  set: (v: string) => store.updateVisionProfile({ fiveYearTuesday: v }),
});
const tenYearTuesday = computed({
  get: () => store.state.data.visionProfile.tenYearTuesday,
  set: (v: string) => store.updateVisionProfile({ tenYearTuesday: v }),
});
const endOfLife = computed({
  get: () => store.state.data.visionProfile.endOfLife,
  set: (v: string) => store.updateVisionProfile({ endOfLife: v }),
});
const threeYearTuesday = computed({
  get: () => store.state.data.visionProfile.threeYearTuesday,
  set: (v: string) => store.updateVisionProfile({ threeYearTuesday: v }),
});
const oneThingThisWeek = computed({
  get: () => store.state.data.visionProfile.oneThingThisWeek,
  set: (v: string) => store.updateVisionProfile({ oneThingThisWeek: v }),
});

const yearGoal = computed({
  get: () => store.state.data.visionProfile.yearGoal,
  set: (v: string) => store.updateVisionProfile({ yearGoal: v }),
});
const yearGoalDescription = computed({
  get: () => store.state.data.visionProfile.yearGoalDescription,
  set: (v: string) => store.updateVisionProfile({ yearGoalDescription: v }),
});

const monthProject = computed({
  get: () => store.state.data.visionProfile.monthProject,
  set: (v: string) => store.updateVisionProfile({ monthProject: v }),
});
const monthProjectDescription = computed({
  get: () => store.state.data.visionProfile.monthProjectDescription,
  set: (v: string) => store.updateVisionProfile({ monthProjectDescription: v }),
});
const monthDeadline = computed({
  get: () => store.state.data.visionProfile.monthProjectDeadline ?? "",
  set: (v: string) => store.updateVisionProfile({ monthProjectDeadline: v || null }),
});

const constraints = computed(() => store.state.data.visionProfile.constraints);

function onConstraintInput(idx: number, e: Event) {
  store.updateConstraint(idx, (e.target as HTMLInputElement).value);
}

const archiveOpen = ref(false);
const archiveType = ref<"year" | "month">("year");
const archiveTitle = computed(() =>
  archiveType.value === "year"
    ? store.state.data.visionProfile.yearGoal
    : store.state.data.visionProfile.monthProject,
);

function openArchive(type: "year" | "month") {
  archiveType.value = type;
  archiveOpen.value = true;
}

function confirmArchive(status: GoalStatus, reflection: string) {
  store.endGoal(archiveType.value, status, reflection);
  archiveOpen.value = false;
}

function goBack() {
  router.push("/path");
}
function openArticle() {
  router.push("/path/article");
}
</script>

<style lang="scss" scoped>
.path-editor-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.path-editor-frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
}

.path-editor__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.path-editor__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.path-editor__row {
  display: flex;
  gap: 10px;
  align-items: center;

  .form-input {
    flex: 1;
  }
}

.path-editor__date {
  width: 200px;
}

.path-editor__archive {
  padding-top: 8px;
  border-top: 1px dashed var(--si-color-border-subtle);
}

.path-editor__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;
  flex-wrap: wrap;
}
</style>
