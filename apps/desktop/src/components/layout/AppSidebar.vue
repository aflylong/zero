<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <img class="sidebar__brand-logo" :src="logoUrl" alt="归零" />
      <div class="sidebar__brand-text">
        <span class="sidebar__brand-title">归零</span>
        <span class="sidebar__brand-en">RE:ZERO</span>
        <span class="sidebar__brand-tag">用一天,重启你的人生</span>
      </div>
    </div>

    <nav class="sidebar__nav">
      <SidebarLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :description="item.description"
      >
        <component :is="item.icon" :size="iconSize" :stroke-width="iconStroke" />
      </SidebarLink>
    </nav>

    <div class="sidebar__foot">
      <SidebarLink
        v-if="!journeyCompleted"
        to="/journey/morning"
        label="一天流程"
        :description="journeyStarted ? '继续未完成的题' : '严格按原文跑 22 题'"
      >
        <Sun :size="iconSize" :stroke-width="iconStroke" />
      </SidebarLink>
      <SidebarLink
        v-if="needsOnboarding"
        to="/onboarding"
        label="快速设置"
        description="3 分钟把方向定下来"
      >
        <Rocket :size="iconSize" :stroke-width="iconStroke" />
      </SidebarLink>
      <SidebarLink to="/settings" label="设置" variant="subtle">
        <Settings :size="iconSize" :stroke-width="iconStroke" />
      </SidebarLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, markRaw } from "vue";
import {
  Sun,
  Compass,
  Flame,
  UserCheck,
  Settings,
  Rocket,
} from "lucide-vue-next";
import SidebarLink from "./SidebarLink.vue";
import { tokens, useAppStore } from "@guiling/core";
import logoUrl from "@/assets/logo.png";

const iconSize = tokens.iconSizes.lg;
const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();

const needsOnboarding = computed(() => !store.state.data.onboardingCompleted);
const journeyStarted = computed(() =>
  Boolean(store.state.data.morningExcavation.startedAt),
);
const journeyCompleted = computed(() => store.state.data.journeyCompleted);

const navItems = [
  {
    to: "/today",
    label: "今日",
    description: "把身份变成今天的动作",
    icon: markRaw(Sun),
  },
  {
    to: "/path",
    label: "道路",
    description: "愿景、目标和约束",
    icon: markRaw(Compass),
  },
  {
    to: "/records",
    label: "记录",
    description: "连续天数和热力轨迹",
    icon: markRaw(Flame),
  },
  {
    to: "/identity",
    label: "身份",
    description: "信念和证明法则",
    icon: markRaw(UserCheck),
  },
];
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px 14px;
  border-right: 1px solid var(--si-color-border-faint);
  background: #050506;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 20px;
}

.sidebar__brand-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--si-radius-md);
  flex-shrink: 0;
  object-fit: contain;
}

.sidebar__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.sidebar__brand-title {
  color: var(--si-color-text-main);
  font-size: var(--si-font-lg);
  font-weight: var(--si-weight-semibold);
  line-height: 1.1;
  letter-spacing: 4px;
}

.sidebar__brand-en {
  color: var(--si-color-brand);
  font-size: 10px;
  font-weight: var(--si-weight-semibold);
  letter-spacing: 2px;
  line-height: 1.1;
}

.sidebar__brand-tag {
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
  padding-top: 8px;
  border-top: 1px solid var(--si-color-border-faint);
}

.sidebar__foot {
  padding-top: 12px;
  border-top: 1px solid var(--si-color-border-faint);
}
</style>
