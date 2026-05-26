<template>
  <PageShell tab-key="identity">
    <view class="identity-page">
      <GlassCard card-class="identity-card">
        <SectionLabel>身份翻转 3 阶段</SectionLabel>
        <text class="muted-text">
          原文 ch6 中段:翻转身份会按「失调 → 不确定 → 发现」三个阶段发生。点击切换你当下的位置。
        </text>
        <view class="identity-stages">
          <button
            v-for="s in stages"
            :key="s.value"
            class="identity-stage"
            :class="{ 'identity-stage--active': stage === s.value }"
            @tap="setStage(s.value)"
          >
            <text class="identity-stage__name">{{ s.label }}</text>
            <text class="identity-stage__desc">{{ s.description }}</text>
          </button>
        </view>
      </GlassCard>

      <GradientHeroCard card-class="identity-hero">
        <SectionLabel>你是谁</SectionLabel>
        <text class="identity-hero__title">{{ statementPreview }}</text>
        <text class="muted-text">不再回去:{{ antiIdentityPreview }}</text>
        <view class="identity-hero__actions">
          <button class="pill-button" @tap="openIdentityEditor">编辑身份</button>
          <button class="ghost-button" @tap="openIdentityEditor">管理动作</button>
        </view>
      </GradientHeroCard>

      <GlassCard card-class="identity-card">
        <SectionLabel>为什么要在第 6 步打断循环</SectionLabel>
        <text class="muted-text">
          原文 ch3-3..11:身份按 8 步循环形成。在「行为变成『我是那种人』」这一步前,你还能选;
          过了之后,你会捍卫这个身份,陷入战或逃。
        </text>
        <view class="identity-loop">
          <view
            v-for="(item, idx) in loopSteps"
            :key="`loop-${idx}`"
            class="identity-loop__row"
            :class="{ 'identity-loop__row--break': idx === 5 }"
          >
            <text class="identity-loop__index">{{ idx + 1 }}</text>
            <text class="identity-loop__text">{{ item }}</text>
          </view>
        </view>
        <text class="muted-text">
          「每日动作」就是你打断这个循环的工具:用每天的真实动作,反向把"那个人"塑造出来。
        </text>
      </GlassCard>

      <GlassCard card-class="identity-card">
        <SectionLabel>原则</SectionLabel>
        <text class="muted-text">
          你愿意反复执行的话。原文 K6 把它当作「同心圆」最外层的规则。
        </text>
        <view v-if="principles.length" class="identity-list">
          <view
            v-for="(p, index) in principles"
            :key="`identity-p-${index}`"
            class="identity-list__item"
          >
            <view class="identity-list__dot" />
            <text class="identity-list__text">{{ p }}</text>
          </view>
        </view>
        <text v-else class="muted-text">先写下一句你愿意反复执行的话,身份页才会真正站住。</text>
      </GlassCard>

      <GlassCard card-class="identity-card">
        <view class="identity-card__head">
          <SectionLabel>每日动作摘要</SectionLabel>
          <button class="ghost-button identity-card__head-button" @tap="openIdentityEditor">
            管理
          </button>
        </view>
        <text class="identity-card__title">{{ proofSummaryTitle }}</text>
        <view v-if="activeProofRules.length" class="identity-rules">
          <view
            v-for="rule in activeProofRules"
            :key="rule.id"
            class="identity-rule"
          >
            <text class="identity-rule__title">{{ rule.title }}</text>
            <text v-if="rule.description.trim()" class="identity-rule__description">
              {{ rule.description }}
            </text>
            <view
              v-if="rule.linkedYearGoal || rule.linkedMonthProject"
              class="identity-rule__links"
            >
              <text v-if="rule.linkedYearGoal" class="tag-chip">这一年的方向</text>
              <text v-if="rule.linkedMonthProject" class="tag-chip">Boss 战(这个月目标)</text>
            </view>
          </view>
        </view>
        <text v-else class="muted-text">
          还没有生效的杠杆。去编辑页加一条今天就能做到的真实动作。
        </text>
      </GlassCard>

      <view class="identity-footer">
        <button class="identity-footer__link" @tap="openPrivacy">
          关于 · 隐私政策
        </button>
        <text class="identity-footer__version">v0.2.1 · 数据存在你本机</text>
      </view>
    </view>
  </PageShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";
import type { IdentityStage } from "@/types/app";

const store = useAppStore();

