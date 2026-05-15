<template>
  <section v-if="prompt" class="reminder-prompt">
    <div class="reminder-prompt__head">
      <div class="reminder-prompt__meta">
        <component
          :is="iconForKind"
          :size="16"
          :stroke-width="iconStroke"
        />
        <span class="kicker">{{ kindLabel }}</span>
      </div>
      <span class="reminder-prompt__time">{{ prompt.dueAtLabel }}</span>
    </div>

    <p class="reminder-prompt__title">{{ prompt.label }}</p>
    <p class="body-text reminder-prompt__body">{{ prompt.message }}</p>

    <div class="action-row">
      <button type="button" class="btn btn-primary" @click="emit('action', prompt.ruleId, 'complete')">
        <Check :size="14" :stroke-width="iconStroke" />
        <span>我现在就做</span>
      </button>
      <button type="button" class="btn btn-ghost" @click="emit('action', prompt.ruleId, 'snooze')">
        <Clock :size="14" :stroke-width="iconStroke" />
        <span>30 分钟后再说</span>
      </button>
      <button type="button" class="btn btn-ghost" @click="emit('action', prompt.ruleId, 'skip')">
        <XCircle :size="14" :stroke-width="iconStroke" />
        <span>今天跳过</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Check, Clock, Moon, Sun, Sunrise, XCircle } from "lucide-vue-next";
import type { ReminderAction, ReminderPrompt } from "@guiling/core";
import { tokens } from "@guiling/core";

const iconStroke = tokens.iconStrokeWidth;

const props = defineProps<{ prompt: ReminderPrompt | null }>();
const emit = defineEmits<{
  (event: "action", ruleId: string, action: ReminderAction): void;
}>();

const iconForKind = computed(() => {
  if (props.prompt?.kind === "morning") return Sunrise;
  if (props.prompt?.kind === "night") return Moon;
  return Sun;
});

const kindLabel = computed(() => {
  if (props.prompt?.kind === "morning") return "早晨开掘";
  if (props.prompt?.kind === "night") return "夜间复盘";
  return "白天打断";
});
</script>

<style lang="scss" scoped>
.reminder-prompt {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px;
  border: 1px solid var(--si-color-brand-border);
  border-radius: var(--si-radius-2xl);
  background: linear-gradient(145deg, rgba(6, 78, 59, 0.24), rgba(17, 24, 39, 0.14));
}

.reminder-prompt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.reminder-prompt__meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--si-color-brand);
}

.reminder-prompt__meta .kicker {
  color: var(--si-color-brand-text);
  letter-spacing: 2px;
}

.reminder-prompt__time {
  color: var(--si-color-text-muted);
  font-size: var(--si-font-sm);
}

.reminder-prompt__title {
  margin: 0;
  color: var(--si-color-brand-text);
  font-size: var(--si-font-lg);
  font-weight: var(--si-weight-semibold);
  line-height: 1.35;
}

.reminder-prompt__body {
  margin: 0;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
}
</style>
