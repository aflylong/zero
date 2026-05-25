<template>
  <div class="concentric">
    <div class="concentric__ring concentric__ring--outer">
      <span class="concentric__label">规则 · 约束</span>
    </div>
    <div class="concentric__ring concentric__ring--levers">
      <span class="concentric__label">支线 · 日常杠杆</span>
    </div>
    <div class="concentric__ring concentric__ring--month">
      <span class="concentric__label">Boss 战 · 一月项目</span>
    </div>
    <div class="concentric__ring concentric__ring--year">
      <span class="concentric__label">主线 · 一年目标</span>
    </div>
    <div class="concentric__core">
      <span class="concentric__core-label">愿景</span>
      <span class="concentric__core-anti">↳ 反愿景(赌注)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯展示组件,把原文第七章「同心圆 / 力场」可视化成嵌套圈。
// 颜色与文案对齐 6 组件的语义层级。
</script>

<style lang="scss" scoped>
.concentric {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 360px;
  margin: 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.concentric__ring {
  position: absolute;
  border-radius: 999px;
  border: 1px dashed var(--si-color-border-subtle);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
}

.concentric__ring--outer {
  inset: 0;
  border-color: var(--si-color-warning);
}

.concentric__ring--levers {
  inset: 14%;
  border-color: var(--si-color-info);
}

.concentric__ring--month {
  inset: 28%;
  border-color: var(--si-color-brand);
}

.concentric__ring--year {
  inset: 42%;
  border-color: var(--si-color-brand-strong);
  border-style: solid;
}

.concentric__core {
  width: 32%;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  background: var(--si-color-brand-bg);
  border: 1px solid var(--si-color-brand-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.concentric__label {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  letter-spacing: 1px;
  background: var(--si-color-bg-app-black);
  padding: 0 8px;
}

.concentric__core-label {
  color: var(--si-color-brand-text);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.concentric__core-anti {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}
</style>