const principles = computed(() =>
  store.state.data.identityProfile.principles.filter((item) => item.trim()),
);
const activeProofRules = computed(() => store.activeProofRules());
const antiIdentityPreview = computed(
  () =>
    store.state.data.identityProfile.antiIdentityText.trim() ||
    "把那个你不愿再扮演的旧版本说清楚。",
);
const statementPreview = computed(
  () => store.state.data.identityProfile.statement.trim() || "先决定你是谁",
);
const stage = computed(() => store.state.data.identityProfile.stage);

const stages: { value: IdentityStage; label: string; description: string }[] = [
  { value: "dissonance", label: "失调", description: "你感觉不属于当前生活,对没进展厌倦。" },
  { value: "uncertainty", label: "不确定", description: "你还不知道下一步,但已经在实验。" },
  { value: "discovery", label: "发现", description: "你清晰到分心不再有分量。" },
];

const loopSteps = [
  "你想达成一个目标",
  "你通过那个目标的透镜来感知现实",
  "你只会注意到能帮你达成目标的信息(学习)",
  "你朝目标行动,获得正在接近的反馈",
  "你重复这种行为,直到它自动化(条件作用)",
  "这种行为变成「我是谁」的一部分 ← 在这里打断",
  "你会捍卫你的身份,以维持心理一致性",
  "你的身份塑造新的目标,循环重启",
];

const proofSummaryTitle = computed(() => {
  if (!activeProofRules.value.length) return "还没写下「每日动作」。";
  return `当前生效 ${activeProofRules.value.length} 条杠杆,它们决定你每天怎么证明这句话。`;
});

function openIdentityEditor() {
  uni.navigateTo({ url: "/pages/identity-editor/index" });
}

function setStage(next: IdentityStage) {
  store.setIdentityStage(next);
}

function openPrivacy() {
  uni.navigateTo({ url: "/pages/privacy/index" });
}

onShow(() => {
  store.initialize();
});
</script>

<style scoped lang="scss">
.identity-page,
.identity-hero,
.identity-card,
.identity-list,
.identity-rules {
  display: flex;
  flex-direction: column;
}

.identity-page { gap: 22rpx; }
.identity-hero,
.identity-card,
.identity-list,
.identity-rules { gap: 16rpx; }

.identity-stages {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.identity-stage {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 16rpx 18rpx;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: 16rpx;
  background: transparent;
  text-align: left;
}
.identity-stage--active {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(6, 95, 70, 0.18);
}
.identity-stage__name {
  color: #f4f4f5;
  font-size: 26rpx;
  font-weight: 600;
}
.identity-stage__desc {
  color: #a1a1aa;
  font-size: 22rpx;
  line-height: 1.55;
}

.identity-hero__title,
.identity-card__title {
  color: #ecfdf5;
  line-height: 1.3;
}

.identity-hero__title {
  font-size: 50rpx;
}

.identity-card__title {
  font-size: 30rpx;
}

.identity-hero__actions,
.identity-card__head {
  display: flex;
  gap: 14rpx;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.identity-hero__actions {
  justify-content: flex-start;
  padding-top: 4rpx;
}

.identity-loop {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.identity-loop__row {
  display: flex;
  gap: 10rpx;
  padding: 10rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(10, 10, 11, 0.34);
}
.identity-loop__row--break {
  border: 1px dashed #fb923c;
  background: rgba(124, 45, 18, 0.18);
}
.identity-loop__index {
  width: 32rpx;
  color: #71717a;
  font-size: 20rpx;
}
.identity-loop__text {
  color: #d4d4d8;
  font-size: 24rpx;
  line-height: 1.55;
  flex: 1;
}

.identity-list__item,
.identity-rule {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
  padding: 22rpx;
  border-radius: 18rpx;
  background: rgba(10, 10, 11, 0.34);
}

.identity-list__dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: #34d399;
  flex-shrink: 0;
}

.identity-list__text,
.identity-rule__title {
  color: #d4d4d8;
  font-size: 26rpx;
  line-height: 1.6;
}

.identity-rule {
  flex-direction: column;
}

.identity-rule__description {
  color: #71717a;
  font-size: 22rpx;
  line-height: 1.65;
}

.identity-rule__links {
  display: flex;
  gap: 6rpx;
  margin-top: 4rpx;
}

.identity-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 0 8rpx;
}
.identity-footer__link {
  background: transparent;
  border: 0;
  color: #71717a;
  font-size: 22rpx;
  text-decoration: underline;
  padding: 6rpx 12rpx;
}
.identity-footer__version {
  color: #52525b;
  font-size: 20rpx;
}
</style>
