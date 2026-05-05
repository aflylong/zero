<template>
  <view class="page-shell">
    <view class="page-shell__frame">
      <AppTopBar
        v-if="showTopbar"
        :title="resolvedTitle"
        :mode="topbarModeForComponent"
        :back-label="backLabel"
        :back-url="backUrl"
        :back-action="backAction"
      >
        <template #center>
          <slot name="topbar-center" />
        </template>
        <template #right>
          <slot name="topbar-right" />
        </template>
      </AppTopBar>

      <view class="page-shell__stack">
        <scroll-view scroll-y class="page-shell__scroll" show-scrollbar="false">
          <view class="page-shell__content" :class="contentClasses">
            <slot />
          </view>
        </scroll-view>

        <view v-if="hasFooter" class="page-shell__footer">
          <slot name="footer" />
          <BottomSafeSpacer />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import AppTopBar from "@/components/AppTopBar.vue";
import BottomSafeSpacer from "@/components/BottomSafeSpacer.vue";

const props = withDefaults(defineProps<{
  tabKey?: "today" | "path" | "records" | "identity";
  title?: string;
  topbarMode?: "tab" | "secondary" | "none";
  backLabel?: string;
  backUrl?: string;
  backAction?: (() => void) | null;
  contentClass?: string;
  compact?: boolean;
}>(), {
  title: "",
  topbarMode: undefined,
  backLabel: "返回",
  backUrl: "",
  backAction: null,
  contentClass: "",
  compact: false,
});

const slots = useSlots();

const tabTitleMap = {
  today: "今日",
  path: "道路",
  records: "记录",
  identity: "身份",
} as const;

const resolvedTitle = computed(() => props.title || (props.tabKey ? tabTitleMap[props.tabKey] : ""));
const resolvedTopbarMode = computed(() => props.topbarMode ?? (props.tabKey ? "tab" : "secondary"));
const showTopbar = computed(() => resolvedTopbarMode.value !== "none" && Boolean(resolvedTitle.value));
const topbarModeForComponent = computed<"tab" | "secondary">(() =>
  resolvedTopbarMode.value === "secondary" ? "secondary" : "tab",
);
const hasFooter = computed(() => Boolean(slots.footer));
const contentClasses = computed(() => [
  props.contentClass,
  {
    "page-shell__content--no-tab": !props.tabKey,
    "page-shell__content--compact": props.compact,
    "page-shell__content--with-footer": hasFooter.value,
  },
]);
</script>
