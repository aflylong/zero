<template>
  <PageShell
    title="夜间复盘"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="handleBack"
  >
    <view class="night-page">
      <view class="night-hero">
        <SectionLabel>{{ dateKey }}</SectionLabel>
        <text class="night-hero__title">{{ currentStepMeta.title }}</text>
        <text class="body-text">{{ currentStepMeta.description }}</text>

        <view class="night-steps">
          <view
            v-for="(item, index) in steps"
            :key="item.short"
            class="night-step"
            :class="{ 'night-step--active': currentStep === index }"
          >
            <text class="night-step__index">0{{ index + 1 }}</text>
            <text class="night-step__title">{{ item.short }}</text>
          </view>
        </view>
      </view>

      <GlassCard v-if="currentStep === 0" card-class="night-card">
        <SectionLabel>今日概况</SectionLabel>
        <view class="night-summary">
          <view class="night-summary__item">
            <text class="night-summary__value">{{ completedProofCount }}</text>
            <text class="night-summary__label">完成证明</text>
          </view>
          <view class="night-summary__item">
            <text class="night-summary__value">{{ snapshot.alignmentScore }}%</text>
            <text class="night-summary__label">系统分数</text>
          </view>
        </view>
        <text class="muted-text">{{ observationPreview }}</text>

        <view class="night-score-block">
          <view class="night-score-block__head">
            <text class="night-score-block__title">你主观上给今天打多少分</text>
            <text class="night-score">{{ form.alignmentScore }}</text>
          </view>
          <slider
            class="night-slider"
            :value="form.alignmentScore"
            min="0"
            max="100"
            step="5"
            activeColor="#34d399"
            backgroundColor="rgba(63,63,70,0.8)"
            block-color="#34d399"
            @change="handleScoreChange"
          />
          <view class="night-score__marks">
            <text>惯性</text>
            <text>纠偏</text>
            <text>对齐</text>
            <text>推进</text>
          </view>
        </view>
      </GlassCard>

      <GlassCard v-else-if="currentStep === 1" card-class="night-card">
        <view class="field-block">
          <SectionLabel>赢点</SectionLabel>
          <textarea
            class="textarea-shell night-textarea"
            :value="form.winsText"
            maxlength="500"
            placeholder="今天哪几个动作最像你想成为的那个人？"
            @input="handleTextInput('winsText', $event)"
          />
        </view>

        <view class="field-block">
          <SectionLabel>偏离点</SectionLabel>
          <textarea
            class="textarea-shell night-textarea"
            :value="form.missesText"
            maxlength="500"
            placeholder="你在哪些时刻被惯性、分心或逃避带偏了？"
            @input="handleTextInput('missesText', $event)"
          />
        </view>
      </GlassCard>

      <GlassCard v-else card-class="night-card">
        <view class="field-block">
          <SectionLabel>反思</SectionLabel>
          <textarea
            class="textarea-shell night-textarea"
            :value="form.reflectionText"
            maxlength="500"
            placeholder="这些赢点和偏离点背后，真正的问题是什么？"
            @input="handleTextInput('reflectionText', $event)"
          />
        </view>

        <view class="field-block">
          <SectionLabel>明日修正</SectionLabel>
          <textarea
            class="textarea-shell night-textarea"
            :value="form.tomorrowFixesText"
            maxlength="500"
            placeholder="明天最小但最关键的修正动作是什么？"
            @input="handleTextInput('tomorrowFixesText', $event)"
          />
        </view>

        <text class="night-status" :class="{ 'night-status--dirty': dirty }">
          {{ dirty ? "有未保存修改" : "表单已同步到当前草稿" }}
        </text>
      </GlassCard>
    </view>

    <template #footer>
      <view class="night-footer">
        <button class="ghost-button night-footer__button" @tap="handleSecondaryAction">
          {{ currentStep === 0 ? "返回今日" : "上一步" }}
        </button>
        <button class="pill-button night-footer__button" @tap="handlePrimaryAction">
          {{ currentStep === steps.length - 1 ? "保存复盘" : "下一步" }}
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { switchToTab } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

const store = useAppStore();
const currentStep = ref(0);
const dirty = ref(false);
const form = reactive({
  alignmentScore: 0,
  winsText: "",
  missesText: "",
  reflectionText: "",
  tomorrowFixesText: "",
});

const steps = [
  {
    short: "概况",
    title: "先快速判断今天整体是否对齐。",
    description: "先看系统快照，再给今天一个主观分数，别急着写很长的文字。",
  },
  {
    short: "赢偏",
    title: "把今天哪里做对了、哪里偏了说清楚。",
    description: "只写真正发生过的动作与偏离，不写空洞评价。",
  },
  {
    short: "修正",
    title: "把反思压缩成明天能执行的修正动作。",
    description: "复盘的价值不在于自责，而在于让明天更容易做对。",
  },
] as const;

