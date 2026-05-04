<template>
  <view class="glass-card" :class="cardClass">
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  cardClass?: string;
}>();
</script>
