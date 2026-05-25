/**
 * Runtime-agnostic notification boundary.
 *
 * Desktop app wires this up to Tauri's notification plugin so reminders
 * fire as real OS notifications (even when the window is closed / minimized),
 * 加上短铃声和窗口拉前台的能力。
 */

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp for when it should fire. `null` = immediately. */
  scheduledAt?: string | null;
  /** 是否同时播放一声短促铃声 */
  sound?: boolean;
  /** 是否把窗口拉到前台抢焦点 */
  focusWindow?: boolean;
}

export interface NotificationAdapter {
  /** Push a notification immediately. */
  notify(payload: NotificationPayload): Promise<void> | void;
  /** Request OS permission. Returns true if granted. */
  requestPermission?(): Promise<boolean>;
  /** Whether OS-level notifications are currently available. */
  isAvailable?(): Promise<boolean> | boolean;
  /** 播放一声短铃声(独立暴露,UI 内部 banner 也可调用) */
  playSound?(): Promise<void> | void;
  /** 把应用窗口拉到前台并抢焦点 */
  focusWindow?(): Promise<void> | void;
}

const noopAdapter: NotificationAdapter = {
  notify: () => {
    /* no-op */
  },
  isAvailable: () => false,
};

let currentAdapter: NotificationAdapter = noopAdapter;

export function setNotificationAdapter(adapter: NotificationAdapter): void {
  currentAdapter = adapter;
}

export function getNotificationAdapter(): NotificationAdapter {
  return currentAdapter;
}
