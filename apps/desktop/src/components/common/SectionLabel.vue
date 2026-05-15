<template>
  <div class="section-label">
    <component v-if="icon" :is="icon" :size="12" :stroke-width="2" class="section-label__icon" />
    <span><slot /></span>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
defineProps<{ icon?: Component }>();
</script>

<style lang="scss" scoped>
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  letter-spacing: 3px;
  text-transform: uppercase;
  line-height: 1;
}
.section-label__icon {
  color: currentColor;
}
</style>
