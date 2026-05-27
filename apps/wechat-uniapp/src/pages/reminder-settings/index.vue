<template>
  <PageShell
    title="提醒设置"
    topbar-mode="secondary"
    back-url="/pages/today/index"
  >
    <view class="reminder-page">
      <view class="reminder-hero">
        <SectionLabel>9 时间点 + 早晚锚点</SectionLabel>
        <text class="reminder-hero__title">决定系统什么时候把你拉回正轨。</text>
        <text class="muted-text">
          按原文 9 时间点(D1-D6 + W1-W3) + 早晨开掘锚点 + 晚上回顾入口管理。关掉的提醒不会推送通知。
        </text>
        <view class="reminder-hero__actions">
          <button class="ghost-button" @tap="seedDefaults">恢复默认 9 时间点</button>
          <button class="pill-button" @tap="addCustom">新增提醒</button>
        </view>
      </view>

      <view
        v-for="group in groupedRules"
        :key="group.kind"
        class="reminder-group"
      >
        <view class="reminder-group__head">
          <text class="reminder-group__title">{{ group.title }}</text>
          <text class="muted-text reminder-group__desc">{{ group.description }}</text>
        </view>

        <view class="reminder-list">
          <GlassCard
            v-for="rule in group.rules"
            :key="rule.id"
            card-class="reminder-card"
          >
            <view class="reminder-card__head">
              <view class="reminder-card__copy">
                <input
                  class="input-shell reminder-card__title-input"
                  :value="rule.label"
                  maxlength="40"
                  placeholder="提醒名称"
                  @input="updateLabel(rule.id, $event)"
                />
                <text v-if="rule.promptKey" class="reminder-card__prompt-key">
                  题目锚点:{{ rule.promptKey }}
                </text>
              </view>
              <view class="reminder-card__actions">
                <button
                  class="reminder-card__toggle"
                  :class="{ 'reminder-card__toggle--active': rule.enabled }"
                  @tap="toggleEnabled(rule)"
                >
                  {{ rule.enabled ? "已开启" : "已关闭" }}
                </button>
                <button class="danger-button reminder-card__del" @tap="remove(rule.id)">
                  删除
                </button>
              </view>
            </view>

              <view class="reminder-card__body">
                <view class="reminder-card__time-row">
                <text class="field-label">提醒时间</text>
                <picker
                  mode="time"
                  :value="formatReminder(rule.hour, rule.minute)"
                  @change="handleReminderTimeChange(rule.id, $event)"
                >
                  <view class="reminder-card__time">
                    {{ formatReminder(rule.hour, rule.minute) }}
                  </view>
                </picker>
              </view>

              <view class="field-block">
                <text class="field-label">
                  {{ rule.promptKey ? "题干 / 备注文案" : "提醒文案" }}
                </text>
                <textarea
                  class="textarea-shell"
                  :value="rule.message"
                  maxlength="240"
                  auto-height
                  placeholder="这条提醒响起时你希望看到的一句话"
                  @input="updateMessage(rule.id, $event)"
                />
              </view>
            </view>
          </GlassCard>
        </view>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { dayPrompts } from "@/static/content/dayPrompts";
import { useAppStore } from "@/stores/useAppStore";
import type { ReminderKind, ReminderRule } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();
const reminderRules = computed(() => store.state.data.reminderRules);

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
        "原文 W1-W3。通勤、散步、发呆时想这三条。默认时间:早 6:50 / 中午 12:30 / 晚 19:00,可调。",
    },
    night: {
      title: "晚上回顾入口",
      description: "原文 Part 3 入口提醒。响起时进入 5 步回顾。",
    },
  };

  return order.map((kind) => ({
    kind,
    title: titles[kind].title,
    description: titles[kind].description,
    rules: reminderRules.value.filter((r) => r.kind === kind),
  }));
});

