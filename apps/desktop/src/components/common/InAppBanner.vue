<template>
  <transition name="banner-slide">
    <section v-if="visible && current" class="banner" role="alert">
      <div class="banner__head">
        <component
          :is="iconForKind(current.kind)"
          :size="14"
          :stroke-width="iconStroke"
          class="banner__icon"
        />
        <span class="banner__kicker">{{ kindLabel(current.kind) }}</span>
        <span class="banner__time">{{ current.dueAtLabel }}</span>
        <button
          type="button"
          class="banner__close"
          title="关掉这条横幅(不影响提醒数据)"
          @click="dismiss"
        >
          <X :size="14" :stroke-width="iconStroke" />
        </button>
      </div>

      <p class="banner__title">{{ current.label }}</p>
      <p class="banner__question">{{ current.question || current.message }}</p>

      <div class="banner__actions">
        <button
          type="button"
          class="btn btn-primary btn-sm"
          @click="resolve('complete')"
        >
          <Check :size="14" :stroke-width="iconStroke" />
          <span>我现在就做</span>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          @click="resolve('snooze')"
        >
          <Clock :size="14" :stroke-width="iconStroke" />
          <span>30 分钟后</span>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          @click="resolve('skip')"
        >
          <span>跳过</span>
        </button>
      </div>
    </section>
  </transition>
</template>

<script setup lang="ts">
/**
 * 应用在前台时,提醒到点会从右上角滑入一个浮层并播放铃声;
 * 用户点击「我现在就做 / 30 分钟后 / 跳过」即可走完 resolveReminder 流程。
 *
 * 与 OS 通知互不冲突:OS 通知由 reminderScheduler.ts 推送,
 * 这个组件只负责"应用在前台时把视线拉回来"这一层。
 */

import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Check,
  Clock,
  Footprints,
  Moon,
  Sun,
  Sunrise,
  X,
} from "lucide-vue-next";
import {
  getNotificationAdapter,
  tokens,
  useAppStore,
  type ReminderAction,
  type ReminderKind,
  type ReminderPrompt,
} from "@guiling/core";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const router = useRouter();

const dismissedIds = ref<Set<string>>(new Set());

const prefs = computed(() => store.state.data.notificationPreferences);
const pendingPrompts = computed(() => store.state.pendingReminderPrompts);
const current = computed<ReminderPrompt | null>(() => {
  const list = pendingPrompts.value.filter((p) => !dismissedIds.value.has(p.ruleId));
  return list[0] ?? null;
});

const visible = computed(() => prefs.value.inAppBanner && Boolean(current.value));

let lastAlertedRuleId: string | null = null;

watch(
  current,
  async (next) => {
    if (!next || !prefs.value.inAppBanner) return;
    if (lastAlertedRuleId === next.ruleId) return;
    lastAlertedRuleId = next.ruleId;
    // 应用在前台时再响一声(响铃由 OS 通知端控制时是双响,这里只在"banner 切换"瞬间补一声)
    if (prefs.value.sound && document.visibilityState === "visible") {
      try {
        await getNotificationAdapter().playSound?.(prefs.value.soundVolume);
      } catch {
        /* ignore */
      }
    }
  },
  { immediate: true },
);

let tickHandle: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // 30s 触发一次刷新(与 reminderScheduler 同频,但后者只负责 OS 通知)
  store.refreshReminderPrompts();
  tickHandle = setInterval(() => store.refreshReminderPrompts(), 30_000);
});

onUnmounted(() => {
  if (tickHandle) clearInterval(tickHandle);
});

function dismiss() {
  if (!current.value) return;
  dismissedIds.value.add(current.value.ruleId);
  // dismiss 不算 resolveReminder,只是关掉 banner 本身;
  // 数据层会在用户实际点 complete/snooze/skip 时才动
}

function resolve(action: ReminderAction) {
  if (!current.value) return;
  const prompt = current.value;
  store.resolveReminder(prompt.ruleId, action);
  if (action === "complete" && prompt.promptKey) {
    if (prompt.kind === "morning") router.push("/journey/morning");
    else if (prompt.kind === "night") router.push("/journey/night");
    else router.push("/journey/day");
  }
}

function iconForKind(kind: ReminderKind) {
  if (kind === "morning") return Sunrise;
  if (kind === "night") return Moon;
  if (kind === "commute") return Footprints;
  return Sun;
}
function kindLabel(kind: ReminderKind): string {
  if (kind === "morning") return "早晨开掘";
  if (kind === "night") return "晚上回顾";
  if (kind === "commute") return "通勤反思";
  return "白天打断";
}
</script>

<style lang="scss" scoped>
.banner {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid var(--si-color-brand-border);
  border-radius: var(--si-radius-2xl);
  background: linear-gradient(
    145deg,
    rgba(6, 78, 59, 0.32),
    rgba(17, 24, 39, 0.85)
  );
  backdrop-filter: blur(8px);
  z-index: 9000;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(16, 185, 129, 0.18);
}

.banner__head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--si-color-brand-text);
  font-size: var(--si-font-xs);
  letter-spacing: 1px;
}

.banner__icon {
  color: var(--si-color-brand);
}

.banner__kicker {
  flex: 1;
}

.banner__time {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.banner__close {
  background: transparent;
  border: 0;
  color: var(--si-color-text-faint);
  cursor: pointer;
  padding: 2px;

  &:hover {
    color: var(--si-color-text-soft);
  }
}

.banner__title {
  margin: 0;
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
  color: var(--si-color-text-main);
}

.banner__question {
  margin: 0;
  font-size: var(--si-font-sm);
  line-height: 1.55;
  color: var(--si-color-text-soft);
}

.banner__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* slide-in from the right */
.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translateX(110%);
  opacity: 0;
}
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: transform 240ms ease, opacity 200ms ease;
}
</style>
