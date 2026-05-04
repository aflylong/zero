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
        <view class="reader-page__section-head reader-page__section-head--catalog">
          <view class="reader-page__section-copy">
            <SectionLabel>章节导航</SectionLabel>
            <text class="reader-page__section-title">切换章节继续阅读</text>
            <text class="reader-page__section-meta">{{ lastOpenedLabel }}</text>
          </view>
        </view>

        <scroll-view scroll-x show-scrollbar="false" class="reader-page__chapter-scroll">
          <view class="reader-page__chapter-track">
            <button
              v-for="(section, index) in sections"
              :key="section.id"
              class="reader-page__chapter-card"
              :class="chipClass(section.id)"
              @tap="handleOpenSection(section.id)"
            >
              <view class="reader-page__chapter-card-top">
                <text class="reader-page__chapter-card-index">{{ index + 1 }}</text>
                <text v-if="section.id === currentSection.id" class="reader-page__chapter-card-badge">
                  当前
                </text>
                <text
                  v-else-if="completedIds.includes(section.id)"
                  class="reader-page__chapter-card-badge reader-page__chapter-card-badge--done"
                >
                  已读
                </text>
              </view>
              <text class="reader-page__chapter-card-kicker">{{ section.kicker }}</text>
              <text class="reader-page__chapter-card-title">{{ section.title }}</text>
            </button>
          </view>
        </scroll-view>
      </GlassCard>

      <GlassCard card-class="reader-page__article">
        <view class="reader-page__article-head">
          <view class="reader-page__article-meta">
            <SectionLabel>{{ currentSection.kicker }}</SectionLabel>
            <view class="reader-page__chapter-badge">
              <text>第 {{ currentIndex + 1 }} 章</text>
            </view>
          </view>
          <text class="reader-page__article-title">{{ currentSection.title }}</text>
          <text class="body-text reader-page__article-summary">{{ currentSection.summary }}</text>
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
          <view class="reader-page__section-copy">
            <SectionLabel>阅读进度</SectionLabel>
            <text class="reader-page__section-title">读完当前章节后更新进度</text>
          </view>
          <view class="reader-page__read-state" :class="{ 'reader-page__read-state--done': isCurrentCompleted }">
            <text>{{ isCurrentCompleted ? "当前章节已读" : "当前章节未读" }}</text>
          </view>
        </view>

        <view class="reader-page__primary-action">
          <button
            class="pill-button reader-page__primary-button"
            @tap="markCurrentAsRead"
          >
            {{ isCurrentCompleted ? "已记录已读" : "标记当前已读" }}
          </button>
        </view>
        <view class="reader-page__nav-actions">
          <button
            class="ghost-button reader-page__nav-button"
            :disabled="!hasPrevSection"
            @tap="openPrevSection"
          >
            上一章
          </button>
          <button class="ghost-button reader-page__nav-button" @tap="handleNextAction">
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
    "reader-page__chapter-card--active": sectionId === currentSection.value.id,
    "reader-page__chapter-card--done":
      completedIds.value.includes(sectionId) && sectionId !== currentSection.value.id,
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
  gap: 32rpx;
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

.reader-page__catalog,
.reader-page__actions,
.reader-page__source {
  background: rgba(18, 18, 20, 0.68);
}

.reader-page__article {
  padding: 42rpx 36rpx 46rpx;
  border-color: rgba(39, 39, 42, 0.56);
  background: rgba(10, 10, 11, 0.84);
}

.reader-page__section-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.reader-page__section-head {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.reader-page__section-head--catalog {
  margin-bottom: 20rpx;
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
  line-height: 1.55;
}

.reader-page__section-head--catalog .reader-page__section-meta {
  margin-top: 10rpx;
}

.reader-page__chapter-scroll {
  width: 100%;
}

.reader-page__chapter-track {
  display: flex;
  gap: 20rpx;
  padding-right: 18rpx;
}

.reader-page__chapter-card {
  display: flex;
  flex: 0 0 384rpx;
  flex-direction: column;
  gap: 14rpx;
  width: 384rpx;
  min-height: 206rpx;
  padding: 28rpx 28rpx 30rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 30rpx;
  background: linear-gradient(180deg, rgba(20, 20, 22, 0.92), rgba(17, 24, 39, 0.28));
  text-align: left;
  white-space: normal;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  flex-shrink: 0;
}

.reader-page__chapter-card-top {
  display: flex;
  gap: 12rpx;
  align-items: center;
  justify-content: space-between;
}

.reader-page__chapter-card-index {
  color: #a1a1aa;
  font-size: 40rpx;
  line-height: 1;
  font-weight: 600;
}

.reader-page__chapter-card--active .reader-page__chapter-card-index {
  color: #34d399;
}

.reader-page__chapter-card-kicker {
  color: #71717a;
  font-size: 22rpx;
  line-height: 1.4;
}

.reader-page__chapter-card-title {
  color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.5;
  white-space: normal;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  word-break: break-word;
}

.reader-page__chapter-card-badge,
.reader-page__chapter-badge,
.reader-page__read-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92rpx;
  padding: 12rpx 18rpx;
  border: 1px solid rgba(63, 63, 70, 0.72);
  border-radius: 999rpx;
  background: rgba(17, 24, 39, 0.35);
  color: #d4d4d8;
  font-size: 22rpx;
  white-space: nowrap;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
}

.reader-page__chapter-card-badge--done,
.reader-page__read-state--done {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.22);
  color: #d1fae5;
}

.reader-page__chapter-card--active {
  border-color: rgba(16, 185, 129, 0.32);
  background: linear-gradient(180deg, rgba(6, 95, 70, 0.34), rgba(17, 24, 39, 0.36));
  box-shadow: inset 0 0 0 1rpx rgba(52, 211, 153, 0.14);
}

.reader-page__chapter-card--done {
  border-color: rgba(82, 82, 91, 0.88);
  background: linear-gradient(180deg, rgba(24, 24, 27, 0.72), rgba(17, 24, 39, 0.2));
}

.reader-page__article-head {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.reader-page__article-meta {
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.reader-page__article-summary {
  display: block;
}

.reader-page__accent-line {
  margin-bottom: 30rpx;
  padding: 4rpx 0 4rpx 24rpx;
  border-left: 4rpx solid rgba(52, 211, 153, 0.8);
  border-radius: 0;
  background: transparent;
  color: #d1fae5;
  font-size: 28rpx;
  line-height: 1.68;
}

.reader-page__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reader-page__paragraph {
  display: flex;
  gap: 14rpx;
  color: #d4d4d8;
  font-size: 28rpx;
  line-height: 1.82;
}

.reader-page__paragraph--quote {
  padding-left: 24rpx;
  border-left: 4rpx solid rgba(113, 113, 122, 0.65);
  background: transparent;
  color: #f4f4f5;
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

.reader-page__primary-action {
  margin-bottom: 16rpx;
}

.reader-page__primary-button {
  width: 100%;
  justify-content: center;
}

.reader-page__nav-actions {
  display: flex;
  gap: 16rpx;
}

.reader-page__nav-button {
  flex: 1;
  justify-content: center;
}

.reader-page__nav-button[disabled] {
  opacity: 0.45;
}
</style>
