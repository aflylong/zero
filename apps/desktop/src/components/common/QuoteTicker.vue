<template>
  <aside class="quote-ticker">
    <Quote :size="14" :stroke-width="iconStroke" class="quote-ticker__icon" />
    <span class="quote-ticker__text">{{ quote.text }}</span>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Quote } from "lucide-vue-next";
import {
  pickDailyQuote,
  tokens,
  useAppStore,
  type Quote as QuoteShape,
} from "@guiling/core";

// Note: we avoid `slot` as a prop name because it collides with Vue's built-in
// `slot` attribute semantics. Use `kind` instead.
const props = withDefaults(
  defineProps<{
    kind?: QuoteShape["slot"];
  }>(),
  {
    kind: undefined,
  },
);

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const quote = computed(() => pickDailyQuote(store.state.activeDateKey, props.kind));
</script>

<style lang="scss" scoped>
.quote-ticker {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--si-color-border-subtle);
  border-left: 2px solid var(--si-color-brand);
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-card-soft);
}

.quote-ticker__icon {
  color: var(--si-color-brand);
  margin-top: 2px;
  flex-shrink: 0;
}

.quote-ticker__text {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  line-height: 1.6;
}
</style>
