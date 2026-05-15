<template>
  <router-link
    :to="to"
    class="sidebar-link"
    :class="{ 'sidebar-link--subtle': variant === 'subtle' }"
    active-class="sidebar-link--active"
  >
    <span class="sidebar-link__icon">
      <slot />
    </span>
    <span class="sidebar-link__body">
      <span class="sidebar-link__label">{{ label }}</span>
      <span v-if="description" class="sidebar-link__desc">{{ description }}</span>
    </span>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  description?: string;
  variant?: "default" | "subtle";
}>();
</script>

<style lang="scss" scoped>
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--si-radius-md);
  color: var(--si-color-text-muted);
  transition: background 140ms ease, color 140ms ease;

  :deep(svg) {
    color: currentColor;
  }

  &:hover {
    background: rgba(39, 39, 42, 0.55);
    color: var(--si-color-text-soft);
  }
}

.sidebar-link--active {
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);

  .sidebar-link__desc {
    color: rgba(209, 250, 229, 0.65);
  }
}

.sidebar-link--subtle {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
}

.sidebar-link__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  flex-shrink: 0;
  color: currentColor;
}

.sidebar-link__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}

.sidebar-link__label {
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-medium);
  color: currentColor;
}

.sidebar-link__desc {
  margin-top: 3px;
  font-size: var(--si-font-xs);
  color: var(--si-color-text-faint);
}
</style>
