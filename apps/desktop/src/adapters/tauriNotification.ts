/**
 * Notification adapter with graceful fallback.
 *
 * Inside a Tauri window we use the OS notification plugin so reminders fire
 * even when the window is hidden to tray.  In a plain browser we fall back
 * to the Web Notifications API.  On environments with neither we no-op.
 */

import type { NotificationAdapter, NotificationPayload } from "@guiling/core";

type TauriNotif = typeof import("@tauri-apps/plugin-notification");

let tauriNotif: TauriNotif | null = null;
let mode: "tauri" | "web" | "none" = "none";
let initPromise: Promise<void> | null = null;

function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
    isTauri?: boolean;
  };
  return Boolean(w.__TAURI_INTERNALS__ ?? w.__TAURI__ ?? w.isTauri);
}

async function ensureInit(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (isTauriRuntime()) {
      try {
        tauriNotif = await import("@tauri-apps/plugin-notification");
        mode = "tauri";
        return;
      } catch (err) {
        console.warn("[notification] tauri plugin import failed", err);
      }
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      mode = "web";
    } else {
      mode = "none";
    }
  })();
  return initPromise;
}

export const tauriNotificationAdapter: NotificationAdapter = {
  async notify(payload: NotificationPayload): Promise<void> {
    await ensureInit();

    if (mode === "tauri" && tauriNotif) {
      let granted = await tauriNotif.isPermissionGranted();
      if (!granted) {
        const p = await tauriNotif.requestPermission();
        granted = p === "granted";
      }
      if (!granted) return;
      tauriNotif.sendNotification({ title: payload.title, body: payload.body });
      return;
    }

    if (mode === "web") {
      if (Notification.permission !== "granted") {
        try {
          const p = await Notification.requestPermission();
          if (p !== "granted") return;
        } catch {
          return;
        }
      }
      try {
        new Notification(payload.title, { body: payload.body });
      } catch (err) {
        console.warn("[notification] web notify failed", err);
      }
    }
  },

  async requestPermission(): Promise<boolean> {
    await ensureInit();
    if (mode === "tauri" && tauriNotif) {
      if (await tauriNotif.isPermissionGranted()) return true;
      const p = await tauriNotif.requestPermission();
      return p === "granted";
    }
    if (mode === "web") {
      if (Notification.permission === "granted") return true;
      try {
        const p = await Notification.requestPermission();
        return p === "granted";
      } catch {
        return false;
      }
    }
    return false;
  },

  async isAvailable(): Promise<boolean> {
    await ensureInit();
    if (mode === "tauri" && tauriNotif) {
      try {
        return await tauriNotif.isPermissionGranted();
      } catch {
        return false;
      }
    }
    if (mode === "web") return Notification.permission === "granted";
    return false;
  },
};
