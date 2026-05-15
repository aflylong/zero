/**
 * Storage adapter with graceful fallback.
 *
 * Strategy:
 *   1. Detect whether we're running inside a Tauri window at runtime.
 *   2. If YES — persist to the app's AppData directory as JSON (durable).
 *   3. If NO  — fall back to `window.localStorage` (for browser-based dev).
 *
 * The core store's StorageAdapter interface is synchronous. The Tauri fs
 * plugin is async, so we:
 *   - Preload the JSON blob on startup into an in-memory cache.
 *   - Serve sync read/write from cache.
 *   - Debounce an async flush (~250ms) that writes the cache to disk.
 */

import type { StorageAdapter } from "@guiling/core";

const DATA_DIR = "guiling";
const FILE_NAME = "state.json";
const LS_KEY = "guiling:v1";
const FLUSH_DEBOUNCE_MS = 250;

let cache: Record<string, unknown> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingWrite = false;

// Chosen once at init. When Tauri isn't available we stay on localStorage for
// the whole session, so a renderer reload doesn't corrupt the disk file.
let mode: "tauri" | "web" = "web";

// Lazy-loaded Tauri fs bindings — only imported in tauri mode to avoid
// `window.__TAURI_INTERNALS__` access from a pure browser.
type TauriFs = typeof import("@tauri-apps/plugin-fs");
let fs: TauriFs | null = null;

function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
    isTauri?: boolean;
  };
  return Boolean(w.__TAURI_INTERNALS__ ?? w.__TAURI__ ?? w.isTauri);
}

async function ensureDir(): Promise<void> {
  if (!fs) return;
  const ok = await fs.exists(DATA_DIR, { baseDir: fs.BaseDirectory.AppData });
  if (!ok) {
    await fs.mkdir(DATA_DIR, { baseDir: fs.BaseDirectory.AppData, recursive: true });
  }
}

async function loadFromDisk(): Promise<Record<string, unknown>> {
  if (mode === "web") {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch (err) {
      console.warn("[storage] localStorage load failed", err);
      return {};
    }
  }

  if (!fs) return {};
  try {
    await ensureDir();
    const path = `${DATA_DIR}/${FILE_NAME}`;
    const hasFile = await fs.exists(path, { baseDir: fs.BaseDirectory.AppData });
    if (!hasFile) return {};
    const raw = await fs.readTextFile(path, { baseDir: fs.BaseDirectory.AppData });
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    console.error("[storage] tauri load failed, starting with empty cache", err);
    return {};
  }
}

async function flush(): Promise<void> {
  if (mode === "web") {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(cache));
      pendingWrite = false;
    } catch (err) {
      console.error("[storage] localStorage flush failed", err);
    }
    return;
  }

  if (!fs) return;
  try {
    await ensureDir();
    await fs.writeTextFile(`${DATA_DIR}/${FILE_NAME}`, JSON.stringify(cache), {
      baseDir: fs.BaseDirectory.AppData,
    });
    pendingWrite = false;
  } catch (err) {
    console.error("[storage] tauri flush failed", err);
  }
}

function scheduleFlush(): void {
  pendingWrite = true;
  if (flushTimer !== null) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_DEBOUNCE_MS);
}

/**
 * Hydrates the in-memory cache from disk (or localStorage in web mode).
 * Must be awaited before mounting the app so the store's first read
 * sees real data.
 */
export async function initTauriStorage(): Promise<void> {
  if (isTauriRuntime()) {
    try {
      fs = await import("@tauri-apps/plugin-fs");
      mode = "tauri";
    } catch (err) {
      console.warn("[storage] tauri fs import failed, falling back to localStorage", err);
      mode = "web";
    }
  } else {
    mode = "web";
  }

  cache = await loadFromDisk();

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      if (pendingWrite) void flush();
    });
  }
}

export const tauriStorageAdapter: StorageAdapter = {
  read<T>(_key: string, fallback: T): T {
    // We store the whole app-state under a single key; `_key` from core is
    // always the same STORAGE_KEY and kept for interface compatibility.
    const value = cache[LS_KEY] ?? cache[_key];
    return (value === undefined ? fallback : value) as T;
  },
  write<T>(_key: string, value: T): void {
    cache[LS_KEY] = value as unknown;
    scheduleFlush();
  },
};