function formatReminder(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toggleEnabled(rule: ReminderRule) {
  store.updateReminderRule(rule.id, { enabled: !rule.enabled });
}

function remove(ruleId: string) {
  store.removeReminderRule(ruleId);
}

function handleReminderTimeChange(ruleId: string, event: UniValueEvent) {
  const value = String(event.detail?.value ?? "");
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;
  store.updateReminderRule(ruleId, { hour, minute });
}

function updateLabel(ruleId: string, e: UniValueEvent) {
  store.updateReminderRule(ruleId, { label: String(e.detail?.value ?? "") });
}

function updateMessage(ruleId: string, e: UniValueEvent) {
  store.updateReminderRule(ruleId, { message: String(e.detail?.value ?? "") });
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
  const have = new Set(
    reminderRules.value
      .map((r) => r.promptKey)
      .filter((k): k is string => Boolean(k)),
  );
  for (const dp of dayPrompts) {
    if (have.has(dp.key)) continue;
    const commuteDefaults: Record<string, [number, number]> = {
      "w1-commute": [6, 50],
      "w2-commute": [12, 30],
      "w3-commute": [19, 0],
    };
    const [h, m] =
      dp.kind === "commute"
        ? commuteDefaults[dp.key] ?? [7, 0]
        : [dp.hour ?? 0, dp.minute ?? 0];
    store.createReminderRule({
      kind: dp.kind === "day" ? "day" : "commute",
      promptKey: dp.key,
      label: dp.label,
      hour: h,
      minute: m,
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
      label: "晚上回顾",
      hour: 21,
      minute: 30,
      message: "晚上 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度。",
    });
  }
  if (!have.has("weekly-recalibrate")) {
    store.createReminderRule({
      kind: "night",
      promptKey: "weekly-recalibrate",
      label: "本周校准方向",
      hour: 21,
      minute: 0,
      daysOfWeek: [0],
      message: "周日晚上 5 分钟:把这一周的状态对一下方向。展开「想重新校准方向?」就行。",
    });
  }
  uni.showToast({ title: "已补全默认", icon: "success" });
}

onShow(() => {
  store.initialize();
  store.refreshReminderPrompts();
});
</script>

<style scoped lang="scss">
.reminder-page,
.reminder-hero,
.reminder-list,
.reminder-group,
.reminder-card,
.reminder-card__copy {
  display: flex;
  flex-direction: column;
}

.reminder-page { gap: 28rpx; }
.reminder-hero,
.reminder-list,
.reminder-group { gap: 18rpx; }
.reminder-card { gap: 16rpx; }

.reminder-hero__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
}
.reminder-hero__actions {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.reminder-group__title {
  color: #f4f4f5;
  font-size: 28rpx;
  font-weight: 600;
}
.reminder-group__desc {
  font-size: 22rpx;
  line-height: 1.55;
}

.reminder-card__head {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
  justify-content: space-between;
}
.reminder-card__copy {
  flex: 1;
  gap: 6rpx;
}
.reminder-card__title-input {
  font-size: 28rpx;
  font-weight: 600;
}
.reminder-card__prompt-key {
  color: #71717a;
  font-size: 20rpx;
}
.reminder-card__actions {
  display: flex;
  gap: 8rpx;
  align-items: center;
}
.reminder-card__toggle {
  min-width: 116rpx;
  padding: 12rpx 22rpx;
  border: 1px solid rgba(63, 63, 70, 0.64);
  border-radius: 999rpx;
  color: #a1a1aa;
  font-size: 22rpx;
}
.reminder-card__toggle--active {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(6, 95, 70, 0.2);
  color: #d1fae5;
}
.reminder-card__del {
  font-size: 22rpx;
  padding: 12rpx 16rpx;
}

.reminder-card__body {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding-top: 14rpx;
  border-top: 1px solid rgba(39, 39, 42, 0.72);
}

.reminder-card__time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.reminder-card__time {
  min-width: 140rpx;
  padding: 18rpx 24rpx;
  border-radius: 18rpx;
  background: rgba(6, 95, 70, 0.24);
  color: #d1fae5;
  font-size: 30rpx;
  text-align: center;
}

.field-label {
  color: #f4f4f5;
  font-size: 24rpx;
}
.field-block {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
</style>
