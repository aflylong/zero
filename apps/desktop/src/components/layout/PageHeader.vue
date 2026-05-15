<template>
  <header class="page-header">
    <div class="page-header__left">
      <button
        v-if="back"
        type="button"
        class="btn btn-ghost btn-sm"
        @click="onBack"
      >
        <ChevronLeft :size="14" :stroke-width="2" />
        <span>{{ backLabel }}</span>
      </button>
      <div class="page-header__titles">
        <span v-if="kicker" class="kicker">{{ kicker }}</span>
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="description" class="page-header__desc muted-text">{{ description }}</p>
      </div>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    title: string;
    kicker?: string;
    description?: string;
    back?: boolean;
    backLabel?: string;
    backTo?: string;
  }>(),
  {
    kicker: "",
    description: "",
    back: false,
    backLabel: "返回",
    backTo: "",
  },
);

const router = useRouter();
function onBack() {
  if (props.backTo) {
    router.push(props.backTo);
    return;
  }
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/today");
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px 24px;
  border-bottom: 1px solid var(--si-color-border-faint);
}

.page-header__left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.page-header__titles {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.page-header__title {
  margin: 0;
  font-size: var(--si-font-3xl);
  font-weight: 600;
  line-height: 1.2;
  color: var(--si-color-text-main);
  letter-spacing: -0.01em;
}

.page-header__desc {
  margin: 0;
  max-width: 640px;
  font-size: var(--si-font-md);
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
</style>
