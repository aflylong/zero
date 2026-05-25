<template>
  <div v-if="open" class="dialog-mask" @click.self="emit('close')">
    <div class="dialog">
      <header class="dialog__head">
        <h3 class="dialog__title">归档{{ typeLabel }}</h3>
        <button type="button" class="btn btn-ghost btn-icon btn-sm" @click="emit('close')">
          <X :size="14" :stroke-width="iconStroke" />
        </button>
      </header>

      <div class="dialog__body">
        <p class="muted-text">
          归档后,「{{ title }}」会进入目标历史,反思会和它一起留下。当前目标字段会被清空,等你下次设置。
        </p>

        <div class="form-field">
          <label class="form-label">归档结果</label>
          <div class="dialog__statuses">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              type="button"
              class="dialog__status"
              :class="{ 'dialog__status--active': status === opt.value }"
              @click="status = opt.value"
            >
              <span class="dialog__status-name">{{ opt.label }}</span>
              <span class="dialog__status-desc">{{ opt.description }}</span>
            </button>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">反思 · 一句话也行</label>
          <textarea
            v-model="reflection"
            class="form-textarea"
            maxlength="400"
            placeholder="它教了你什么?下一段你要带走什么?"
          />
        </div>
      </div>

      <footer class="dialog__foot">
        <button type="button" class="btn btn-ghost" @click="emit('close')">
          <span>取消</span>
        </button>
        <button type="button" class="btn btn-primary" @click="confirm">
          <Save :size="14" :stroke-width="iconStroke" />
          <span>归档</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Save, X } from "lucide-vue-next";
import { tokens, type GoalStatus } from "@guiling/core";

const iconStroke = tokens.iconStrokeWidth;

const props = defineProps<{
  open: boolean;
  type: "year" | "month";
  title: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm", status: GoalStatus, reflection: string): void;
}>();

const typeLabel = computed(() => (props.type === "year" ? "一年目标" : "一月项目"));

const statusOptions: { value: GoalStatus; label: string; description: string }[] = [
  { value: "completed", label: "完成", description: "如期或近似实现。" },
  { value: "habituated", label: "习惯化", description: "已经融入身份,不需要再单独追。" },
  { value: "abandoned", label: "放弃", description: "诚实地放手,把空间让给真正重要的事。" },
];

const status = ref<GoalStatus>("completed");
const reflection = ref("");

watch(
  () => props.open,
  (val) => {
    if (val) {
      status.value = "completed";
      reflection.value = "";
    }
  },
);

function confirm() {
  emit("confirm", status.value, reflection.value.trim());
}
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.dialog {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  border: 1px solid var(--si-color-border-card);
  border-radius: var(--si-radius-2xl);
  background: var(--si-color-bg-elevated);
}

.dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog__title {
  margin: 0;
  font-size: var(--si-font-lg);
  font-weight: var(--si-weight-semibold);
  color: var(--si-color-text-main);
}

.dialog__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dialog__statuses {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog__status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-md);
  background: transparent;
  text-align: left;
  color: var(--si-color-text-faint);
  cursor: pointer;
}

.dialog__status:hover {
  background: var(--si-color-surface-card-soft);
  color: var(--si-color-text-soft);
}

.dialog__status--active {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
  color: var(--si-color-brand-text);
}

.dialog__status-name {
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.dialog__status-desc {
  font-size: var(--si-font-xs);
  line-height: 1.55;
}

.dialog__foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
