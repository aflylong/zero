/**
 * Runtime-agnostic storage boundary.
 *
 * The core package DOES NOT know about uni.*, window.localStorage, or Tauri's fs —
 * each host app registers its own adapter at startup via `setStorageAdapter`.
 */

export const STORAGE_KEY = "guiling:v1";

export interface StorageAdapter {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): void;
}

/**
 * Fallback adapter — stores nothing, returns whatever fallback is provided.
 * Useful for SSR or test environments. Host apps should replace it on startup.
 */
const memoryAdapter: StorageAdapter = {
  read: <T,>(_key: string, fallback: T) => fallback,
  write: () => {
    /* no-op */
  },
};

let currentAdapter: StorageAdapter = memoryAdapter;

export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter;
}

export function readAppStorage<T>(fallback: T): T {
  try {
    return currentAdapter.read(STORAGE_KEY, fallback);
  } catch (error) {
    console.error("read app storage failed", error);
    return fallback;
  }
}

export function writeAppStorage<T>(value: T): void {
  try {
    currentAdapter.write(STORAGE_KEY, value);
  } catch (error) {
    console.error("write app storage failed", error);
  }
}
