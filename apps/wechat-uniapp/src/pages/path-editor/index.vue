<template>
  <PageShell
    title="道路编辑"
    topbar-mode="secondary"
    back-url="/pages/path/index"
  >
    <view class="editor-page">
      <view class="editor-hero">
        <SectionLabel>方向与主线</SectionLabel>
        <text class="editor-hero__title">把愿景、反愿景和阶段主线整理成真正会驱动今天的内容。</text>
        <text class="muted-text">这里是实时保存，主 tab 只保留摘要与执行面。</text>
      </view>

      <GlassCard card-class="editor-card">
        <view class="editor-fields">
          <view class="field-block">
            <text class="field-label">愿景</text>
            <textarea
              v-model="visionText"
              class="textarea-shell"
              maxlength="300"
              auto-height
              placeholder="描述你想去到的生活、工作和关系状态。"
            />
          </view>

          <view class="field-block">
            <text class="field-label">反愿景</text>
            <textarea
              v-model="antiVisionText"
              class="textarea-shell"
              maxlength="240"
              auto-height
              placeholder="描述那个你不愿回去的旧轨道。"
            />
          </view>

          <view class="field-block">
            <text class="field-label">为什么必须改变</text>
            <textarea
              v-model="whyChangeText"
              class="textarea-shell"
              maxlength="240"
              auto-height
              placeholder="把改变背后的理由写成你愿意兑现的承诺。"
            />
          </view>

          <view class="field-block">
            <text class="field-label">一年目标 · 主线任务</text>
            <text class="muted-text">一年后必须看到什么变化,才算真的打破旧模式?</text>
            <input
              v-model="yearGoal"
              class="input-shell"
              maxlength="32"
              placeholder="例如:用 365 天彻底重建日常系统"
            />
            <textarea
              v-model="yearGoalDescription"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="一年后什么必须为真,你才会承认自己赢了?"
            />
            <button
              v-if="yearGoal.trim()"
              class="danger-button"
              @tap="endYearGoal"
            >
              结束当前一年目标
            </button>
          </view>

          <view class="field-block">
            <text class="field-label">一月项目 · Boss 战</text>
            <text class="muted-text">这个月要攻克的具体里程碑。它要服务于一年目标。</text>
            <input
              v-model="monthProject"
              class="input-shell"
              maxlength="32"
              placeholder="例如:连续 30 天跑通完整闭环"
            />
            <textarea
              v-model="monthProjectDescription"
              class="textarea-shell"
              maxlength="200"
              auto-height
              placeholder="做完这件事,你会拿到什么经验值?"
            />
            <button
              v-if="monthProject.trim()"
              class="danger-button"
              @tap="endMonthProject"
            >
              结束当前一月项目
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
        <button class="pill-button editor-footer__button" @tap="goBack">返回道路</button>
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
import { ensureOnboardingReady, switchToTab } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

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

const yearGoal = computed({
  get: () => store.state.data.visionProfile.yearGoal,
  set: (value: string) => store.updateVisionProfile({ yearGoal: value }),
});

const yearGoalDescription = computed({
  get: () => store.state.data.visionProfile.yearGoalDescription,
  set: (value: string) => store.updateVisionProfile({ yearGoalDescription: value }),
});

const monthProject = computed({
  get: () => store.state.data.visionProfile.monthProject,
  set: (value: string) => store.updateVisionProfile({ monthProject: value }),
});

const monthProjectDescription = computed({
  get: () => store.state.data.visionProfile.monthProjectDescription,
  set: (value: string) => store.updateVisionProfile({ monthProjectDescription: value }),
});

const constraints = computed(() => store.state.data.visionProfile.constraints);

function onConstraintInput(idx: number, e: { detail?: { value?: string } }) {
  store.updateConstraint(idx, e.detail?.value ?? "");
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
    itemList: [`已完成 ${label}`, "已养成习惯", "放弃,换方向"],
    success: ({ tapIndex }) => {
      const statusMap = ["completed", "habituated", "abandoned"] as const;
      const status = statusMap[tapIndex];
      askReflection(type, status, label);
    },
  });
}

function askReflection(type: "year" | "month", status: "completed" | "habituated" | "abandoned", label: string) {
  const promptMap = {
    completed: `你完成了${label}。从中学到了什么?下一个目标是什么?`,
    habituated: `${label}已经变成你的一部分了。它具体怎么影响你了?`,
    abandoned: `为什么放弃${label}?是方向错了还是执行力不够?下一步怎么调整?`,
  };
  uni.showModal({
    title: `结束${label}`,
    editable: true,
    placeholderText: promptMap[status],
    confirmText: "确认结束",
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
.field-block {
  display: flex;
  flex-direction: column;
}

.editor-page {
  gap: 24rpx;
}

.editor-hero,
.editor-card,
.editor-fields,
.field-block {
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

.editor-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.editor-footer__button {
  justify-content: center;
}
</style>
