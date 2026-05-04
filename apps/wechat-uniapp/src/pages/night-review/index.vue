<template>
  <PageShell>
    <view class="section-stack night-page">
      <GradientHeroCard card-class="night-hero">
        <view class="night-hero__top">
          <button class="ghost-button" @tap="goBack">返回今日</button>
          <text class="night-hero__date">{{ dateKey }}</text>
        </view>
        <SectionLabel>夜间复盘</SectionLabel>
        <text class="page-title">把今天变成明天的燃料</text>
        <text class="body-text">
          写下赢点、偏离点和修正动作，让复盘真正影响明天，而不是只在脑子里打转。
        </text>
      </GradientHeroCard>

      <GlassCard card-class="night-card">
        <SectionLabel>今日概况</SectionLabel>
        <view class="night-summary">
          <view class="night-summary__item">
            <text class="night-summary__value">{{ completedProofCount }}</text>
            <text class="night-summary__label">完成证明</text>
          </view>
          <view class="night-summary__item">
            <text class="night-summary__value">{{ snapshot.alignmentScore }}%</text>
            <text class="night-summary__label">系统计算对齐度</text>
          </view>
        </view>
        <text class="muted-text">{{ observationPreview }}</text>
      </GlassCard>

      <GlassCard card-class="night-card">
        <view class="night-card__header">
          <view>
            <SectionLabel>对齐评分</SectionLabel>
            <text class="night-card__title">你主观上给今天打多少分</text>
          </view>
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
          <text>强势推进</text>
        </view>
      </GlassCard>

      <GlassCard card-class="night-card">
        <SectionLabel>赢点</SectionLabel>
        <textarea
          class="textarea-shell night-textarea"
          :value="form.winsText"
          maxlength="500"
          placeholder="今天哪几个动作最像你想成为的那个人？"
          @input="handleTextInput('winsText', $event)"
        />
      </GlassCard>

      <GlassCard card-class="night-card">
        <SectionLabel>偏离点</SectionLabel>
        <textarea
          class="textarea-shell night-textarea"
          :value="form.missesText"
          maxlength="500"
          placeholder="你在哪些时刻被惯性、分心或逃避带偏了？"
          @input="handleTextInput('missesText', $event)"
        />
      </GlassCard>

      <GlassCard card-class="night-card">
        <SectionLabel>反思</SectionLabel>
        <textarea
          class="textarea-shell night-textarea"
          :value="form.reflectionText"
          maxlength="500"
          placeholder="这些赢点和偏离点背后，真正的问题是什么？"
          @input="handleTextInput('reflectionText', $event)"
        />
      </GlassCard>

      <GlassCard card-class="night-card">
        <SectionLabel>明日修正</SectionLabel>
        <textarea
          class="textarea-shell night-textarea"
          :value="form.tomorrowFixesText"
          maxlength="500"
          placeholder="明天最小但最关键的修正动作是什么？"
          @input="handleTextInput('tomorrowFixesText', $event)"
        />
        <view class="night-actions">
          <text class="night-actions__status" :class="{ 'night-actions__status--dirty': dirty }">
            {{ dirty ? "有未保存修改" : "内容已同步到本地存储" }}
          </text>
          <button class="pill-button" @tap="saveReview">保存复盘</button>
        </view>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

const store = useAppStore();

const dirty = ref(false);
const form = reactive({
  alignmentScore: 0,
  winsText: "",
  missesText: "",
  reflectionText: "",
  tomorrowFixesText: "",
});

const dateKey = computed(() => store.state.activeDateKey);
const snapshot = computed(() => store.today.value.snapshot);
const completedProofCount = computed(() => snapshot.value.completedProofRuleIds.length);
const existingReview = computed(() => store.state.data.nightReviews[dateKey.value] ?? null);
const pendingNightPromptId = computed(
  () =>
    store.state.pendingReminderPrompts.find((prompt) => prompt.kind === "night")?.ruleId ?? null,
);
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

function saveReview(showToast = true) {
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

  if (pendingNightPromptId.value) {
    store.resolveReminder(pendingNightPromptId.value, "complete");
  }

  dirty.value = false;

  if (showToast) {
    uni.showToast({
      title: "复盘已保存",
      icon: "success",
    });
  }
}

function goBack() {
  saveReview(false);
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/today/index" });
}

onShow(() => {
  if (!store.state.data.onboardingCompleted) {
    uni.reLaunch({ url: "/pages/onboarding/index" });
    return;
  }

  store.refreshReminderPrompts();
  if (!dirty.value) {
    hydrateForm();
  }
});

onHide(() => {
  saveReview(false);
});
</script>

<style scoped lang="scss">
.night-page {
  gap: 26rpx;
}

.night-hero,
.night-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.night-hero__top,
.night-card__header,
.night-actions {
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
}

.night-hero__date {
  color: rgba(209, 250, 229, 0.86);
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

.night-summary__label {
  color: #71717a;
  font-size: 22rpx;
}

.night-card__title {
  display: block;
  color: #f5f5f5;
  font-size: 32rpx;
  line-height: 1.4;
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
  min-height: 200rpx;
}

.night-actions {
  margin-top: 4rpx;
}

.night-actions__status {
  color: #34d399;
  font-size: 22rpx;
}

.night-actions__status--dirty {
  color: #fb923c;
}
</style>
