/**
 * Notification adapter with graceful fallback.
 *
 * 在 Tauri 内:用 OS 通知插件 + 把窗口拉到前台 + 播放一声短铃声。
 * 在浏览器内:Web Notifications API + WebAudio 短铃声(允许在用户交互后)。
 * 没有任何能力时:静默 noop。
 */

import type { NotificationAdapter, NotificationPayload } from "@guiling/core";

type TauriNotif = typeof import("@tauri-apps/plugin-notification");
type TauriWindow = typeof import("@tauri-apps/api/window");

let tauriNotif: TauriNotif | null = null;
let tauriWindow: TauriWindow | null = null;
let mode: "tauri" | "web" | "none" = "none";
let initPromise: Promise<void> | null = null;
let audioCtx: AudioContext | null = null;

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
        try {
          tauriWindow = await import("@tauri-apps/api/window");
        } catch (err) {
          console.warn("[notification] tauri window api import failed", err);
        }
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

/**
 * 用 WebAudio 合成一段更明显的提醒钟声。
 * 默认是「叮 — 咚 — 叮」三音组合,每声主频叠一层 1 octave 高的副频做"金属感",
 * 经过低通过滤器避免刺耳,通过 master gain 接受 0-100 的 volume 参数。
 *
 *   - 注意:WebAudio 的 gain 是线性放大;0.5 就已经接近系统通知音量上限,
 *     0.85 是不破音的实际上限,所以 100 = 0.85,30 ≈ 0.25。
 */
async function playChime(volume: number = 70): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (!audioCtx) {
      const Ctx =
        (window.AudioContext as typeof AudioContext | undefined) ??
        ((window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext);
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch {
        /* ignore */
      }
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // 把 0-100 的 volume 映射到 0-0.85 的 gain。
    const v = Math.max(0, Math.min(100, volume));
    const masterGainValue = (v / 100) * 0.85;
    if (masterGainValue <= 0) return;

    // master 链:lowpass + compressor + gain → destination,避免高频刺耳与破音。
    const master = ctx.createGain();
    master.gain.value = masterGainValue;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.ratio.setValueAtTime(4, now);
    compressor.attack.setValueAtTime(0.005, now);
    compressor.release.setValueAtTime(0.1, now);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(4500, now);
    lowpass.Q.setValueAtTime(0.7, now);

    lowpass.connect(compressor);
    compressor.connect(master);
    master.connect(ctx.destination);

    const playTone = (freq: number, startAt: number, duration = 0.18) => {
      // 主音(三角波,饱满温暖)+ 副音(正弦波,高 octave 加亮)
      const oscMain = ctx.createOscillator();
      oscMain.type = "triangle";
      oscMain.frequency.value = freq;

      const oscHarm = ctx.createOscillator();
      oscHarm.type = "sine";
      oscHarm.frequency.value = freq * 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startAt);
      // 起音快,余音慢
      gain.gain.linearRampToValueAtTime(0.55, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      const harmGain = ctx.createGain();
      harmGain.gain.value = 0.25;

      oscMain.connect(gain);
      oscHarm.connect(harmGain);
      harmGain.connect(gain);
      gain.connect(lowpass);

      oscMain.start(startAt);
      oscHarm.start(startAt);
      oscMain.stop(startAt + duration + 0.05);
      oscHarm.stop(startAt + duration + 0.05);
    };

    // 「叮 — 咚 — 叮」三段。频率:E5 / B4 / E6,有起伏更引人注意。
    playTone(659.25, now);
    playTone(493.88, now + 0.18);
    playTone(1318.51, now + 0.36);
  } catch (err) {
    console.warn("[notification] chime failed", err);
  }
}

async function focusAppWindow(): Promise<void> {
  if (mode === "tauri" && tauriWindow) {
    try {
      const win = tauriWindow.getCurrentWindow();
      if (await win.isMinimized()) await win.unminimize();
      if (!(await win.isVisible())) await win.show();
      await win.setFocus();
    } catch (err) {
      console.warn("[notification] focus window failed", err);
    }
    return;
  }
  if (mode === "web" && typeof window !== "undefined") {
    try {
      window.focus();
    } catch {
      /* ignore */
    }
  }
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
      if (granted) {
        try {
          tauriNotif.sendNotification({
            title: payload.title,
            body: payload.body,
          });
        } catch (err) {
          console.warn("[notification] send failed", err);
        }
      }
      if (payload.sound !== false) await playChime(payload.soundVolume);
      if (payload.focusWindow) await focusAppWindow();
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
      if (payload.sound !== false) await playChime(payload.soundVolume);
      if (payload.focusWindow) await focusAppWindow();
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

  async playSound(volume?: number): Promise<void> {
    await ensureInit();
    await playChime(volume);
  },

  async focusWindow(): Promise<void> {
    await ensureInit();
    await focusAppWindow();
  },
};
