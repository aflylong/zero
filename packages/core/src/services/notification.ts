/**
 * Runtime-agnostic notification boundary.
 *
 * Desktop app wires this up to Tauri's notification plugin so reminders
 * fire as real OS notifications (even when the window is closed / minimized).
 *
 * The mini-program keeps using in-app prompts and can safely ignore this.
 */

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp for when it should fire. `null` = immediately. */
  scheduledAt?: string | null;
}

export interface NotificationAdapter {
  /** Push a notification immediately. */
  notify(payload: NotificationPayload): Promise<void> | void;
  /** Request OS permission. Returns true if granted. */
  requestPermission?(): Promise<boolean>;
  /** Whether OS-level notifications are currently available. */
  isAvailable?(): Promise<boolean> | boolean;
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
