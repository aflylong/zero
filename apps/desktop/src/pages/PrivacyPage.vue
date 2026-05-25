<template>
  <div class="privacy-page">
    <PageHeader
      title="隐私政策"
      kicker="PRIVACY"
      :description="`最后更新:${updatedAt}`"
      back
      back-to="/settings"
    />

    <PageBody>
      <div class="privacy-frame">
        <GlassCard variant="hero">
          <SectionLabel :icon="ShieldCheck">归零 · 不收集任何个人信息</SectionLabel>
          <p class="body-text">
            「归零(RE:ZERO)」是一款个人效率工具。它基于结构化的写作与提醒流程,帮你把方向、目标、每日动作整理成一个能持续运转的系统。
          </p>
          <p class="muted-text">
            本应用不是心理咨询、不提供医疗建议,所有内容仅供个人参考与自我整理。
          </p>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="EyeOff">一、我们不收集什么</SectionLabel>
          <p class="body-text">本应用不收集、不上传、不分析以下任何信息:</p>
          <ul class="privacy-list">
            <li>你的设备信息、网络信息、地理位置、账户信息</li>
            <li>你写下的愿景、反愿景、身份、目标、每日杠杆</li>
            <li>你回答的开掘题、白天打断作答、夜间综合内容</li>
            <li>你的今日观察、复盘、目标历史、动作日志</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="HardDrive">二、数据存在哪里</SectionLabel>
          <p class="body-text">
            所有上述数据通过 Tauri 文件系统插件保存在你本机的应用数据目录中
            (Windows:<code>%APPDATA%\app.guiling.desktop\guiling\state.json</code>),
            <strong>不离开你的设备</strong>,<strong>不传输到任何服务器</strong>。
          </p>
          <ul class="privacy-list">
            <li>换设备、卸载、重装,这些数据会随之消失</li>
            <li>开发者无法看到、读取、找回任何数据</li>
            <li>你可以在「设置 → 数据」里随时导出 JSON 备份或导入恢复</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Bell">三、通知</SectionLabel>
          <p class="body-text">
            应用通过操作系统通知能力(Tauri Notification 插件 + Web Audio + 窗口前置)推送提醒。它只在以下条件下才会发送:
          </p>
          <ul class="privacy-list">
            <li>你已在系统层面授权通知权限</li>
            <li>你在「提醒设置」里没有关闭对应规则</li>
            <li>提醒内容只是你自己设定的题目与文案,不包含任何外部信息</li>
          </ul>
          <p class="body-text">
            你随时可以在系统通知设置或本应用「设置 → 提醒强度」里关闭桌面通知 / 铃声 / 抢前台 / 应用内浮层中的任意一项。
          </p>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Network">四、第三方</SectionLabel>
          <p class="body-text">
            本应用<strong>不接入任何第三方 SDK</strong>(无统计、无广告、无 AI 服务、无云数据库)。所有功能在本机运行,不会向外部发起任何网络请求。
          </p>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="UserCheck">五、你的权利</SectionLabel>
          <ul class="privacy-list">
            <li>导出 / 导入数据:在「设置 → 数据」里有完整入口</li>
            <li>关闭提醒:在「设置 → 提醒强度」逐项关闭,或卸载即停</li>
            <li>清除数据:删除上述 state.json 文件即可,本应用不会留下任何外部痕迹</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="RefreshCw">六、更新</SectionLabel>
          <p class="body-text">
            如果未来本应用接入新的能力(例如云同步、第三方服务),我们会在更新此政策的同时,在应用内明确告知,并在你授权后才启用相关功能。
          </p>
          <p class="faint-text">版本 0.2.0 · 数据存在你本机</p>
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import {
  Bell,
  EyeOff,
  HardDrive,
  Network,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-vue-next";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const updatedAt = "2026-05-25";
</script>

<style lang="scss" scoped>
.privacy-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.privacy-frame {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.privacy-list {
  margin: 0;
  padding-left: 22px;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-md);
  line-height: 1.7;
}

.privacy-list li {
  margin-bottom: 4px;
}

code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--si-color-surface-inset);
  color: var(--si-color-brand-text);
  font-family: "Menlo", "Consolas", monospace;
  font-size: var(--si-font-sm);
}
</style>
