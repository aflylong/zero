/**
 * Reminder scheduler.
 *
 * Runs a tick loop in the main window and, whenever a reminder becomes due
 * AND hasn't already been delivered today, asks the OS to show a notification.
 * Each notification body is suffixed with a motivational quote so the push
 * feels like encouragement instead of a scold.
 */

import {
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

  const todaySet = deliveredForDay.get(today) ?? new Set<string>();
  if (!deliveredForDay.has(today)) {
    deliveredForDay.clear();
    deliveredForDay.set(today, todaySet);
  }

  const adapter = getNotificationAdapter();

  for (const prompt of prompts) {
    if (todaySet.has(prompt.ruleId)) continue;
    todaySet.add(prompt.ruleId);

    const quote = pickRandomQuote(prompt.kind === "night" ? "night" : "daytime");
    const body = `${prompt.message}\n\n${quote.text}`;

    void adapter.notify({
      id: `${today}:${prompt.ruleId}`,
      title: prompt.label,
      body,
    });
  }
}
