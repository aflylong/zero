<template>
  <div class="reader-page">
    <PageHeader
      :title="currentSection.title"
      :kicker="currentSection.kicker"
      :description="currentSection.summary"
      back
      back-to="/path"
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="!hasPrev"
          @click="openPrev"
        >
          <ChevronLeft :size="14" :stroke-width="iconStroke" />
          <span>上一章</span>
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="isCompleted ? 'btn-success' : 'btn-edit'"
          @click="markRead"
        >
          <component :is="isCompleted ? CheckCircle2 : Check" :size="14" :stroke-width="iconStroke" />
          <span>{{ isCompleted ? "已读" : "标记已读" }}</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="nextAction">
          <span>{{ nextButtonLabel }}</span>
          <ChevronRight :size="14" :stroke-width="iconStroke" />
        </button>
      </template>
    </PageHeader>

    <div class="reader-grid">
      <aside class="reader-toc">
        <div class="reader-toc__head">
          <SectionLabel :icon="BookOpenText">目录</SectionLabel>
          <span class="faint-text">{{ completedCount }}/{{ totalSections }}</span>
        </div>
        <div class="reader-toc__list">
          <button
            v-for="(section, index) in sections"
            :key="section.id"
            type="button"
            class="reader-toc__item"
            :class="tocItemClass(section.id)"
            @click="open(section.id)"
          >
            <span class="reader-toc__index">0{{ index + 1 }}</span>
            <span class="reader-toc__copy">
              <span class="reader-toc__kicker">{{ section.kicker }}</span>
              <span class="reader-toc__title">{{ section.title }}</span>
            </span>
            <Check
              v-if="completedIds.includes(section.id) && section.id !== currentSection.id"
              :size="14"
              :stroke-width="2"
              class="reader-toc__check"
            />
          </button>
        </div>

        <button type="button" class="btn btn-ghost btn-sm reader-toc__copy-link" @click="copyLink">
          <LinkIcon :size="14" :stroke-width="iconStroke" />
          <span>复制原文链接</span>
        </button>
      </aside>

      <PageBody>
        <article class="reader-article">
          <blockquote class="reader-article__accent">
            <Quote :size="16" :stroke-width="iconStroke" />
            <span>{{ currentSection.accent }}</span>
          </blockquote>

          <div class="reader-article__body">
            <p
              v-for="p in currentSection.paragraphs"
              :key="p.id"
              class="reader-paragraph"
              :class="paragraphClass(p.type)"
            >
              <span v-if="p.type === 'bullet'" class="reader-paragraph__bullet">
                <Dot :size="16" :stroke-width="iconStroke" />
              </span>
              <span>{{ p.text }}</span>
            </p>
          </div>

          <p class="faint-text reader-article__note">
            原文章节内置在本地,阅读进度会真实保存。
          </p>
        </article>
      </PageBody>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  BookOpenText,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dot,
  Link as LinkIcon,
  Quote,
} from "lucide-vue-next";
import {
  articleSections,
  articleSourceUrl,
  tokens,
  useAppStore,
  type ArticleParagraph,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();
const sections = articleSections;
const totalSections = sections.length;

const currentSection = computed(() => store.currentArticleSection.value);
const completedIds = computed(() => store.state.data.articleProgress.completedSectionIds);
const completedCount = computed(() => completedIds.value.length);
const currentIndex = computed(() =>
  Math.max(0, sections.findIndex((s) => s.id === currentSection.value.id)),
);
const isCompleted = computed(() => completedIds.value.includes(currentSection.value.id));
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < totalSections - 1);

const nextButtonLabel = computed(() => {
  if (hasNext.value) return "下一章";
  if (!store.state.data.onboardingCompleted) return "开始设置你的系统";
  return "完成阅读";
});

function paragraphClass(type: ArticleParagraph["type"]) {
  return {
    "reader-paragraph--quote": type === "quote",
    "reader-paragraph--bullet": type === "bullet",
  };
}

function tocItemClass(id: string) {
  return {
    "reader-toc__item--active": id === currentSection.value.id,
    "reader-toc__item--done":
      completedIds.value.includes(id) && id !== currentSection.value.id,
  };
}

function open(id: string) {
  store.openArticleSection(id);
}

function openPrev() {
  if (!hasPrev.value) return;
  open(sections[currentIndex.value - 1].id);
}

function markRead() {
  if (!isCompleted.value) store.markArticleSectionRead(currentSection.value.id);
}

function nextAction() {
  if (!isCompleted.value) store.markArticleSectionRead(currentSection.value.id);
  if (hasNext.value) {
    open(sections[currentIndex.value + 1].id);
    return;
  }
  // 最后一章读完:如果还没完成 onboarding,引导去设置
  if (!store.state.data.onboardingCompleted) {
    router.push("/onboarding");
  }
}

async function copyLink() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(articleSourceUrl);
    }
  } catch (err) {
    console.warn("[reader] copy failed", err);
  }
}
</script>

<style lang="scss" scoped>
.reader-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.reader-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 0;
  flex: 1;
  min-height: 0;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.reader-toc {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 20px 24px;
  border-right: 1px solid var(--si-color-border-faint);
  background: rgba(5, 5, 6, 0.68);
  min-height: 0;
  overflow-y: auto;

  @media (max-width: 960px) {
    border-right: 0;
    border-bottom: 1px solid var(--si-color-border-faint);
  }
}

.reader-toc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reader-toc__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reader-toc__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: var(--si-radius-md);
  background: transparent;
  color: var(--si-color-text-soft);
  text-align: left;
  transition: background 140ms ease, border-color 140ms ease;

  &:hover {
    background: rgba(39, 39, 42, 0.5);
  }
}

.reader-toc__item--active {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);
}

.reader-toc__item--done {
  color: var(--si-color-text-soft);
}

.reader-toc__index {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  min-width: 18px;
  margin-top: 2px;
}

.reader-toc__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.reader-toc__kicker {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.reader-toc__title {
  color: inherit;
  font-size: var(--si-font-sm);
  line-height: 1.45;
}

.reader-toc__check {
  color: var(--si-color-text-faint);
  margin-top: 2px;
}

.reader-toc__copy-link {
  margin-top: 12px;
}

.reader-article {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
}

.reader-article__accent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 14px 18px;
  border-left: 3px solid var(--si-color-brand);
  color: var(--si-color-brand-text);
  font-size: var(--si-font-lg);
  line-height: 1.55;
  background: var(--si-color-brand-bg-soft);
  border-radius: 0 var(--si-radius-lg) var(--si-radius-lg) 0;
}

.reader-article__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reader-paragraph {
  display: flex;
  gap: 10px;
  margin: 0;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-lg);
  line-height: 1.85;
}

.reader-paragraph--quote {
  padding-left: 14px;
  border-left: 2px solid var(--si-color-border-card);
  color: var(--si-color-text-main);
}

.reader-paragraph--bullet {
  align-items: flex-start;
}

.reader-paragraph__bullet {
  display: inline-flex;
  margin-top: 8px;
  color: var(--si-color-brand);
  flex-shrink: 0;
}

.reader-article__note {
  margin: 0;
  font-size: var(--si-font-sm);
}
</style>
