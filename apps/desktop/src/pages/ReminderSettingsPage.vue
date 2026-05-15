<template>
  <div class="reminders-page">
    <PageHeader
      title="提醒设置"
      kicker="REMINDERS"
      description="决定系统什么时候把你拉回正轨。关掉的提醒不会推送通知。"
      back
      back-to="/today"
    />

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

        <div class="reminders-list">
          <GlassCard v-for="rule in reminderRules" :key="rule.id">
            <div class="reminder-card__head">
              <div class="reminder-card__copy">
                <SectionLabel :icon="reminderIcon(rule.kind)">
                  {{ reminderKindLabel(rule.kind) }}
                </SectionLabel>
                <input
                  class="form-input reminder-card__label-input"
                  :value="rule.label"
                  maxlength="20"
                  @input="updateLabel(rule.id, $event)"
                />
              </div>
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
            </div>

            <div class="reminder-card__body">
              <div class="reminder-card__time-row">
                <span class="form-label">提醒时间</span>
                <input
                  :value="formatTime(rule.hour, rule.minute)"
                  type="time"
                  class="form-input reminder-card__time"
                  @change="updateTime(rule.id, $event)"
                />
              </div>

              <div class="form-field">
                <label class="form-label">提醒文案</label>
                <textarea
                  class="form-textarea"
                  :value="rule.message"
                  maxlength="200"
                  placeholder="这条提醒响起时你希望看到的一句话"
                  @input="updateMessage(rule.id, $event)"
                />
              </div>
            </div>
          </GlassCard>
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
  Moon,
  Sun,
  Sunrise,
} from "lucide-vue-next";
import {
  getNotificationAdapter,
  tokens,
  useAppStore,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const reminderRules = computed(() => store.state.data.reminderRules);
const permissionStatus = ref<"unknown" | "granted" | "denied">("unknown");

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
  store.updateReminderRule(ruleId, { message: (e.target as HTMLTextAreaElement).value });
}

function updateLabel(ruleId: string, e: Event) {
  store.updateReminderRule(ruleId, { label: (e.target as HTMLInputElement).value });
}

function toggle(rule: { id: string; enabled: boolean }) {
  store.updateReminderRule(rule.id, { enabled: !rule.enabled });
}

function reminderIcon(kind: "morning" | "day" | "night") {
  if (kind === "morning") return Sunrise;
  if (kind === "night") return Moon;
  return Sun;
}

function reminderKindLabel(kind: "morning" | "day" | "night"): string {
  if (kind === "morning") return "早晨开掘";
  if (kind === "night") return "夜间复盘";
  return "白天打断";
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
  gap: 20px;
  max-width: 760px;
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
  gap: 16px;
}

.reminder-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.reminder-card__copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.reminder-card__label-input {
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
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
