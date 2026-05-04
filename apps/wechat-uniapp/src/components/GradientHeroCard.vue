<template>
  <view class="hero-card" :class="cardClass">
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  cardClass?: string;
}>();
</script>
