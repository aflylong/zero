<template>
  <div class="page-body">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.page-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 32px 48px;
}
</style>
