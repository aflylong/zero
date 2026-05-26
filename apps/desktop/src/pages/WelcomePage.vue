<template>
  <div class="welcome">
    <div class="welcome__panel">
      <img class="welcome__logo" :src="logoUrl" alt="归零" />
      <h1 class="welcome__title">归零</h1>
      <p class="welcome__en">RE:ZERO</p>
      <p class="welcome__slogan">用一天,重启你的人生。</p>

      <div class="welcome__body">
        <p class="body-text">
          这套系统基于 Dan Koe 的一篇长文。原文给的是一套需要花
          <strong>整整一天</strong>跑完的心智重置流程,而不是几分钟的表单。
        </p>
        <p class="body-text">
          推荐路径:先把原文读完(7 章,约 20 分钟),然后留出整整一天,严格按系统的引导回答 22 道题——
          11 道早晨开掘,9 道白天打断,5 步晚上回顾。
        </p>
        <p class="muted-text">
          如果你已经读过、想清楚了,也可以直接跳到方向 / 身份 / 目标的快速设置。
        </p>
      </div>

      <div class="welcome__actions">
        <button type="button" class="btn btn-primary btn-lg" @click="goReadArticle">
          <BookOpenText :size="16" :stroke-width="iconStroke" />
          <span>先读原文</span>
        </button>
        <button type="button" class="btn btn-ghost btn-lg" @click="goJourney">
          <Sun :size="16" :stroke-width="iconStroke" />
          <span>今天就跑一遍流程</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm welcome__quick" @click="goSetup">
          我已读已想过,直接快速设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpenText, Sun } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { tokens } from "@guiling/core";
import logoUrl from "@/assets/logo.png";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();

function goReadArticle() {
  router.push("/path/article");
}

function goJourney() {
  router.push("/journey/morning");
}

function goSetup() {
  router.push("/onboarding");
}
</script>

<style lang="scss" scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 48px;
}

.welcome__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 560px;
  text-align: center;
}

.welcome__logo {
  width: 80px;
  height: 80px;
  border-radius: var(--si-radius-lg);
  object-fit: contain;
  margin-bottom: 8px;
}

.welcome__title {
  margin: 0;
  font-size: var(--si-font-hero);
  font-weight: 600;
  color: var(--si-color-text-main);
  letter-spacing: 8px;
  line-height: 1;
}

.welcome__en {
  margin: 0;
  font-size: var(--si-font-md);
  color: var(--si-color-brand);
  font-weight: var(--si-weight-semibold);
  letter-spacing: 4px;
}

.welcome__slogan {
  margin: 0;
  font-size: var(--si-font-lg);
  color: var(--si-color-text-soft);
  line-height: 1.5;
}

.welcome__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0 8px;
  text-align: left;
}

.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.welcome__quick {
  align-self: center;
  margin-top: 4px;
  color: var(--si-color-text-faint);
}
</style>
