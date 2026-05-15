<template>
  <div class="welcome">
    <div class="welcome__panel">
      <img class="welcome__logo" :src="logoUrl" alt="归零" />
      <h1 class="welcome__title">归零</h1>
      <p class="welcome__en">RE:ZERO</p>
      <p class="welcome__slogan">用一天,重启你的人生。</p>

      <div class="welcome__body">
        <p class="body-text">
          这个系统基于一篇文章。它不是鸡汤,是一套可以在一天内执行的心智重置流程。
        </p>
        <p class="body-text">
          建议你先花 20 分钟把原文读完——想清楚你要去哪、不要回到哪——然后再来设置你的方向、身份和目标。
        </p>
        <p class="muted-text">
          如果你已经读过了,或者已经想清楚了,可以直接开始设置。
        </p>
      </div>

      <div class="welcome__actions">
        <button type="button" class="btn btn-primary btn-lg" @click="goReadArticle">
          <BookOpenText :size="16" :stroke-width="iconStroke" />
          <span>先读原文</span>
        </button>
        <button type="button" class="btn btn-ghost btn-lg" @click="goSetup">
          <Rocket :size="16" :stroke-width="iconStroke" />
          <span>我想清楚了,直接设置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpenText, Rocket } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { tokens } from "@guiling/core";
import logoUrl from "@/assets/logo.png";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();

function goReadArticle() {
  router.push("/path/article");
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
  max-width: 520px;
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
</style>
