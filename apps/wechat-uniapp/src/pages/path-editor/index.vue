<template>
  <PageShell
    title="编辑道路"
    topbar-mode="secondary"
    back-url="/pages/path/index"
  >
    <view class="editor-page">
      <view class="editor-hero">
        <SectionLabel>方向与主线</SectionLabel>
        <text class="editor-hero__title">把愿景、反愿景三段叙事和目标层级整理清楚。</text>
        <text class="muted-text">实时保存。改完直接回去就行。</text>
      </view>

      <GlassCard card-class="editor-card">
        <view class="editor-fields">
          <view class="field-block">
            <text class="field-label">愿景概述</text>
            <textarea
              :value="visionText"
              class="textarea-shell"
              maxlength="300"
              auto-height
              placeholder="描述你想去的生活、工作和关系。要具体到能在脑子里看见画面。"
              @input="setField('visionText', $event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">Q12 · 三年后理想周二</text>
            <textarea
              :value="threeYearTuesday"
              class="textarea-shell"
              maxlength="500"
              auto-height
              placeholder="忘掉「现实性」。三年后的普通周二:在哪醒来?第一念头?9-18 点做什么?"
              @input="setField('threeYearTuesday', $event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">Q14 · 这周会做的一件事</text>
            <input
              :value="oneThingThisWeek"
              class="input-shell"
              maxlength="80"
              placeholder="例如:周三晚上把那篇拖了三周的稿子发出去。"
              @input="setField('oneThingThisWeek', $event)"
            />
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="editor-card">
        <view class="editor-fields">
          <view class="field-block">
            <text class="field-label">反愿景概述</text>
            <textarea
              :value="antiVisionText"
              class="textarea-shell"
              maxlength="500"
              auto-height
              placeholder="那个你不愿回去的旧自己。这股不舒服会在松懈时把你拽回来。"
              @input="setField('antiVisionText', $event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">Q5 · 5 年后无变化的周二</text>
            <textarea
              :value="fiveYearTuesday"
              class="textarea-shell"
              maxlength="500"
              auto-height
              placeholder="醒来地点 / 身体感觉 / 第一念头 / 谁在身边 / 9-18 点 / 22 点"
              @input="setField('fiveYearTuesday', $event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">Q6 · 10 年后周二</text>
            <textarea
              :value="tenYearTuesday"
              class="textarea-shell"
              maxlength="500"
              auto-height
              placeholder="错过了什么 / 哪些机会关闭 / 谁放弃你 / 不在场时人们怎么评价"
              @input="setField('tenYearTuesday', $event)"
            />
          </view>

          <view class="field-block">
            <text class="field-label">Q7 · 人生尽头</text>
            <textarea
              :value="endOfLife"
              class="textarea-shell"
              maxlength="500"
              auto-height
              placeholder="你从未感受 / 尝试 / 成为的"
              @input="setField('endOfLife', $event)"
            />
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="editor-card">
        <view class="editor-fields">
          <view class="field-block">
            <text class="field-label">一年目标 · 主线任务</text>
            <text class="muted-text">一年后必须看到什么变化,才算真的打破了旧模式?</text>
            <input
              :value="yearGoal"
              class="input-shell"
              maxlength="32"
              placeholder="例如:用 365 天彻底重建日常系统"
              @input="setField('yearGoal', $event)"
            />
            <textarea
              :value="yearGoalDescription"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="一年后什么必须为真,你才会承认自己赢了?"
              @input="setField('yearGoalDescription', $event)"
            />
            <button
              v-if="yearGoal.trim()"
              class="danger-button"
              @tap="endYearGoal"
            >
              归档当前一年目标
            </button>
          </view>

          <view class="field-block">
            <text class="field-label">一月项目 · Boss 战</text>
            <text class="muted-text">这个月要攻克的具体里程碑。它要服务于一年目标。</text>
            <input
              :value="monthProject"
              class="input-shell"
              maxlength="32"
              placeholder="例如:连续 30 天跑通完整闭环"
              @input="setField('monthProject', $event)"
            />
            <textarea
              :value="monthProjectDescription"
              class="textarea-shell"
              maxlength="200"
              auto-height
              placeholder="做完这件事,你会拿到什么经验值?"
              @input="setField('monthProjectDescription', $event)"
            />
            <button
              v-if="monthProject.trim()"
              class="danger-button"
              @tap="endMonthProject"
            >
              归档当前一月项目
            </button>
          </view>

          <view class="field-block">
            <view class="field-row">
              <text class="field-label">约束 · 不能碰的红线</text>
              <button class="ghost-button" @tap="store.addConstraint()">添加</button>
            </view>
            <text class="muted-text">为了实现一年目标,你绝不愿意牺牲什么?睡眠、家人、健康——这些是护栏。</text>
            <view
              v-for="(item, idx) in constraints"
              :key="`constraint-${idx}`"
              class="belief-row"
            >
              <input
                :value="item"
                class="input-shell belief-row__input"
                maxlength="40"
                placeholder="例如:不牺牲睡眠"
                @input="onConstraintInput(idx, $event)"
              />
              <button class="danger-button" @tap="store.removeConstraint(idx)">删除</button>
            </view>
          </view>
        </view>
      </GlassCard>
    </view>

    <template #footer>
      <view class="editor-footer">
        <button class="ghost-button editor-footer__button" @tap="openArticleReader">阅读原文</button>
        <button class="pill-button editor-footer__button" @tap="goBack">回到道路</button>
      </view>
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
import type { VisionProfile } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();

