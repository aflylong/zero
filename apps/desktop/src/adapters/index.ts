import {
  setNotificationAdapter,
  setStorageAdapter,
} from "@guiling/core";
import { initTauriStorage, tauriStorageAdapter } from "./tauriStorage";
import { tauriNotificationAdapter } from "./tauriNotification";

/**
 * Wires platform adapters into the shared core package.  Must be called
 * before the Vue app mounts so the store sees populated storage.
 */
export async function installAdapters(): Promise<void> {
  await initTauriStorage();
  setStorageAdapter(tauriStorageAdapter);
  setNotificationAdapter(tauriNotificationAdapter);
}
