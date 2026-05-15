<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <component :is="icon" :size="26" :stroke-width="1.5" />
    </div>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="muted-text empty-state__desc">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  description?: string;
}>();
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px;
  text-align: center;
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-inset);
  color: var(--si-color-text-faint);
  margin-bottom: 4px;
}

.empty-state__title {
  margin: 0;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-medium);
}

.empty-state__desc {
  margin: 0;
  max-width: 360px;
  font-size: var(--si-font-sm);
}
</style>
