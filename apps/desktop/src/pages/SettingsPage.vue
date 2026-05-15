<template>
  <div class="settings-page">
    <PageHeader
      title="设置"
      kicker="SETTINGS"
      description="通知权限、开机自启、数据导入导出。"
    />

    <PageBody>
      <div class="settings-frame">
        <GlassCard>
          <SectionLabel :icon="Bell">系统通知</SectionLabel>
          <div class="settings-row">
            <div class="settings-row__copy">
              <p class="settings-row__title">
                {{ permissionGranted ? "已授权" : "未授权" }}
              </p>
              <p class="muted-text">
                {{
                  permissionGranted
                    ? "提醒到达时会推送桌面通知,窗口最小化到托盘也能响。"
                    : "点击右侧按钮请求授权,否则提醒只会在窗口打开时显示。"
                }}
              </p>
            </div>
            <button
              v-if="!permissionGranted"
              type="button"
              class="btn btn-edit btn-sm"
              @click="requestPermission"
            >
              <BellRing :size="14" :stroke-width="iconStroke" />
              <span>请求授权</span>
            </button>
            <span v-else class="tag-chip tag-chip--active">
              <CheckCircle2 :size="12" :stroke-width="2" />
              <span>已开启</span>
            </span>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Rocket">开机自启</SectionLabel>
          <div class="settings-row">
            <div class="settings-row__copy">
              <p class="settings-row__title">
                {{ autostartEnabled ? "已开启" : "已关闭" }}
              </p>
              <p class="muted-text">
                开启后,系统启动时应用会自动在后台运行,提醒不会错过。
              </p>
            </div>
            <button
              type="button"
              class="btn btn-sm"
              :class="autostartEnabled ? 'btn-success' : 'btn-ghost'"
              :disabled="autostartBusy"
              @click="toggleAutostart"
            >
              <component
                :is="autostartEnabled ? Power : PowerOff"
                :size="14"
                :stroke-width="iconStroke"
              />
              <span>{{ autostartEnabled ? "已开启" : "已关闭" }}</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Database">数据</SectionLabel>
          <p class="muted-text">
            所有数据存在本地 AppData 目录下的一个 JSON 文件。可以随时导出备份,或从备份导入恢复。
          </p>
          <div class="action-row">
            <button type="button" class="btn btn-ghost btn-sm" @click="exportData" :disabled="exporting">
              <Download :size="14" :stroke-width="iconStroke" />
              <span>导出备份</span>
            </button>
            <button type="button" class="btn btn-edit btn-sm" @click="importData" :disabled="importing">
              <Upload :size="14" :stroke-width="iconStroke" />
              <span>从备份导入</span>
            </button>
          </div>
          <p v-if="lastOpMessage" class="settings-op-hint" :class="opClass">
            {{ lastOpMessage }}
          </p>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Info">关于</SectionLabel>
          <div class="settings-about">
            <img class="settings-about__logo" :src="logoUrl" alt="归零" />
            <div class="settings-about__copy">
              <p class="settings-about__title">归零 · RE:ZERO</p>
              <p class="muted-text">用一天,重启你的人生。</p>
              <p class="faint-text">版本 0.1.0 · Tauri 2 · 数据存在本地</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Database,
  Download,
  Info,
  Power,
  PowerOff,
  Rocket,
  Upload,
} from "lucide-vue-next";
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
} from "@tauri-apps/plugin-autostart";
import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import {
  getNotificationAdapter,
  tokens,
  useAppStore,
  type AppData,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";
import logoUrl from "@/assets/logo.png";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const permissionGranted = ref(false);
const autostartEnabled = ref(false);
const autostartBusy = ref(false);
const exporting = ref(false);
const importing = ref(false);
const lastOpMessage = ref("");
const lastOpKind = ref<"ok" | "warn" | "">("");

const opClass = computed(() => ({
  "settings-op-hint--ok": lastOpKind.value === "ok",
  "settings-op-hint--warn": lastOpKind.value === "warn",
}));

onMounted(async () => {
  const adapter = getNotificationAdapter();
  if (typeof adapter.isAvailable === "function") {
    permissionGranted.value = Boolean(await adapter.isAvailable());
  }
  try {
    autostartEnabled.value = await isAutostartEnabled();
  } catch (err) {
    console.warn("[settings] autostart status unavailable", err);
  }
});

async function requestPermission() {
  const adapter = getNotificationAdapter();
  if (typeof adapter.requestPermission !== "function") return;
  permissionGranted.value = await adapter.requestPermission();
}

async function toggleAutostart() {
  autostartBusy.value = true;
  try {
    if (autostartEnabled.value) {
      await disableAutostart();
      autostartEnabled.value = false;
    } else {
      await enableAutostart();
      autostartEnabled.value = true;
    }
  } catch (err) {
    console.error("[settings] autostart toggle failed", err);
    flash("切换开机自启失败", "warn");
  } finally {
    autostartBusy.value = false;
  }
}

async function exportData() {
  exporting.value = true;
  try {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const target = await saveDialog({
      defaultPath: `guiling-backup-${stamp}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!target) return;
    const payload = store.exportData();
    await writeTextFile(target, JSON.stringify(payload, null, 2));
    flash("备份已导出", "ok");
  } catch (err) {
    console.error("[settings] export failed", err);
    flash("导出失败", "warn");
  } finally {
    exporting.value = false;
  }
}

async function importData() {
  importing.value = true;
  try {
    const picked = await openDialog({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    const path = Array.isArray(picked) ? picked[0] : picked;
    if (!path) return;
    const raw = await readTextFile(path);
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== "object") {
      flash("文件格式不对", "warn");
      return;
    }
    store.importData(parsed);
    flash("备份已导入,数据已恢复", "ok");
  } catch (err) {
    console.error("[settings] import failed", err);
    flash("导入失败,请检查文件格式", "warn");
  } finally {
    importing.value = false;
  }
}

function flash(msg: string, kind: "ok" | "warn") {
  lastOpMessage.value = msg;
  lastOpKind.value = kind;
  setTimeout(() => {
    lastOpMessage.value = "";
    lastOpKind.value = "";
  }, 3200);
}
</script>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.settings-frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
}

.settings-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.settings-row__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.settings-row__title {
  margin: 0;
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
  color: var(--si-color-text-main);
}

.settings-about {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-about__logo {
  width: 56px;
  height: 56px;
  border-radius: var(--si-radius-md);
  object-fit: contain;
  flex-shrink: 0;
}

.settings-about__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.settings-about__title {
  margin: 0;
  font-size: var(--si-font-lg);
  color: var(--si-color-text-main);
  font-weight: var(--si-weight-semibold);
  letter-spacing: 1px;
}

.settings-op-hint {
  margin: 0;
  font-size: var(--si-font-sm);
  color: var(--si-color-text-faint);
}

.settings-op-hint--ok {
  color: var(--si-color-brand);
}

.settings-op-hint--warn {
  color: var(--si-color-warning);
}
</style>
