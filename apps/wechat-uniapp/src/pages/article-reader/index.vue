<template>
  <PageShell>
    <view class="reader-page">
      <view class="reader-page__topbar">
        <button class="ghost-button reader-page__back" @tap="goBack">返回</button>
        <view class="reader-page__progress-meta">
          <text class="reader-page__progress-label">已读 {{ completedCount }}/{{ totalSections }}</text>
          <text class="muted-text">{{ progressPercent }}% 进度</text>
        </view>
      </view>

      <GradientHeroCard card-class="reader-page__hero">
        <SectionLabel>文章阅读器</SectionLabel>
        <view class="section-stack">
          <text class="page-title">{{ articleTitle }}</text>
          <text class="body-text">
            沿着章节往前读，把结构、提醒、复盘和记录串成一套能落地的系统。
          </text>
        </view>
        <view class="reader-page__hero-progress">
          <view class="progress-track">
            <view class="progress-bar" :style="{ width: `${progressPercent}%` }" />
          </view>
          <text class="reader-page__hero-progress-text">
            当前章节：{{ currentIndex + 1 }} / {{ totalSections }}
          </text>
        </view>
      </GradientHeroCard>

      <GlassCard card-class="reader-page__catalog">
        <view class="reader-page__section-head">
          <view class="section-stack">
            <SectionLabel>章节导航</SectionLabel>
            <text class="reader-page__section-title">切换章节继续阅读</text>
          </view>
          <text class="reader-page__section-meta">{{ lastOpenedLabel }}</text>
        </view>

        <scroll-view scroll-x class="reader-page__chips">
          <view class="reader-page__chips-track">
            <button
              v-for="(section, index) in sections"
              :key="section.id"
              class="tag-chip reader-page__chip"
              :class="chipClass(section.id)"
              @tap="handleOpenSection(section.id)"
            >
              <text class="reader-page__chip-index">{{ index + 1 }}</text>
              <text>{{ section.title }}</text>
            </button>
          </view>
        </scroll-view>
      </GlassCard>

      <GlassCard card-class="reader-page__article">
        <view class="reader-page__section-head">
          <view class="section-stack">
            <SectionLabel>{{ currentSection.kicker }}</SectionLabel>
            <text class="reader-page__article-title">{{ currentSection.title }}</text>
            <text class="body-text">{{ currentSection.summary }}</text>
          </view>
          <view class="reader-page__chapter-badge">
            <text>第 {{ currentIndex + 1 }} 章</text>
          </view>
        </view>

        <view class="reader-page__accent-line">
          <text>{{ currentSection.accent }}</text>
        </view>

        <view class="reader-page__paragraphs">
          <view
            v-for="paragraph in currentSection.paragraphs"
            :key="paragraph.id"
            class="reader-page__paragraph"
            :class="paragraphClass(paragraph.type)"
          >
            <text v-if="paragraph.type === 'bullet'" class="reader-page__bullet-mark">•</text>
            <text class="reader-page__paragraph-text">{{ paragraph.text }}</text>
          </view>
        </view>
      </GlassCard>

      <GlassCard card-class="reader-page__actions">
        <view class="reader-page__section-head">
          <view class="section-stack">
            <SectionLabel>阅读进度</SectionLabel>
            <text class="reader-page__section-title">读完当前章节后更新进度</text>
          </view>
          <view class="reader-page__read-state" :class="{ 'reader-page__read-state--done': isCurrentCompleted }">
            <text>{{ isCurrentCompleted ? "当前章节已读" : "当前章节未读" }}</text>
          </view>
        </view>

        <view class="action-row">
          <button
            class="pill-button"
            @tap="markCurrentAsRead"
          >
            {{ isCurrentCompleted ? "已记录已读" : "标记当前已读" }}
          </button>
          <button
            class="ghost-button"
            :disabled="!hasPrevSection"
            @tap="openPrevSection"
          >
            上一章
          </button>
          <button class="ghost-button" @tap="handleNextAction">
            {{ hasNextSection ? "下一章" : "完成阅读" }}
          </button>
        </view>
      </GlassCard>

      <GlassCard card-class="reader-page__source">
        <SectionLabel>文章来源</SectionLabel>
        <view class="section-stack">
          <text class="reader-page__source-title">{{ articleTitle }}</text>
          <text class="muted-text">
            当前阅读页使用的是适配小程序体验的章节化内容，必要时你也可以回到原始文章来源继续阅读。
          </text>
          <button class="ghost-button reader-page__source-button" @tap="copySourceLink">
            复制原文链接
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
import { articleSections, articleSourceUrl, articleTitle } from "@/static/content/article";
import { useAppStore } from "@/stores/useAppStore";
import type { ArticleParagraph } from "@/types/app";

const store = useAppStore();

onShow(() => {
  store.initialize();
  const currentId = store.state.data.articleProgress.currentSectionId;
  if (currentId) {
    store.openArticleSection(currentId);
  }
});

const sections = articleSections;
const totalSections = sections.length;

