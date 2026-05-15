<template>
  <div class="placeholder-page">
    <PageHeader :title="title" :kicker="kicker" :description="description" :back="!isTab" />
    <PageBody>
      <div class="placeholder-body">
        <div class="placeholder-icon">
          <Construction :size="32" :stroke-width="1.5" />
        </div>
        <p class="section-title">{{ title }}</p>
        <p class="muted-text">{{ placeholderCopy }}</p>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { Construction } from "lucide-vue-next";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";

withDefaults(
  defineProps<{
    title: string;
    kicker?: string;
    description?: string;
    isTab?: boolean;
    placeholderCopy?: string;
  }>(),
  {
    kicker: "",
    description: "",
    isTab: false,
    placeholderCopy: "这个页面的桌面版马上到位。",
  },
);
</script>

<style lang="scss" scoped>
.placeholder-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.placeholder-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  max-width: 480px;
  margin: 64px auto 0;
  padding: 48px 32px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-2xl);
  background: var(--si-color-surface-card-soft);
  text-align: center;
}

.placeholder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-faint);
}
</style>
