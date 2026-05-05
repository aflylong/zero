<template>
  <view class="reader-root">
    <PageShell
      title="原文阅读"
      topbar-mode="secondary"
      back-url="/pages/path/index"
    >
      <template #topbar-right>
        <button class="reader-topbar__button" @tap="showCatalog = true">目录</button>
      </template>

      <view class="reader-page">
        <view class="reader-meta">
          <text class="reader-meta__progress">已读 {{ completedCount }}/{{ totalSections }}</text>
          <text class="reader-meta__source">{{ articleTitle }}</text>
        </view>

        <view class="reader-header">
          <SectionLabel>{{ currentSection.kicker }}</SectionLabel>
          <view class="reader-header__info">
            <button
              class="reader-header__prev"
              :disabled="!hasPrevSection"
              @tap="openPrevSection"
            >
              上一章
            </button>
            <text class="reader-header__chapter">第 {{ currentIndex + 1 }} 章</text>
          </view>
          <view class="reader-header__title-row">
            <text class="reader-header__title">{{ currentSection.title }}</text>
            <button class="reader-header__read" @tap="markCurrentAsRead">
              {{ isCurrentCompleted ? "已读" : "标记已读" }}
            </button>
          </view>
          <text class="body-text">{{ currentSection.summary }}</text>
        </view>

        <view class="reader-accent">
          <text>{{ currentSection.accent }}</text>
        </view>

        <view class="reader-paragraphs">
          <view
            v-for="paragraph in currentSection.paragraphs"
            :key="paragraph.id"
            class="reader-paragraph"
            :class="paragraphClass(paragraph.type)"
          >
            <text v-if="paragraph.type === 'bullet'" class="reader-paragraph__bullet">•</text>
            <text class="reader-paragraph__text">{{ paragraph.text }}</text>
          </view>
        </view>

        <text class="reader-note">章节化原文已内置在本地，阅读进度会真实保存。</text>
      </view>

      <template #footer>
        <view class="reader-footer">
          <button class="pill-button reader-footer__button" @tap="handleNextAction">
            {{ hasNextSection ? "下一章" : "完成阅读" }}
          </button>
        </view>
      </template>
    </PageShell>

    <view v-if="showCatalog" class="reader-catalog">
      <view class="reader-catalog__mask" @tap="showCatalog = false" />
      <view class="reader-catalog__panel">
        <view class="reader-catalog__head">
          <view class="reader-catalog__copy">
            <SectionLabel>章节目录</SectionLabel>
            <text class="reader-catalog__title">{{ articleTitle }}</text>
            <text class="muted-text">{{ progressPercent }}% 已读</text>
          </view>
          <button class="ghost-button" @tap="showCatalog = false">收起</button>
        </view>

        <scroll-view scroll-y class="reader-catalog__scroll" show-scrollbar="false">
          <view class="reader-catalog__list">
            <button
              v-for="(section, index) in sections"
              :key="section.id"
              class="reader-catalog__item"
              :class="catalogItemClass(section.id)"
              @tap="openCatalogSection(section.id)"
            >
              <view class="reader-catalog__item-top">
                <text class="reader-catalog__item-index">0{{ index + 1 }}</text>
                <text v-if="section.id === currentSection.id" class="reader-catalog__badge">当前</text>
                <text
                  v-else-if="completedIds.includes(section.id)"
                  class="reader-catalog__badge reader-catalog__badge--done"
                >
                  已读
                </text>
              </view>
              <text class="reader-catalog__item-kicker">{{ section.kicker }}</text>
              <text class="reader-catalog__item-title">{{ section.title }}</text>
            </button>
          </view>
        </scroll-view>

        <view class="reader-catalog__foot">
          <button class="ghost-button" @tap="copySourceLink">复制原文链接</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { ensureOnboardingReady, switchToTab } from "@/services/navigation";
import { articleSections, articleSourceUrl, articleTitle } from "@/static/content/article";
import { useAppStore } from "@/stores/useAppStore";
import type { ArticleParagraph } from "@/types/app";

const store = useAppStore();
const showCatalog = ref(false);
const sections = articleSections;
const totalSections = sections.length;

const currentSection = computed(() => store.currentArticleSection.value);
const completedIds = computed(() => store.state.data.articleProgress.completedSectionIds);
const completedCount = computed(() => completedIds.value.length);
const progressPercent = computed(() =>
  totalSections ? Math.round((completedCount.value / totalSections) * 100) : 0,
);
const currentIndex = computed(() =>
  Math.max(0, sections.findIndex((section) => section.id === currentSection.value.id)),
);
const isCurrentCompleted = computed(() =>
  completedIds.value.includes(currentSection.value.id),
);
const hasPrevSection = computed(() => currentIndex.value > 0);
const hasNextSection = computed(() => currentIndex.value < totalSections - 1);

