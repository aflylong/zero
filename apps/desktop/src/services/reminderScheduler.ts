/**
 * Reminder scheduler.
 *
 * 每 30 秒扫一次到期提醒,把对应 promptKey 的原文题干推到桌面通知里,
 * 同一天同一 ruleId 只推一次,避免轰炸。
 *
 * 用户的通知偏好(声音 / 桌面通知 / 抢前台)从 store 取。
 */

import {
  findDayPrompt,
  getNotificationAdapter,
  pickRandomQuote,
  type AppStore,
} from "@guiling/core";

const TICK_MS = 30_000;
const deliveredForDay = new Map<string, Set<string>>();

export function startReminderScheduler(store: AppStore): () => void {
  const tick = () => {
    try {
      runOnce(store);
    } catch (err) {
      console.error("[reminderScheduler] tick failed", err);
    }
  };

  tick();
  const handle = setInterval(tick, TICK_MS);
  return () => clearInterval(handle);
}

function runOnce(store: AppStore): void {
  store.refreshReminderPrompts();
  const prompts = store.state.pendingReminderPrompts;
  const today = store.state.activeDateKey;
  const prefs = store.state.data.notificationPreferences;

  const todaySet = deliveredForDay.get(today) ?? new Set<string>();
  if (!deliveredForDay.has(today)) {
    deliveredForDay.clear();
    deliveredForDay.set(today, todaySet);
  }

  const adapter = getNotificationAdapter();

  for (const prompt of prompts) {
    if (todaySet.has(prompt.ruleId)) continue;
    todaySet.add(prompt.ruleId);

    const dp = prompt.promptKey ? findDayPrompt(prompt.promptKey) : null;
    const question = dp?.question ?? prompt.question ?? prompt.message;
    const quote = pickRandomQuote(prompt.kind === "night" ? "night" : "daytime");
    const body = `${question}\n\n${quote.text}`;

    if (prefs.desktopNotification) {
      void adapter.notify({
        id: `${today}:${prompt.ruleId}`,
        title: prompt.label,
        body,
        sound: prefs.sound,
        focusWindow: prefs.focusWindow,
      });
    } else {
      // 即便关掉了系统通知,声音和抢焦点也独立尊重
      if (prefs.sound) void adapter.playSound?.();
      if (prefs.focusWindow) void adapter.focusWindow?.();
    }
  }
}
