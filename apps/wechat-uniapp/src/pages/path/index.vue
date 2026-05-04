<template>
  <PageShell tab-key="path">
    <view class="path-page">
      <view class="path-heading">
        <view class="path-heading__icon">
          <view class="path-heading__icon-core" />
        </view>
        <text class="page-title">你的道路</text>
      </view>

      <view class="path-section">
        <SectionLabel>愿景</SectionLabel>
        <text class="path-section__headline">{{ visionPreview }}</text>
      </view>

      <view class="path-section">
        <SectionLabel>身份</SectionLabel>
        <view class="path-identity-panel">
          <text class="path-identity-panel__text">{{ identityStatement }}</text>
        </view>
      </view>

      <view class="path-section">
        <SectionLabel>每日证明法则</SectionLabel>
        <view v-if="activeProofRules.length" class="path-rules">
          <view
            v-for="(rule, index) in activeProofRules"
            :key="rule.id"
            class="path-rule"
          >
            <view class="path-rule__index">
              <text>{{ index + 1 }}</text>
            </view>
            <view class="path-rule__copy">
              <text class="path-rule__title">{{ rule.title }}</text>
              <text v-if="rule.description.trim()" class="path-rule__description">
                {{ rule.description }}
              </text>
            </view>
          </view>
        </view>
        <view v-else class="path-empty">
          <text class="path-empty__title">还没有生效中的证明法则</text>
          <text class="muted-text">先在身份页补上一条真实动作，这里就会长出真正的路径感。</text>
        </view>
      </view>

      <view class="path-actions">
        <button class="path-actions__link" @tap="showEditor = !showEditor">
          {{ showEditor ? "收起编辑区" : "编辑道路" }}
        </button>
        <button class="path-actions__link" @tap="openArticleReader">阅读原文</button>
        <button v-if="!store.state.data.onboardingCompleted" class="path-actions__link" @tap="openOnboarding">
          初始化
        </button>
      </view>

      <view v-if="showEditor" class="glass-card path-editor">
        <view class="path-editor__fields">
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
              placeholder="描述那个让你不愿回去的旧轨道。"
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
            <text class="field-label">主线任务标题</text>
            <input
              v-model="mainQuestTitle"
              class="input-shell"
              maxlength="24"
              placeholder="例如：7 天重塑系统"
            />
          </view>

          <view class="field-block">
            <text class="field-label">主线任务说明</text>
            <textarea
              v-model="mainQuestDescription"
              class="textarea-shell"
              maxlength="220"
              auto-height
              placeholder="说明这条主线会如何改变你接下来的一周。"
            />
          </view>
        </view>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();
const showEditor = ref(false);

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

const mainQuestTitle = computed({
  get: () => store.state.data.visionProfile.mainQuestTitle,
  set: (value: string) => store.updateVisionProfile({ mainQuestTitle: value }),
});

const mainQuestDescription = computed({
  get: () => store.state.data.visionProfile.mainQuestDescription,
  set: (value: string) => store.updateVisionProfile({ mainQuestDescription: value }),
});

const visionPreview = computed(
  () =>
    visionText.value.trim() ||
    "先把你真正想去的生活画面写清楚，这里会成为整个系统的远方。",
);
const identityStatement = computed(
  () => store.state.data.identityProfile.statement.trim() || "先决定你是谁",
);
const activeProofRules = computed(() => store.activeProofRules());

function openArticleReader() {
  uni.navigateTo({
    url: "/pages/article-reader/index",
  });
}

function openOnboarding() {
  uni.navigateTo({
    url: "/pages/onboarding/index",
  });
}
</script>

<style scoped lang="scss">
.path-page {
  display: flex;
  flex-direction: column;
  gap: 54rpx;
}

.path-heading {
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.path-heading__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: 999rpx;
  background: rgba(6, 78, 59, 0.16);
}

.path-heading__icon-core {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #34d399;
  box-shadow: 0 0 18rpx rgba(52, 211, 153, 0.46);
}

.path-section {
  display: flex;
  flex-direction: column;
}

.path-section__headline {
  color: #fafafa;
  font-size: 48rpx;
  line-height: 1.52;
}

.path-identity-panel {
  padding: 38rpx 34rpx;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 30rpx;
  background: linear-gradient(145deg, rgba(6, 78, 59, 0.18), rgba(17, 24, 39, 0.06));
}

.path-identity-panel__text {
  color: #ecfdf5;
  font-size: 40rpx;
  line-height: 1.52;
}

.path-rules {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.path-rule {
  display: flex;
  align-items: flex-start;
  gap: 22rpx;
  padding: 32rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.34);
}

.path-rule__index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  margin-top: 2rpx;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 999rpx;
  background: rgba(6, 78, 59, 0.14);
  color: #34d399;
  font-size: 20rpx;
  flex-shrink: 0;
}

.path-rule__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
}

.path-rule__title {
  color: #e4e4e7;
  font-size: 28rpx;
  line-height: 1.58;
}

.path-rule__description {
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.68;
}

.path-empty {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.path-empty__title {
  color: #f4f4f5;
  font-size: 30rpx;
  line-height: 1.46;
}

.path-actions {
  display: flex;
  gap: 28rpx;
  align-items: center;
  flex-wrap: wrap;
}

.path-actions__link {
  color: #71717a;
  font-size: 24rpx;
}

.path-editor {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.path-editor__fields,
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
</style>
