<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <InAppBanner />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import InAppBanner from "@/components/common/InAppBanner.vue";
import { useAppStore } from "@guiling/core";
import { startReminderScheduler } from "@/services/reminderScheduler";

const store = useAppStore();

onMounted(() => {
  store.initialize();
  startReminderScheduler(store);
});
</script>

<style lang="scss" scoped>
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  width: 100vw;
  height: 100vh;
  background: var(--si-color-bg-app-black);
  color: var(--si-color-text-main);
  overflow: hidden;
}

.app-main {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 160ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
