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
        <button class="path-actions__link" @tap="openPathEditor">调整愿景与主线</button>
        <button class="path-actions__link" @tap="openArticleReader">阅读原文</button>
        <button v-if="!store.state.data.onboardingCompleted" class="path-actions__link" @tap="openOnboarding">
          完成初始化
        </button>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const visionPreview = computed(
  () =>
    store.state.data.visionProfile.visionText.trim() ||
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

function openPathEditor() {
  uni.navigateTo({
    url: "/pages/path-editor/index",
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
</style>
