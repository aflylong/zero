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

        <view v-if="authoritative" class="reader-authority">
          <SectionLabel>章节权威引文</SectionLabel>
          <text class="reader-authority__text">「{{ authoritative.text }}」</text>
          <text class="reader-authority__author">—— {{ authoritative.author }}</text>
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

        <view class="reader-notes">
          <view class="reader-notes__head">
            <SectionLabel>我的笔记</SectionLabel>
            <text class="reader-notes__count">{{ noteDraft.length }}/600</text>
          </view>
          <textarea
            class="textarea-shell reader-notes__textarea"
            :value="noteDraft"
            maxlength="600"
            auto-height
            placeholder="原文建议你在读完这章后停一下,把「打到你的那句话」写下来。"
            @input="onNoteInput($event)"
            @blur="saveNote"
          />
          <text class="reader-notes__hint">
            {{ noteDirty ? "失焦自动保存" : "已同步到本地" }}
          </text>
        </view>

        <text class="reader-note">章节化原文已内置在本地,阅读进度会真实保存。</text>
      </view>

      <template #footer>
        <view class="reader-footer">
          <button class="pill-button reader-footer__button" @tap="handleNextAction">
            {{ nextButtonLabel }}
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
import { computed, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { switchToTab } from "@/services/navigation";
import { articleSections, articleSourceUrl, articleTitle } from "@/static/content/article";
import { findAuthoritativeQuote } from "@/static/content/quotes";
import { useAppStore } from "@/stores/useAppStore";
import type { ArticleParagraph } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

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
  Math.max(0, sections.findIndex((s) => s.id === currentSection.value.id)),
);
const isCurrentCompleted = computed(() =>
  completedIds.value.includes(currentSection.value.id),
);
const hasPrevSection = computed(() => currentIndex.value > 0);
const hasNextSection = computed(() => currentIndex.value < totalSections - 1);

const authoritative = computed(() => findAuthoritativeQuote(currentSection.value.id));

const journeyStarted = computed(
  () =>
    store.state.data.journeyCompleted ||
    Boolean(store.state.data.morningExcavation.startedAt),
);

const nextButtonLabel = computed(() => {
  if (hasNextSection.value) return "下一章";
  if (!store.state.data.journeyCompleted) {
    return journeyStarted.value ? "继续未完成的一天流程" : "开始今天的一天流程";
  }
  if (!store.state.data.onboardingCompleted) return "进入快速设置";
  return "完成阅读";
});

// —— 笔记 ——
const noteDraft = ref("");
const noteDirty = ref(false);

function syncNoteFromStore() {
  noteDraft.value =
    store.state.data.articleProgress.notes?.[currentSection.value.id] ?? "";
  noteDirty.value = false;
}

watch(currentSection, syncNoteFromStore, { immediate: true });

function onNoteInput(e: UniValueEvent) {
  noteDraft.value = String(e.detail?.value ?? "");
  noteDirty.value = true;
}

function saveNote() {
  if (!noteDirty.value) return;
  store.updateArticleNote(currentSection.value.id, noteDraft.value);
  noteDirty.value = false;
}

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
  saveNote();
  store.openArticleSection(sectionId);
  showCatalog.value = false;
}

function markCurrentAsRead() {
  if (isCurrentCompleted.value) return;
  store.markArticleSectionRead(currentSection.value.id);
}

function openPrevSection() {
  if (!hasPrevSection.value) return;
  saveNote();
  store.openArticleSection(sections[currentIndex.value - 1].id);
}

function handleNextAction() {
  saveNote();
  if (!isCurrentCompleted.value) {
    store.markArticleSectionRead(currentSection.value.id);
  }
  if (hasNextSection.value) {
    store.openArticleSection(sections[currentIndex.value + 1].id);
    return;
  }
  // 最后一章读完:推荐进入一天流程
  if (!store.state.data.journeyCompleted) {
    uni.navigateTo({ url: "/pages/journey-morning/index" });
    return;
  }
  if (!store.state.data.onboardingCompleted) {
    uni.navigateTo({ url: "/pages/onboarding/index" });
    return;
  }
  goBack();
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
      uni.showToast({ title: "原文链接已复制", icon: "success" });
    },
  });
}

onShow(() => {
  store.initialize();
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
.reader-catalog__list,
.reader-notes,
.reader-authority {
  display: flex;
  flex-direction: column;
}

.reader-page {
  gap: 26rpx;
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

.reader-header,
.reader-notes,
.reader-authority {
  gap: 14rpx;
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
  font-size: 40rpx;
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
  font-size: 28rpx;
  line-height: 1.7;
}

.reader-authority {
  padding: 16rpx 18rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 16rpx;
  background: rgba(24, 24, 27, 0.36);
}
.reader-authority__text {
  color: #f5f5f5;
  font-size: 26rpx;
  line-height: 1.7;
}
.reader-authority__author {
  color: #71717a;
  font-size: 22rpx;
  text-align: right;
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

.reader-notes {
  padding: 16rpx 18rpx;
  border: 1px dashed rgba(82, 82, 91, 0.6);
  border-radius: 16rpx;
  background: rgba(10, 10, 11, 0.34);
}
.reader-notes__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reader-notes__count,
.reader-notes__hint {
  color: #71717a;
  font-size: 20rpx;
}
.reader-notes__textarea {
  min-height: 220rpx;
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
  padding: 22rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 22rpx;
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
  font-size: 26rpx;
  line-height: 1.5;
}

.reader-catalog__badge {
  padding: 6rpx 12rpx;
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
