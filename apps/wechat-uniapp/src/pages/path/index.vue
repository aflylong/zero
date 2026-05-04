<template>
  <PageShell tab-key="path">
    <view class="section-stack">
      <GradientHeroCard card-class="path-hero">
        <view class="section-stack">
          <text class="hero-title">{{ heroTitle }}</text>
          <text class="body-text">{{ heroSubtitle }}</text>
          <view class="action-row">
            <button class="pill-button path-hero__button" @tap="openArticleReader">
              去读文章原文
            </button>
            <text class="tag-chip">
              当前章节 {{ currentArticleKicker }}
            </text>
          </view>
        </view>
      </GradientHeroCard>

      <GlassCard>
        <SectionLabel>目标方向</SectionLabel>
        <view class="section-stack">
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
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>推进原因</SectionLabel>
        <view class="section-stack">
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
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>主线任务</SectionLabel>
        <view class="section-stack">
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
          <view class="glass-card path-summary">
            <text class="path-summary__label">系统会如何使用这条主线</text>
            <text class="muted-text">
              今日页会把这条主线直接显示为当天主任务，夜间复盘也会围绕它判断你是否真的在推进。
            </text>
          </view>
        </view>
      </GlassCard>

      <GlassCard>
        <SectionLabel>阅读入口</SectionLabel>
        <view class="section-stack">
          <text class="muted-text">
            需要重新校准时，直接回到文章阅读页，把愿景、身份和提醒系统重新对齐。
          </text>
          <button class="ghost-button block-button" @tap="openArticleReader">
            打开文章阅读页
          </button>
        </view>
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

const mainQuestTitle = computed({
  get: () => store.state.data.visionProfile.mainQuestTitle,
  set: (value: string) => store.updateVisionProfile({ mainQuestTitle: value }),
});

const mainQuestDescription = computed({
  get: () => store.state.data.visionProfile.mainQuestDescription,
  set: (value: string) => store.updateVisionProfile({ mainQuestDescription: value }),
});

const heroTitle = computed(() => mainQuestTitle.value.trim() || "先定义你的主线任务");
const heroSubtitle = computed(() => {
  return (
    whyChangeText.value.trim() ||
    "把模糊的想变好，变成一条会被今日页、提醒和复盘持续使用的路径。"
  );
});

const currentArticleKicker = computed(
  () => store.currentArticleSection.value?.kicker || "方法总览",
);

onShow(() => {
  if (!store.state.data.onboardingCompleted) {
    uni.reLaunch({ url: "/pages/onboarding/index" });
  }
});

function openArticleReader() {
  uni.navigateTo({
    url: "/pages/article-reader/index",
  });
}
</script>

<style scoped lang="scss">
.path-hero {
  overflow: hidden;
}

.path-hero__button {
  min-width: 220rpx;
}

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

.path-summary {
  gap: 12rpx;
  padding: 28rpx;
  border-radius: 26rpx;
}

.path-summary__label {
  color: #f4f4f5;
  font-size: 24rpx;
}

.block-button {
  justify-content: center;
}
</style>
