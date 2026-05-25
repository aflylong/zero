<template>
  <PageShell
    title="夜间复盘已升级"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="goToday"
  >
    <view class="redirect-page">
      <GradientHeroCard card-class="redirect-card">
        <SectionLabel>NIGHT REVIEW · 已重构</SectionLabel>
        <text class="redirect-card__title">夜间流程现在叫「夜间综合」</text>
        <text class="body-text">
          旧的「赢点 / 偏离 / 反思 / 明日修正」是产品式自创字段,
          和原文 Part 3 的 5 步(卡点 / 命名敌人 / 压缩反愿景 / 压缩愿景 / 三透镜)语义错位。
          新版本对齐了原文,会自动把 N3 / N4 写回到「道路」的反愿景与愿景顶部,
          把 N5 的明日时间块自动升格为「今日杠杆」。
        </text>
        <view class="action-row">
          <button class="pill-button" @tap="goNew">进入新版「夜间综合」</button>
          <button class="ghost-button" @tap="goToday">先回今日</button>
        </view>
      </GradientHeroCard>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";

function goNew() {
  uni.redirectTo({ url: "/pages/journey-night/index" });
}
function goToday() {
  switchToTab(TODAY_PAGE_PATH);
}
</script>

<style scoped lang="scss">
.redirect-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.redirect-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
.redirect-card__title {
  color: #f5f5f5;
  font-size: 38rpx;
  line-height: 1.34;
  font-weight: 600;
}
</style>
