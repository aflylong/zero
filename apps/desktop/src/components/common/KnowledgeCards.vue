<template>
  <section v-if="cards.length" class="knowledge-cards">
    <div v-for="card in cards" :key="card.title" class="knowledge-card">
      <header class="knowledge-card__head">
        <component :is="card.icon" :size="14" :stroke-width="iconStroke" />
        <span class="knowledge-card__title">{{ card.title }}</span>
      </header>
      <p v-if="card.intro" class="knowledge-card__intro">{{ card.intro }}</p>
      <ol v-if="card.kind === 'ordered'" class="knowledge-card__list">
        <li v-for="(item, idx) in card.items" :key="idx">{{ item }}</li>
      </ol>
      <ul v-else class="knowledge-card__list knowledge-card__list--unordered">
        <li v-for="(item, idx) in card.items" :key="idx">{{ item }}</li>
      </ul>
      <p v-if="card.outro" class="knowledge-card__outro">{{ card.outro }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Activity,
  GitBranch,
  Layers,
  Repeat,
  Sigma,
  TrendingUp,
} from "lucide-vue-next";
import { tokens } from "@guiling/core";

const iconStroke = tokens.iconStrokeWidth;

const props = defineProps<{ sectionId: string }>();

interface Card {
  title: string;
  intro?: string;
  outro?: string;
  icon: unknown;
  kind: "ordered" | "unordered";
  items: string[];
}

const cards = computed<Card[]>(() => {
  if (props.sectionId === "ch3-fear") {
    return [
      {
        title: "身份形成 8 步循环",
        intro: "在第 6 步与第 7 步之间打断它。",
        icon: Repeat,
        kind: "ordered",
        items: [
          "想达成一个目标",
          "通过那个目标的透镜来感知现实",
          "只注意到能帮你达成目标的信息(学习)",
          "朝目标行动,获得正在接近的反馈",
          "重复这种行为,直到它自动化(条件作用)",
          "这种行为变成「我是谁」的一部分 ← 在这里打断",
          "你会捍卫你的身份,以维持心理一致性",
          "你的身份塑造新的目标,循环重启",
        ],
      },
    ];
  }
  if (props.sectionId === "ch4-levels") {
    return [
      {
        title: "9 个心智发展阶段",
        intro: "多数读者位于第 4-8 阶段;穿越任何阶段都遵循同一种模式。",
        icon: Layers,
        kind: "ordered",
        items: [
          "冲动型 — 冲动与行动没有分离,非黑即白",
          "自我保护型 — 世界很危险,学会保护自己",
          "从众型 — 你就是你的群体",
          "自我觉察型 — 注意到内在与外在不一致",
          "尽责型 — 建立自己的原则体系并自我负责",
          "个体主义型 — 看到原则受情境塑造,松弛持有",
          "战略家型 — 在系统中工作,意识到自己也参与其中",
          "建构觉察型 — 把所有框架视为「有用的虚构」",
          "合一型 — 自我与生命之间的分离消融",
        ],
      },
    ];
  }
  if (props.sectionId === "ch5-intelligence") {
    return [
      {
        title: "成功公式",
        icon: Sigma,
        kind: "unordered",
        items: ["能动性 (Agency)", "机会 (Opportunity)", "智力 (Intelligence)"],
      },
      {
        title: "控制论 5 步循环",
        intro: "能拥有目标 / 朝目标行动 / 感知位置 / 对比 / 反馈。",
        icon: Activity,
        kind: "ordered",
        items: [
          "拥有一个目标",
          "朝目标行动",
          "感知你所处的位置",
          "将其与目标对比",
          "再根据反馈继续行动",
        ],
      },
      {
        title: "提升智力的 6 项动作",
        icon: TrendingUp,
        kind: "unordered",
        items: [
          "拒绝那条已知的路",
          "跳进未知",
          "设定新的、更高的目标来扩展心智",
          "拥抱混乱,允许成长发生",
          "学习自然的一般性原则",
          "成为一个深度通才(deep generalist)",
        ],
      },
    ];
  }
  if (props.sectionId === "ch7-gamify") {
    return [
      {
        title: "6 组件 = 同心圆",
        intro: "由内向外:愿景 → 一年方向 → 这个月重点 → 每日动作 → 约束(规则)。反愿景是赌注。",
        icon: GitBranch,
        kind: "ordered",
        items: [
          "K1 反愿景 — 赌注",
          "K2 愿景 — 如何赢",
          "K3 一年方向 — 这一年里唯一的优先事项",
          "K4 这个月重点 — Boss 战(这个月目标)",
          "K5 每日动作 — 优先级最高、真正推动指标的小事",
          "K6 约束 — 规则,激发创造力的限制",
        ],
      },
    ];
  }
  return [];
});
</script>

<style lang="scss" scoped>
.knowledge-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-md);
  background: var(--si-color-surface-card-soft);
}

.knowledge-card__head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--si-color-brand-text);
}

.knowledge-card__title {
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
}

.knowledge-card__intro,
.knowledge-card__outro {
  margin: 0;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-sm);
  line-height: 1.6;
}

.knowledge-card__list {
  margin: 0;
  padding-left: 22px;
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  line-height: 1.7;
}

.knowledge-card__list--unordered {
  list-style: disc;
}
</style>