function paragraphClass(type: ArticleParagraph["type"]) {
  return {
    "reader-paragraph--quote": type === "quote",
    "reader-paragraph--bullet": type === "bullet",
  };
}

function catalogItemClass(sectionId: string) {
  return {
    "reader-catalog__item--active": sectionId === currentSection.value.id,
    "reader-catalog__item--done":
      completedIds.value.includes(sectionId) && sectionId !== currentSection.value.id,
  };
}

function openCatalogSection(sectionId: string) {
  store.openArticleSection(sectionId);
  showCatalog.value = false;
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

  switchToTab("/pages/path/index");
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

onShow(() => {
  store.initialize();
  if (!ensureOnboardingReady(store.state.data.onboardingCompleted)) {
    return;
  }

  const currentId = store.state.data.articleProgress.currentSectionId;
  if (currentId) {
    store.openArticleSection(currentId);
  }
});
</script>

<style scoped lang="scss">
.reader-root,
.reader-page,
.reader-header,
.reader-paragraphs,
.reader-catalog__copy,
.reader-catalog__list {
  display: flex;
  flex-direction: column;
}

.reader-page {
  gap: 28rpx;
}

.reader-meta {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.reader-meta__progress,
.reader-header__chapter,
.reader-note,
.reader-catalog__item-kicker {
  color: #71717a;
  font-size: 22rpx;
  line-height: 1.5;
}

.reader-meta__source {
  color: #a1a1aa;
  font-size: 22rpx;
}

.reader-header {
  gap: 18rpx;
}

.reader-header__info,
.reader-header__title-row {
  display: flex;
  gap: 18rpx;
  align-items: center;
  justify-content: space-between;
}

.reader-header__title-row {
  align-items: flex-start;
}

.reader-header__title,
.reader-catalog__title {
  color: #f5f5f5;
  font-size: 42rpx;
  line-height: 1.32;
}

.reader-header__title {
  flex: 1;
}

.reader-header__prev,
.reader-header__read {
  padding: 12rpx 20rpx;
  border: 1px solid rgba(63, 63, 70, 0.64);
  border-radius: 999rpx;
  color: #d4d4d8;
  font-size: 22rpx;
  line-height: 1.3;
}

.reader-header__read {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.18);
  color: #d1fae5;
  flex-shrink: 0;
}

.reader-accent {
  padding: 0 0 0 24rpx;
  border-left: 4rpx solid rgba(52, 211, 153, 0.8);
}

.reader-accent text {
  color: #d1fae5;
  font-size: 30rpx;
  line-height: 1.7;
}

.reader-paragraphs {
  gap: 24rpx;
}

.reader-paragraph {
  display: flex;
  gap: 14rpx;
}

.reader-paragraph__text {
  flex: 1;
  color: #d4d4d8;
  font-size: 30rpx;
  line-height: 1.8;
}

.reader-paragraph--quote {
  padding: 0 0 0 24rpx;
  border-left: 4rpx solid rgba(63, 63, 70, 0.9);
}

.reader-paragraph--quote .reader-paragraph__text {
  color: #f5f5f5;
}

.reader-paragraph__bullet {
  color: #34d399;
  font-size: 28rpx;
  line-height: 1.8;
}

.reader-note {
  padding-bottom: 12rpx;
}

.reader-footer {
  display: flex;
}

.reader-footer__button,
.reader-topbar__button {
  justify-content: center;
}

.reader-footer__button {
  width: 100%;
}

.reader-catalog {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.reader-catalog__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

.reader-catalog__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 84%;
  max-width: 520rpx;
  padding: calc(env(safe-area-inset-top) + 28rpx) 28rpx calc(env(safe-area-inset-bottom) + 28rpx);
  background: #050505;
  border-left: 1px solid rgba(39, 39, 42, 0.88);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.reader-catalog__head,
.reader-catalog__item-top,
.reader-catalog__foot {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.reader-catalog__scroll {
  flex: 1;
  min-height: 0;
}

.reader-catalog__list {
  gap: 16rpx;
}

.reader-catalog__item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 24rpx;
  background: rgba(24, 24, 27, 0.34);
  text-align: left;
}

.reader-catalog__item--active {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(6, 95, 70, 0.18);
}

.reader-catalog__item--done {
  border-color: rgba(63, 63, 70, 0.72);
}

.reader-catalog__item-index {
  color: #71717a;
  font-size: 18rpx;
}

.reader-catalog__item-title {
  color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.5;
}

.reader-catalog__badge {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(6, 95, 70, 0.22);
  color: #d1fae5;
  font-size: 18rpx;
}

.reader-catalog__badge--done {
  background: rgba(17, 24, 39, 0.38);
  color: #d4d4d8;
}
</style>