const dateKey = computed(() => store.state.activeDateKey);
const snapshot = computed(() => store.today.value.snapshot);
const completedProofCount = computed(() => snapshot.value.completedProofRuleIds.length);
const existingReview = computed(() => store.state.data.nightReviews[dateKey.value] ?? null);
const pendingNightPromptId = computed(
  () =>
    store.state.pendingReminderPrompts.find((prompt) => prompt.kind === "night")?.ruleId ?? null,
);
const currentStepMeta = computed(() => steps[currentStep.value] ?? steps[0]);
const observationPreview = computed(() => {
  const note = snapshot.value.todayNote.trim();
  return note || "今天还没有写今日观察，先用这次复盘把真实情况补完整。";
});

function hydrateForm() {
  const review = existingReview.value;
  form.alignmentScore = review?.alignmentScore ?? snapshot.value.alignmentScore ?? 0;
  form.winsText = review?.winsText ?? "";
  form.missesText = review?.missesText ?? "";
  form.reflectionText = review?.reflectionText ?? "";
  form.tomorrowFixesText = review?.tomorrowFixesText ?? "";
  dirty.value = false;
}

watch(dateKey, hydrateForm, { immediate: true });

function handleScoreChange(event: UniValueEvent) {
  form.alignmentScore = Number(event.detail?.value ?? 0);
  dirty.value = true;
}

function handleTextInput(
  field: "winsText" | "missesText" | "reflectionText" | "tomorrowFixesText",
  event: UniValueEvent,
) {
  form[field] = String(event.detail?.value ?? "");
  dirty.value = true;
}

function persistDraftIfDirty() {
  if (!dirty.value) {
    return;
  }

  store.saveNightReview({
    dateKey: dateKey.value,
    alignmentScore: form.alignmentScore,
    winsText: form.winsText,
    missesText: form.missesText,
    reflectionText: form.reflectionText,
    tomorrowFixesText: form.tomorrowFixesText,
  });
  dirty.value = false;
}

function finalizeReview() {
  store.saveNightReview({
    dateKey: dateKey.value,
    alignmentScore: form.alignmentScore,
    winsText: form.winsText,
    missesText: form.missesText,
    reflectionText: form.reflectionText,
    tomorrowFixesText: form.tomorrowFixesText,
  });

  if (pendingNightPromptId.value) {
    store.resolveReminder(pendingNightPromptId.value, "complete");
  }

  dirty.value = false;

  uni.showToast({
    title: "复盘已保存",
    icon: "success",
  });

  setTimeout(() => {
    handleBack();
  }, 180);
}

function handlePrimaryAction() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
    return;
  }

  finalizeReview();
}

function handleSecondaryAction() {
  if (currentStep.value === 0) {
    handleBack();
    return;
  }

  currentStep.value -= 1;
}

function handleBack() {
  persistDraftIfDirty();
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  switchToTab("/pages/today/index");
}

onShow(() => {
  store.initialize();
  store.refreshReminderPrompts();
  if (!dirty.value) {
    hydrateForm();
  }
});

onHide(() => {
  persistDraftIfDirty();
});
</script>

<style scoped lang="scss">
.night-page,
.night-hero,
.night-card,
.field-block {
  display: flex;
  flex-direction: column;
}

.night-page {
  gap: 24rpx;
}

.night-hero,
.night-card,
.field-block {
  gap: 18rpx;
}

.night-hero__title,
.night-score-block__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
}

.night-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.night-step {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 18rpx 16rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 18rpx;
  background: rgba(24, 24, 27, 0.28);
}

.night-step--active {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.18);
}

.night-step__index {
  color: #71717a;
  font-size: 18rpx;
}

.night-step__title {
  color: #d4d4d8;
  font-size: 22rpx;
}

.night-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.night-summary__item {
  padding: 26rpx 24rpx;
  border: 1px solid rgba(16, 185, 129, 0.16);
  border-radius: 24rpx;
  background: rgba(6, 78, 59, 0.14);
}

.night-summary__value {
  display: block;
  margin-bottom: 10rpx;
  color: #ecfdf5;
  font-size: 36rpx;
  line-height: 1.1;
}

.night-summary__label,
.night-status {
  color: #71717a;
  font-size: 22rpx;
}

.night-score-block {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.night-score-block__head,
.night-footer {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.night-score {
  color: #34d399;
  font-size: 44rpx;
  line-height: 1;
}

.night-slider {
  margin: 6rpx 0 0;
}

.night-score__marks {
  display: flex;
  justify-content: space-between;
  color: #71717a;
  font-size: 20rpx;
}

.night-textarea {
  min-height: 220rpx;
}

.night-status--dirty {
  color: #fb923c;
}

.night-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.night-footer__button {
  justify-content: center;
}
</style>