const visionText = computed(() => store.state.data.visionProfile.visionText);
const antiVisionText = computed(() => store.state.data.visionProfile.antiVisionText);
const fiveYearTuesday = computed(() => store.state.data.visionProfile.fiveYearTuesday);
const tenYearTuesday = computed(() => store.state.data.visionProfile.tenYearTuesday);
const endOfLife = computed(() => store.state.data.visionProfile.endOfLife);
const threeYearTuesday = computed(() => store.state.data.visionProfile.threeYearTuesday);
const oneThingThisWeek = computed(() => store.state.data.visionProfile.oneThingThisWeek);
const yearGoal = computed(() => store.state.data.visionProfile.yearGoal);
const yearGoalDescription = computed(() => store.state.data.visionProfile.yearGoalDescription);
const monthProject = computed(() => store.state.data.visionProfile.monthProject);
const monthProjectDescription = computed(
  () => store.state.data.visionProfile.monthProjectDescription,
);
const constraints = computed(() => store.state.data.visionProfile.constraints);

function setField(field: keyof VisionProfile, e: UniValueEvent) {
  const value = String(e.detail?.value ?? "");
  store.updateVisionProfile({ [field]: value } as Partial<VisionProfile>);
}

function onConstraintInput(idx: number, e: UniValueEvent) {
  store.updateConstraint(idx, String(e.detail?.value ?? ""));
}

function endYearGoal() {
  promptEndGoal("year");
}
function endMonthProject() {
  promptEndGoal("month");
}

function promptEndGoal(type: "year" | "month") {
  const label = type === "year" ? "一年目标" : "一月项目";
  uni.showActionSheet({
    itemList: [`已完成 ${label}`, "已习惯化", "放弃,换方向"],
    success: ({ tapIndex }) => {
      const statusMap = ["completed", "habituated", "abandoned"] as const;
      const status = statusMap[tapIndex];
      askReflection(type, status, label);
    },
  });
}

function askReflection(
  type: "year" | "month",
  status: "completed" | "habituated" | "abandoned",
  label: string,
) {
  const promptMap = {
    completed: `你完成了${label}。从中学到了什么?下一个目标是什么?`,
    habituated: `${label}已经变成你的一部分了。它具体怎么影响你了?`,
    abandoned: `为什么放弃${label}?是方向错了还是执行力不够?下一步怎么调整?`,
  };
  uni.showModal({
    title: `归档${label}`,
    editable: true,
    placeholderText: promptMap[status],
    confirmText: "归档",
    success: ({ confirm, content }) => {
      if (!confirm) return;
      store.endGoal(type, status, content ?? "");
      uni.showToast({ title: "已归档", icon: "success" });
    },
  });
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  switchToTab("/pages/path/index");
}

function openArticleReader() {
  uni.navigateTo({ url: "/pages/article-reader/index" });
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
.field-block {
  display: flex;
  flex-direction: column;
}

.editor-page { gap: 24rpx; }
.editor-hero,
.editor-card,
.editor-fields,
.field-block { gap: 18rpx; }

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

.editor-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.editor-footer__button {
  justify-content: center;
}
</style>
