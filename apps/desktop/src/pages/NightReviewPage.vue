<template>
  <div class="night-redirect">
    <PageHeader
      title="夜间复盘已升级"
      kicker="NIGHT REVIEW · 已重构"
      description="原文夜晚 5 步流程现在叫「夜间综合」,字段对齐了 N1-N5,这里只是入口。"
      back
      back-to="/today"
    />

    <PageBody>
      <div class="night-redirect__frame">
        <GlassCard variant="hero">
          <SectionLabel :icon="Moon">为什么改了</SectionLabel>
          <p class="body-text">
            旧的「赢点 / 偏离 / 反思 / 明日修正」是产品式自创字段,
            和原文 Part 3 的 5 步(卡点 / 命名敌人 / 压缩反愿景 / 压缩愿景 / 三透镜)
            语义错位。新版本对齐了原文,而且会把 N3 / N4 自动写回到「道路」的反愿景与愿景顶部,
            把 N5 的明日时间块自动升格为「今日杠杆」。
          </p>
          <div class="action-row">
            <button type="button" class="btn btn-primary" @click="goNew">
              <Telescope :size="14" :stroke-width="iconStroke" />
              <span>进入新版「夜间综合」</span>
            </button>
            <button type="button" class="btn btn-ghost" @click="goToday">
              <ChevronLeft :size="14" :stroke-width="iconStroke" />
              <span>先回今日</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ChevronLeft, Moon, Telescope } from "lucide-vue-next";
import { tokens } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();

function goNew() {
  router.push("/journey/night");
}
function goToday() {
  router.push("/today");
}
</script>

<style lang="scss" scoped>
.night-redirect {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.night-redirect__frame {
  max-width: 720px;
}
</style>
