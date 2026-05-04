<template>
  <PageShell>
    <view class="editor-page">
      <view class="editor-page__top">
        <button class="editor-page__link" @tap="goBack">返回道路</button>
        <button class="editor-page__link" @tap="openArticleReader">阅读原文</button>
      </view>

      <view class="editor-page__hero">
        <text class="section-label">道路编辑</text>
        <text class="page-title editor-page__title">把愿景和主线整理成真正会驱动今天的内容。</text>
        <text class="muted-text">这里的内容会实时保存，并同步影响今日页、身份页和提醒逻辑。</text>
      </view>

      <view class="glass-card editor-card">
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
import { computed } from "vue";
import PageShell from "@/components/PageShell.vue";
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
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.editor-page__top {
  display: flex;
  gap: 28rpx;
  align-items: center;
}

.editor-page__link {
  color: #71717a;
  font-size: 24rpx;
}

.editor-page__hero {
  display: flex;
  flex-direction: column;
}

.editor-page__title {
  max-width: 620rpx;
}

.editor-card {
  padding: 34rpx 32rpx;
}

.editor-fields,
.field-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.editor-fields {
  gap: 24rpx;
}

.field-label {
  color: #f4f4f5;
  font-size: 24rpx;
  line-height: 1.4;
}
</style>
