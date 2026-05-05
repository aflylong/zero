<template>
  <PageShell tab-key="identity">
    <view class="identity-page">
      <GradientHeroCard card-class="identity-hero">
        <SectionLabel>你是谁</SectionLabel>
        <text class="identity-hero__title">{{ statementPreview }}</text>
        <text class="muted-text">{{ antiIdentityPreview }}</text>
        <view class="identity-hero__actions">
          <button class="pill-button" @tap="openIdentityEditor">编辑身份</button>
          <button class="ghost-button" @tap="openIdentityEditor">管理法则</button>
        </view>
      </GradientHeroCard>

      <GlassCard card-class="identity-card">
        <SectionLabel>核心信念</SectionLabel>
        <view v-if="beliefs.length" class="identity-list">
          <view
            v-for="(belief, index) in beliefs"
            :key="`identity-belief-${index}`"
            class="identity-list__item"
          >
            <view class="identity-list__dot" />
            <text class="identity-list__text">{{ belief }}</text>
          </view>
        </view>
        <text v-else class="muted-text">先写下一句你愿意反复执行的信念，身份页才会真正站住。</text>
      </GlassCard>

      <GlassCard card-class="identity-card">
        <view class="identity-card__head">
          <SectionLabel>证明法则摘要</SectionLabel>
          <button class="ghost-button identity-card__head-button" @tap="openIdentityEditor">
            管理
          </button>
        </view>
        <text class="identity-card__title">{{ proofSummaryTitle }}</text>
        <view v-if="activeProofRules.length" class="identity-rules">
          <view
            v-for="rule in activeProofRules"
            :key="rule.id"
            class="identity-rule"
          >
            <text class="identity-rule__title">{{ rule.title }}</text>
            <text v-if="rule.description.trim()" class="identity-rule__description">
              {{ rule.description }}
            </text>
          </view>
        </view>
        <text v-else class="muted-text">还没有生效中的证明法则，先去编辑页补上一条真实动作。</text>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { ensureOnboardingReady } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

const beliefs = computed(() => store.state.data.identityProfile.beliefs.filter((item) => item.trim()));
const activeProofRules = computed(() => store.activeProofRules());
const antiIdentityPreview = computed(
  () =>
    store.state.data.identityProfile.antiIdentityText.trim() ||
    "把那个你不愿再继续扮演的旧版本说清楚，它会提醒你别重新回去。",
);
const statementPreview = computed(
  () => store.state.data.identityProfile.statement.trim() || "先决定你是谁",
);
const proofSummaryTitle = computed(() => {
  if (!activeProofRules.value.length) {
    return "还没有形成可验证的身份动作。";
  }

  return `当前生效 ${activeProofRules.value.length} 条法则，它们决定你每天如何证明这句话。`;
});

function openIdentityEditor() {
  uni.navigateTo({
    url: "/pages/identity-editor/index",
  });
}

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }
});
</script>

<style scoped lang="scss">
.identity-page,
.identity-hero,
.identity-card,
.identity-list,
.identity-rules {
  display: flex;
  flex-direction: column;
}

.identity-page {
  gap: 26rpx;
}

.identity-hero,
.identity-card,
.identity-list,
.identity-rules {
  gap: 18rpx;
}

.identity-hero__title,
.identity-card__title {
  color: #ecfdf5;
  line-height: 1.3;
}

.identity-hero__title {
  font-size: 52rpx;
}

.identity-card__title {
  font-size: 32rpx;
}

.identity-hero__actions,
.identity-card__head {
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.identity-hero__actions {
  justify-content: flex-start;
  padding-top: 4rpx;
}

.identity-card__head-button {
  padding: 12rpx 22rpx;
}

.identity-list__item,
.identity-rule {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(10, 10, 11, 0.34);
}

.identity-list__dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: #34d399;
  flex-shrink: 0;
}

.identity-list__text,
.identity-rule__title {
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.64;
}

.identity-rule {
  flex-direction: column;
}

.identity-rule__description {
  color: #71717a;
  font-size: 24rpx;
  line-height: 1.68;
}

</style>
