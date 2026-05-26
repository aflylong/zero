/**
 * Reminder scheduler.
 *
 * 每 30 秒扫一次到期提醒,把对应 promptKey 的原文题干推到桌面通知里。
 * 用 dailySnapshot.notifiedReminderIds 做持久化去重 —— 即便用户重启应用、
 * 切换日期,同一条提醒在同一天也只会推送一次。
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
  const adapter = getNotificationAdapter();

  for (const prompt of prompts) {
    // 持久化去重:即便重启进程,markReminderNotified 也会读 dailySnapshot 里
    // 已经写入的 notifiedReminderIds,返回 false 表示今天已经推过。
    const isFirstTimeToday = store.markReminderNotified(prompt.ruleId, today);
    if (!isFirstTimeToday) continue;

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
        soundVolume: prefs.soundVolume,
        focusWindow: prefs.focusWindow,
      });
    } else {
      // 即便关掉了系统通知,声音和抢焦点也独立尊重
      if (prefs.sound) void adapter.playSound?.(prefs.soundVolume);
      if (prefs.focusWindow) void adapter.focusWindow?.();
    }
  }
}
