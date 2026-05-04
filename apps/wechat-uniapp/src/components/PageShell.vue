<template>
  <view class="page-shell">
    <view class="page-shell__content" :class="{ 'page-shell__content--no-tab': !tabKey }">
      <slot />
    </view>
    <BottomTabBar v-if="tabKey" :active="tabKey" />
    <BottomSafeSpacer v-else />
  </view>
</template>

<script setup lang="ts">
import BottomSafeSpacer from "@/components/BottomSafeSpacer.vue";
import BottomTabBar from "@/components/BottomTabBar.vue";

defineProps<{
  tabKey?: "today" | "path" | "records" | "identity";
}>();
</script>