const currentSection = computed(() => store.currentArticleSection.value);
const completedIds = computed(() => store.state.data.articleProgress.completedSectionIds);
const completedCount = computed(() => completedIds.value.length);
const progressPercent = computed(() =>
  totalSections ? Math.round((completedCount.value / totalSections) * 100) : 0,
);
const currentIndex = computed(() =>
  sections.findIndex((section) => section.id === currentSection.value.id),
);
const isCurrentCompleted = computed(() =>
  completedIds.value.includes(currentSection.value.id),
);
const hasPrevSection = computed(() => currentIndex.value > 0);
const hasNextSection = computed(() => currentIndex.value < totalSections - 1);
const lastOpenedLabel = computed(() => {
  const lastOpenedAt = store.state.data.articleProgress.lastOpenedAt;
  if (!lastOpenedAt) {
    return "首次阅读";
  }

  const date = new Date(lastOpenedAt);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `上次打开 ${month}/${day} ${hour}:${minute}`;
});

function chipClass(sectionId: string) {
  return {
    "tag-chip--active": sectionId === currentSection.value.id,
    "reader-page__chip--done": completedIds.value.includes(sectionId),
  };
}

function paragraphClass(type: ArticleParagraph["type"]) {
  return {
    "reader-page__paragraph--quote": type === "quote",
    "reader-page__paragraph--bullet": type === "bullet",
  };
}

function handleOpenSection(sectionId: string) {
  store.openArticleSection(sectionId);
}

function markCurrentAsRead() {
  if (isCurrentCompleted.value) {
    return;
  }
  store.markArticleSectionRead(currentSection.value.id);
}

function openPrevSection() {
  if (!hasPrevSection.value) {
    return;
  }
  store.openArticleSection(sections[currentIndex.value - 1].id);
}

function handleNextAction() {
  if (!isCurrentCompleted.value) {
    store.markArticleSectionRead(currentSection.value.id);
  }

  if (!hasNextSection.value) {
    goBack();
    return;
  }

  store.openArticleSection(sections[currentIndex.value + 1].id);
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/path/index" });
}

function copySourceLink() {
  uni.setClipboardData({
    data: articleSourceUrl,
    showToast: false,
    success: () => {
      uni.showToast({
        title: "原文链接已复制",
        icon: "success",
      });
    },
  });
}
</script>

<style scoped lang="scss">
.reader-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.reader-page__topbar {
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
}

.reader-page__back {
  flex-shrink: 0;
}

.reader-page__progress-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  align-items: flex-end;
}

.reader-page__progress-label {
  color: #f5f5f5;
  font-size: 26rpx;
}

.reader-page__hero {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;
  overflow: hidden;
}

.reader-page__hero::after {
  content: "";
  position: absolute;
  right: -70rpx;
  bottom: -120rpx;
  width: 260rpx;
  height: 260rpx;
  border-radius: 999rpx;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0) 74%);
  pointer-events: none;
}

.reader-page__hero-progress {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reader-page__hero-progress-text {
  color: rgba(209, 250, 229, 0.86);
  font-size: 22rpx;
}

.reader-page__catalog,
.reader-page__article,
.reader-page__actions,
.reader-page__source {
  display: flex;
  flex-direction: column;
}

.reader-page__section-head {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.reader-page__section-title,
.reader-page__article-title {
  color: #f5f5f5;
  line-height: 1.28;
}

.reader-page__section-title {
  font-size: 34rpx;
}

.reader-page__article-title {
  font-size: 42rpx;
}

.reader-page__section-meta {
  color: #71717a;
  font-size: 22rpx;
  white-space: nowrap;
}

.reader-page__chips {
  white-space: nowrap;
}

.reader-page__chips-track {
  display: inline-flex;
  gap: 16rpx;
}

.reader-page__chip {
  display: inline-flex;
  gap: 12rpx;
  align-items: center;
}

.reader-page__chip--done {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.22);
  color: #d1fae5;
}

.reader-page__chip-index {
  opacity: 0.72;
}

.reader-page__chapter-badge,
.reader-page__read-state {
  padding: 14rpx 22rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 999rpx;
  background: rgba(17, 24, 39, 0.35);
  color: #d4d4d8;
  font-size: 22rpx;
  white-space: nowrap;
}

.reader-page__read-state--done {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.26);
  color: #bbf7d0;
}

.reader-page__accent-line {
  margin-bottom: 24rpx;
  padding: 24rpx 28rpx;
  border-left: 4rpx solid rgba(52, 211, 153, 0.8);
  border-radius: 0 24rpx 24rpx 0;
  background: linear-gradient(90deg, rgba(6, 95, 70, 0.24) 0%, rgba(17, 24, 39, 0.08) 100%);
  color: #d1fae5;
  font-size: 26rpx;
  line-height: 1.7;
}

.reader-page__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.reader-page__paragraph {
  display: flex;
  gap: 14rpx;
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.82;
}

.reader-page__paragraph--quote {
  padding: 24rpx 28rpx;
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 24rpx;
  background: rgba(6, 95, 70, 0.16);
  color: #ecfdf5;
}

.reader-page__paragraph--bullet {
  align-items: flex-start;
}

.reader-page__bullet-mark {
  color: #34d399;
}

.reader-page__paragraph-text {
  flex: 1;
}

.reader-page__source-title {
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.35;
}

.reader-page__source-button {
  align-self: flex-start;
}
</style>
