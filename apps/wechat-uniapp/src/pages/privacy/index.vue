<template>
  <PageShell
    title="隐私政策"
    topbar-mode="secondary"
    back-url="/pages/today/index"
  >
    <view class="privacy-page">
      <view class="privacy-hero">
        <SectionLabel>PRIVACY · 隐私政策</SectionLabel>
        <text class="privacy-hero__title">归零 · 不收集任何个人信息。</text>
        <text class="muted-text">最后更新:{{ updatedAt }}</text>
      </view>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">一、应用定位</text>
        <text class="body-text">
          「归零(RE:ZERO)」是一款个人效率工具。它基于结构化的写作与提醒流程,帮你把方向、目标、每日动作整理成一个可以持续运转的系统。
        </text>
        <text class="body-text">
          本应用不是心理咨询、不提供医疗建议,所有内容仅供个人参考与自我整理。
        </text>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">二、我们不收集什么</text>
        <text class="body-text">
          本应用不收集、不上传、不分析以下任何信息:
        </text>
        <view class="privacy-list">
          <text class="privacy-list__item">· 你的微信账号、昵称、头像、手机号、地理位置</text>
          <text class="privacy-list__item">· 你写下的愿景、反愿景、身份、目标、每日动作</text>
          <text class="privacy-list__item">· 你回答的开掘题、白天打断作答、晚上回顾内容</text>
          <text class="privacy-list__item">· 你的今日观察、复盘、目标历史、动作日志</text>
        </view>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">三、数据存在哪里</text>
        <text class="body-text">
          所有上述数据都通过 <text class="privacy-mono">uni.setStorageSync</text> 保存在你本机的微信小程序本地存储中,**不离开你的设备**,**不传输到任何服务器**。
        </text>
        <text class="body-text">
          这意味着:
        </text>
        <view class="privacy-list">
          <text class="privacy-list__item">· 换设备、清除小程序缓存、重装微信,这些数据会随之消失</text>
          <text class="privacy-list__item">· 我们(开发者)无法看到、读取、找回任何数据</text>
          <text class="privacy-list__item">· 你的隐私由你的设备保管,本应用本身不构成泄露风险</text>
        </view>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">四、提醒(订阅消息)</text>
        <text class="body-text">
          应用提供基于「微信订阅消息」的提醒能力。它只在以下条件下才会发送:
        </text>
        <view class="privacy-list">
          <text class="privacy-list__item">· 你主动授权过该类提醒(微信会有授权弹窗)</text>
          <text class="privacy-list__item">· 你在「提醒设置」里没有关闭对应规则</text>
          <text class="privacy-list__item">· 提醒内容只是你自己设定的题目与文案,不包含任何外部信息</text>
        </view>
        <text class="body-text">
          授权后,你随时可以在微信「设置 → 通知 → 小程序订阅消息」中关闭。
        </text>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">五、第三方</text>
        <text class="body-text">
          本应用**不接入任何第三方 SDK**(无统计、无广告、无 AI 服务、无云数据库)。打开微信 → 我 → 设置 → 关于微信 → 个人信息与权限,你可以核对它真的没有任何外部权限请求。
        </text>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">六、你的权利</text>
        <view class="privacy-list">
          <text class="privacy-list__item">· 你可以随时清除小程序数据:微信 → 我 → 设置 → 通用 → 存储 → 找到「归零」清除缓存</text>
          <text class="privacy-list__item">· 你可以随时关闭提醒:本应用「提醒设置」页 / 微信通知设置</text>
          <text class="privacy-list__item">· 你可以随时停止使用并卸载,本应用不会留下任何外部记录</text>
        </view>
      </GlassCard>

      <GlassCard card-class="privacy-card">
        <text class="privacy-section__title">七、更新</text>
        <text class="body-text">
          如果未来本应用接入新的能力(例如云同步、第三方服务),我们会在更新此政策的同时,在应用内明确告知,并在你授权后才启用相关功能。
        </text>
      </GlassCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";

const updatedAt = "2026-05-25";
</script>

<style scoped lang="scss">
.privacy-page,
.privacy-hero,
.privacy-card,
.privacy-list {
  display: flex;
  flex-direction: column;
}

.privacy-page { gap: 22rpx; }
.privacy-hero,
.privacy-card { gap: 14rpx; }
.privacy-list { gap: 6rpx; }

.privacy-hero__title {
  color: #f5f5f5;
  font-size: 38rpx;
  font-weight: 600;
  line-height: 1.34;
}

.privacy-section__title {
  color: #f4f4f5;
  font-size: 28rpx;
  font-weight: 600;
}

.privacy-list__item {
  color: #d4d4d8;
  font-size: 26rpx;
  line-height: 1.7;
}

.privacy-mono {
  font-family: "Menlo", "Consolas", monospace;
  color: #d1fae5;
  font-size: 24rpx;
}
</style>
