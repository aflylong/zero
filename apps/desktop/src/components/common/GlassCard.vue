<template>
  <section class="glass-card" :class="{ 'glass-card--hero': variant === 'hero' }">
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: "default" | "hero" }>(), { variant: "default" });
</script>

<style lang="scss" scoped>
.glass-card {
  padding: 24px;
  border: 1px solid var(--si-color-border-card);
  border-radius: var(--si-radius-2xl);
  background: var(--si-color-surface-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.glass-card--hero {
  padding: 28px;
  border-color: var(--si-color-brand-border);
  background: linear-gradient(
    145deg,
    rgba(6, 78, 59, 0.28),
    rgba(17, 24, 39, 0.2)
  );
}
</style>
