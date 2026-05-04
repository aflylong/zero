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
import GlassCard from "@/components/GlassCard.vue";
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

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/path/index" });
}

function openArticleReader() {
  uni.navigateTo({ url: "/pages/article-reader/index" });
}
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
