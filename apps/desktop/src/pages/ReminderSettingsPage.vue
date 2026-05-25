<template>
  <div class="reminders-page">
    <PageHeader
      title="提醒设置"
      kicker="REMINDERS"
      description="按原文 9 时间点 + 早晨/夜间锚点管理。关掉的提醒不会推送通知。"
      back
      back-to="/today"
    >
      <template #actions>
        <button type="button" class="btn btn-ghost btn-sm" @click="seedDefaults">
          <RefreshCw :size="14" :stroke-width="iconStroke" />
          <span>恢复默认 9 时间点</span>
        </button>
        <button type="button" class="btn btn-edit btn-sm" @click="addCustom">
          <Plus :size="14" :stroke-width="iconStroke" />
          <span>新增提醒</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="reminders-frame">
        <GlassCard>
          <SectionLabel :icon="BellRing">通知权限</SectionLabel>
          <div class="reminders-perm">
            <div class="reminders-perm__copy">
              <p class="section-title reminders-perm__title">
                {{ permissionStatus === "granted" ? "通知已授权" : "尚未授权通知" }}
              </p>
              <p class="muted-text">
                {{
                  permissionStatus === "granted"
                    ? "提醒到达时会推送桌面通知,即使窗口关到托盘里也会响。"
                    : "点一下下面这个按钮,允许应用在提醒到达时推送桌面通知。"
                }}
              </p>
            </div>
            <button
              v-if="permissionStatus !== 'granted'"
              type="button"
              class="btn btn-edit btn-sm"
              @click="requestPermission"
            >
              <Bell :size="14" :stroke-width="iconStroke" />
              <span>请求授权</span>
            </button>
          </div>
        </GlassCard>

        <div
          v-for="group in groupedRules"
          :key="group.kind"
          class="reminders-group"
        >
          <h3 class="reminders-group__title">{{ group.title }}</h3>
          <p class="muted-text">{{ group.description }}</p>

          <div class="reminders-list">
            <GlassCard v-for="rule in group.rules" :key="rule.id">
              <div class="reminder-card__head">
                <div class="reminder-card__copy">
                  <component
                    :is="reminderIcon(rule.kind)"
                    :size="16"
                    :stroke-width="iconStroke"
                    class="reminder-card__kind-icon"
                  />
                  <input
                    class="form-input reminder-card__label-input"
                    :value="rule.label"
                    maxlength="40"
                    placeholder="提醒名称"
                    @input="updateLabel(rule.id, $event)"
                  />
                  <p v-if="rule.promptKey" class="faint-text reminder-card__prompt-key">
                    题目锚点:{{ rule.promptKey }}
                  </p>
                </div>
                <div class="reminder-card__actions">
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="rule.enabled ? 'btn-success' : 'btn-ghost'"
                    @click="toggle(rule)"
                  >
                    <component
                      :is="rule.enabled ? CheckCircle2 : CircleDashed"
                      :size="14"
                      :stroke-width="iconStroke"
                    />
                    <span>{{ rule.enabled ? "已开启" : "已关闭" }}</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-destructive btn-sm btn-icon"
                    title="删除"
                    @click="remove(rule.id)"
                  >
                    <Trash2 :size="14" :stroke-width="iconStroke" />
                  </button>
                </div>
              </div>

              <div class="reminder-card__body">
                <div v-if="rule.kind !== 'commute'" class="reminder-card__time-row">
                  <span class="form-label">提醒时间</span>
                  <input
                    :value="formatTime(rule.hour, rule.minute)"
                    type="time"
                    class="form-input reminder-card__time"
                    @change="updateTime(rule.id, $event)"
                  />
                </div>

                <div class="form-field">
                  <label class="form-label">
                    {{ rule.promptKey ? "题干 / 备注文案" : "提醒文案" }}
                  </label>
                  <textarea
                    class="form-textarea"
                    :value="rule.message"
                    maxlength="240"
                    placeholder="这条提醒响起时你希望看到的一句话"
                    @input="updateMessage(rule.id, $event)"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Bell,
  BellRing,
  CheckCircle2,
  CircleDashed,
  Footprints,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  Sunrise,
  Trash2,
} from "lucide-vue-next";
import {
  dayPrompts,
  getNotificationAdapter,
  tokens,
  useAppStore,
  type ReminderKind,
  type ReminderRule,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const reminderRules = computed(() => store.state.data.reminderRules);
const permissionStatus = ref<"unknown" | "granted" | "denied">("unknown");

interface Group {
  kind: ReminderKind;
  title: string;
  description: string;
  rules: ReminderRule[];
}

const groupedRules = computed<Group[]>(() => {
  const order: ReminderKind[] = ["morning", "day", "commute", "night"];
  const titles: Record<ReminderKind, { title: string; description: string }> = {
    morning: {
      title: "早晨开掘锚点",
      description: "原文 Part 1 入口提醒。响起时回到一天流程把题目继续答完。",
    },
    day: {
      title: "白天 6 个时间点",
      description: "对应原文 D1-D6。把你从惯性里拽出来,响起时记得当场作答。",
    },
    commute: {
      title: "通勤 3 题",
      description:
        "原文 W1-W3,通勤、散步、发呆时想这三条;不参与时间触发,只在「一天流程」里随时打开。",
    },
    night: {
      title: "夜间综合锚点",
      description: "原文 Part 3 入口提醒。响起时进入 5 步综合。",
    },
  };

  return order.map((kind) => ({
    kind,
    title: titles[kind].title,
    description: titles[kind].description,
    rules: reminderRules.value.filter((r) => r.kind === kind),
  }));
});

onMounted(async () => {
  const adapter = getNotificationAdapter();
  if (typeof adapter.isAvailable === "function") {
    const ok = await adapter.isAvailable();
    permissionStatus.value = ok ? "granted" : "unknown";
  }
});

async function requestPermission() {
  const adapter = getNotificationAdapter();
  if (typeof adapter.requestPermission !== "function") return;
  const granted = await adapter.requestPermission();
  permissionStatus.value = granted ? "granted" : "denied";
}

function formatTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function updateTime(ruleId: string, e: Event) {
  const value = (e.target as HTMLInputElement).value;
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return;
  store.updateReminderRule(ruleId, { hour: h, minute: m });
}

function updateMessage(ruleId: string, e: Event) {
  store.updateReminderRule(ruleId, {
    message: (e.target as HTMLTextAreaElement).value,
  });
}

function updateLabel(ruleId: string, e: Event) {
  store.updateReminderRule(ruleId, { label: (e.target as HTMLInputElement).value });
}

function toggle(rule: ReminderRule) {
  store.updateReminderRule(rule.id, { enabled: !rule.enabled });
}

function remove(ruleId: string) {
  store.removeReminderRule(ruleId);
}

function addCustom() {
  store.createReminderRule({
    kind: "day",
    label: "新的提醒",
    hour: 12,
    minute: 0,
    message: "停一下。问自己一句话。",
  });
}

function seedDefaults() {
  // 不删旧的,只补全缺失的 promptKey
  const have = new Set(
    reminderRules.value
      .map((r) => r.promptKey)
      .filter((k): k is string => Boolean(k)),
  );
  for (const dp of dayPrompts) {
    if (have.has(dp.key)) continue;
    store.createReminderRule({
      kind: dp.kind === "day" ? "day" : "commute",
      promptKey: dp.key,
      label: dp.label,
      hour: dp.hour ?? 0,
      minute: dp.minute ?? 0,
      message: dp.question,
    });
  }
  if (!have.has("morning-excavation")) {
    store.createReminderRule({
      kind: "morning",
      promptKey: "morning-excavation",
      label: "早晨开掘",
      hour: 7,
      minute: 30,
      message: "如果今天什么都不变,我能接受吗?",
    });
  }
  if (!have.has("night-synthesis")) {
    store.createReminderRule({
      kind: "night",
      promptKey: "night-synthesis",
      label: "夜间综合",
      hour: 21,
      minute: 30,
      message: "把今天压成 5 步:卡点 / 命名敌人 / 反愿景 / 愿景 / 三透镜。",
    });
  }
}

function reminderIcon(kind: ReminderKind) {
  if (kind === "morning") return Sunrise;
  if (kind === "night") return Moon;
  if (kind === "commute") return Footprints;
  return Sun;
}
</script>

<style lang="scss" scoped>
.reminders-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.reminders-frame {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 760px;
}

.reminders-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminders-group__title {
  margin: 0;
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
  color: var(--si-color-text-main);
}

.reminders-perm {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.reminders-perm__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.reminders-perm__title {
  margin: 0;
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.reminder-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.reminder-card__copy {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.reminder-card__kind-icon {
  color: var(--si-color-brand);
  flex-shrink: 0;
}

.reminder-card__label-input {
  flex: 1;
  min-width: 200px;
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.reminder-card__prompt-key {
  margin: 0;
  flex-basis: 100%;
  font-size: var(--si-font-xs);
}

.reminder-card__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.reminder-card__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--si-color-border-subtle);
}

.reminder-card__time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.reminder-card__time {
  width: 140px;
  text-align: center;
}
</style>
