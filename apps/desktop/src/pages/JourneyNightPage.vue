<template>
  <div class="journey-night">
    <PageHeader
      title="今晚 3 件事"
      kicker="JOURNEY · 晚上回顾"
      :description="description"
      back
      back-to="/today"
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="!dirty"
          @click="save"
        >
          <Save :size="14" :stroke-width="iconStroke" />
          <span>保存</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="journey-night__frame">
        <!-- 轻量回顾(默认展开,1 分钟写完) -->
        <GlassCard variant="hero">
          <SectionLabel :icon="Moon">今晚 3 件事</SectionLabel>
          <p class="body-text">
            一天结束了。别只说自己想改变,留下证据:今天哪一刻最真实,明天哪几件事能证明你还在推进。
          </p>
        </GlassCard>

        <!-- ① 今天哪一刻最有感觉 -->
        <GlassCard>
          <SectionLabel :icon="Sparkles">① 今天哪一刻最有感觉</SectionLabel>
          <p class="muted-text">
            可能是最来劲的一刻,也可能是最不对劲的一刻。它通常会指出你真正在乎什么。
          </p>
          <textarea
            v-model="form.dailyHighlight"
            class="form-textarea"
            maxlength="240"
            placeholder="一句话写下那个时刻。它是证据,不是安慰。"
            @input="dirty = true"
          />
        </GlassCard>

        <!-- ② 明天 2-3 件小事 -->
        <GlassCard>
          <SectionLabel :icon="ListChecks">② 明天 2-3 件小事</SectionLabel>
          <p class="muted-text">
            是「你正在成为的那个人」明天会理所当然去做的事。保存后会从明天开始出现在「每日动作」。
          </p>

          <div class="journey-night__blocks">
            <div
              v-for="(block, idx) in form.tomorrowBlocks"
              :key="block.id"
              class="journey-night__block"
            >
              <input
                v-model="block.title"
                class="form-input"
                maxlength="60"
                placeholder="例如:9:30-11:00 写作 90 分钟,关掉所有通知"
                @input="dirty = true"
              />
              <input
                v-model="block.timeHint"
                class="form-input journey-night__block-time"
                maxlength="20"
                placeholder="时段(可选)"
                @input="dirty = true"
              />
              <button
                type="button"
                class="btn btn-destructive btn-sm btn-icon"
                title="删除这个时间段"
                @click="removeBlock(idx)"
              >
                <Trash2 :size="14" :stroke-width="iconStroke" />
              </button>
            </div>

            <button
              v-if="form.tomorrowBlocks.length < 5"
              type="button"
              class="btn btn-ghost btn-sm"
              @click="addBlock"
            >
              <Plus :size="14" :stroke-width="iconStroke" />
              <span>添加时间段</span>
            </button>
          </div>
        </GlassCard>

        <!-- ③ 一句话总结今天(可选) -->
        <GlassCard>
          <SectionLabel :icon="NotebookPen">③ 一句话总结今天(可选)</SectionLabel>
          <p class="muted-text">不写也行。写下来是给未来的自己看的。</p>
          <input
            v-model="form.dailySummary"
            class="form-input"
            maxlength="120"
            placeholder="例如:今天没有偷工减料"
            @input="dirty = true"
          />
        </GlassCard>

        <p
          class="journey-night__dirty-hint"
          :class="{ 'journey-night__dirty-hint--dirty': dirty }"
        >
          {{ dirty ? "有未保存修改" : "已同步" }}
        </p>

        <!-- 折叠区:想重新校准方向?(N1-N5 完整版) -->
        <GlassCard>
          <button
            type="button"
            class="journey-night__toggle"
            @click="fullExpanded = !fullExpanded"
          >
            <SectionLabel :icon="Telescope">{{ fullToggleTitle }}</SectionLabel>
            <span class="journey-night__toggle-hint">
              {{ fullExpanded ? "收起" : fullToggleHint }}
              <ChevronRight
                :size="14"
                :stroke-width="iconStroke"
                :class="{ 'journey-night__toggle-icon--open': fullExpanded }"
              />
            </span>
          </button>
          <p v-if="!fullExpanded" class="muted-text">
            原文 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度。
            方向类的回答一周内不会变,所以默认收起;有空时再展开做一次完整校准。
          </p>
        </GlassCard>

        <template v-if="fullExpanded">
          <GlassCard variant="hero">
            <SectionLabel :icon="Moon">完整 5 步校准</SectionLabel>
            <p class="body-text">
              把今天的洞见说清楚、内化进自我。原文 5 步顺序很重要——
              先说"为什么卡住",再"看清是什么挡住了你",然后压缩成两句话,最后定下三个维度。
            </p>
            <p class="muted-text">
              这套字段保存时,N3 / N4 会自动写回到「道路」页的反愿景与愿景顶部。
            </p>
          </GlassCard>

          <!-- N1 -->
          <GlassCard>
            <SectionLabel :icon="AlertTriangle">N1 · 你卡住的真正原因</SectionLabel>
            <p class="muted-text">
              经过今天之后,让你最觉得「真实」的——你之所以一直卡住的原因是什么?
            </p>
            <textarea
              v-model="form.stuckReason"
              class="form-textarea"
              maxlength="500"
              placeholder="不是借口,不是情境。是那个一直在场的真东西。"
              @input="dirty = true"
            />
          </GlassCard>

          <!-- N2 -->
          <GlassCard>
            <SectionLabel :icon="Crosshair">N2 · 看清是什么挡住了你</SectionLabel>
            <p class="muted-text">
              真正挡在前面的是什么?把它清楚说出来。<strong>不是环境,不是别人</strong>,而是那个一直在掌控局面的内在模式或信念。
            </p>
            <input
              v-model="form.enemyName"
              class="form-input"
              maxlength="80"
              placeholder="例如:害怕被评判 / 用「我太忙了」逃避真正重要的事"
              @input="dirty = true"
            />
          </GlassCard>

          <!-- N3 -->
          <GlassCard>
            <SectionLabel :icon="ShieldOff">N3 · 一句话不想回去的样子</SectionLabel>
            <p class="muted-text">
              写一句话,概括你拒绝让自己的人生变成什么样。读到它你应该会有感觉。
            </p>
            <input
              v-model="form.antiVisionMantra"
              class="form-input"
              maxlength="80"
              placeholder="例如:不要在 35 岁醒来,发现自己只过着别人替我设计的安全版本"
              @input="dirty = true"
            />
          </GlassCard>

          <!-- N4 -->
          <GlassCard>
            <SectionLabel :icon="Compass">N4 · 一句话想去到的样子(最小版)</SectionLabel>
            <p class="muted-text">
              写一句话,概括你正在朝什么方向建造(并且你知道它会演化)。
            </p>
            <input
              v-model="form.visionMantra"
              class="form-input"
              maxlength="80"
              placeholder="例如:每天都把最重要的事完整做一次,然后把节奏写下来"
              @input="dirty = true"
            />
          </GlassCard>

          <!-- N5 -->
          <GlassCard>
            <SectionLabel :icon="Telescope">N5 · 三维度</SectionLabel>
            <p class="muted-text">
              目标不是为了「成就」,目标更像一副眼镜。换上对的那副,你就会看到该看到的信息。
            </p>

            <div class="form-field">
              <label class="form-label">L1 · 一年方向</label>
              <p class="faint-text">一年后必须有什么变成事实,你才会确信自己打破了旧模式?</p>
              <input
                v-model="form.yearLens"
                class="form-input"
                maxlength="80"
                placeholder="例如:每周稳定写作 5 天,公开发布 50 篇"
                @input="dirty = true"
              />
            </div>

            <div class="form-field">
              <label class="form-label">L2 · 这个月重点</label>
              <p class="faint-text">一个月后必须有什么变成事实,才能让「一年方向」依然可能?</p>
              <input
                v-model="form.monthLens"
                class="form-input"
                maxlength="80"
                placeholder="例如:跑通「研究 → 草稿 → 发布」的完整闭环 4 次"
                @input="dirty = true"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div class="action-row">
              <button
                type="button"
                class="btn btn-primary"
                @click="saveFullReview"
              >
                <Save :size="14" :stroke-width="iconStroke" />
                <span>保存这次完整校准</span>
              </button>
              <span class="faint-text">{{ lastFullReviewLabel }}</span>
            </div>
          </GlassCard>
        </template>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  AlertTriangle,
  ChevronRight,
  Compass,
  Crosshair,
  ListChecks,
  Moon,
  NotebookPen,
  Plus,
  Save,
  ShieldOff,
  Sparkles,
  Telescope,
  Trash2,
} from "lucide-vue-next";
import {
  parseDateKey,
  tokens,
  useAppStore,
  type NightSynthesis,
  type TomorrowBlock,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const route = useRoute();
const store = useAppStore();

const dateKey = computed(() => store.state.activeDateKey);

interface FormBlock extends TomorrowBlock {
  title: string;
  timeHint: string;
}

const dirty = ref(false);
const fullExpanded = ref(false);
const form = reactive<{
  dailyHighlight: string;
  dailySummary: string;
  stuckReason: string;
  enemyName: string;
  antiVisionMantra: string;
  visionMantra: string;
  yearLens: string;
  monthLens: string;
  tomorrowBlocks: FormBlock[];
}>({
  dailyHighlight: "",
  dailySummary: "",
  stuckReason: "",
  enemyName: "",
  antiVisionMantra: "",
  visionMantra: "",
  yearLens: "",
  monthLens: "",
  tomorrowBlocks: [],
});

function newBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hydrate() {
  const ns = store.getNightSynthesis(dateKey.value);
  form.dailyHighlight = ns.dailyHighlight ?? "";
  form.dailySummary = ns.dailySummary ?? "";
  form.stuckReason = ns.stuckReason;
  form.enemyName = ns.enemyName;
  form.antiVisionMantra = ns.antiVisionMantra;
  form.visionMantra = ns.visionMantra;
  form.yearLens = ns.yearLens;
  form.monthLens = ns.monthLens;
  form.tomorrowBlocks = ns.tomorrowBlocks.length
    ? ns.tomorrowBlocks.map((b) => ({ ...b }))
    : [
        { id: newBlockId(), title: "", timeHint: "", promotedToProofRule: false },
        { id: newBlockId(), title: "", timeHint: "", promotedToProofRule: false },
      ];
  dirty.value = false;

  // 自动展开规则:
  //   1) 重启日(刚跑完 22 题)且从未完整校准过 → 展开
  //   2) 路由带 ?fullReview=1 → 展开(从 Today 「现在校准」按钮跳过来)
  const journeyCompletedAt =
    store.state.data.morningExcavation.completedAt ?? null;
  const lastFull = ns.lastFullReviewAt;
  const hasNeverDoneFullReview = !lastFull;
  const justFinishedJourneyToday =
    journeyCompletedAt &&
    journeyCompletedAt.slice(0, 10) === dateKey.value;
  const queryAsksFullReview = route.query.fullReview === "1";
  fullExpanded.value = Boolean(
    queryAsksFullReview ||
      (hasNeverDoneFullReview && justFinishedJourneyToday),
  );
}

watch(dateKey, hydrate, { immediate: true });

const description = computed(() => {
  const d = parseDateKey(dateKey.value);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 1 分钟写完`;
});

const lastFullReviewLabel = computed(() => {
  const ns = store.getNightSynthesis(dateKey.value);
  if (!ns.lastFullReviewAt) return "你还没做过完整校准";
  const d = new Date(ns.lastFullReviewAt);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "今天刚做过完整校准";
  if (days < 7) return `上次完整校准:${days} 天前`;
  if (days < 30) return `上次完整校准:${Math.floor(days / 7)} 周前`;
  return `上次完整校准:${Math.floor(days / 30)} 个月前`;
});

const fullToggleTitle = computed(() =>
  fullExpanded.value ? "完整校准方向" : "想重新校准方向?",
);
const fullToggleHint = computed(() => lastFullReviewLabel.value);

function addBlock() {
  form.tomorrowBlocks.push({
    id: newBlockId(),
    title: "",
    timeHint: "",
    promotedToProofRule: false,
  });
  dirty.value = true;
}

function removeBlock(idx: number) {
  form.tomorrowBlocks.splice(idx, 1);
  dirty.value = true;
}

function buildSynthesis(): NightSynthesis {
  const prev = store.getNightSynthesis(dateKey.value);
  return {
    dateKey: dateKey.value,
    stuckReason: form.stuckReason,
    enemyName: form.enemyName,
    antiVisionMantra: form.antiVisionMantra,
    visionMantra: form.visionMantra,
    yearLens: form.yearLens,
    monthLens: form.monthLens,
    tomorrowBlocks: form.tomorrowBlocks
      .filter((b) => b.title.trim())
      .map((b) => ({
        id: b.id,
        title: b.title,
        timeHint: b.timeHint,
        promotedToProofRule: b.promotedToProofRule,
      })),
    dailyHighlight: form.dailyHighlight,
    dailySummary: form.dailySummary,
    lastFullReviewAt: prev.lastFullReviewAt ?? null,
    updatedAt: new Date().toISOString(),
  };
}

// 默认保存:轻量回顾(不动 N1-N5,只更新 dailyHighlight / dailySummary / tomorrowBlocks)
function save() {
  store.saveNightSynthesis(buildSynthesis(), { isFullReview: false });
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  router.push("/today");
}

// 完整校准:回写 visionProfile + 推进 identity stage + 写 lastFullReviewAt
function saveFullReview() {
  store.saveNightSynthesis(buildSynthesis(), { isFullReview: true });
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  fullExpanded.value = false;
  router.push("/today");
}

onBeforeUnmount(() => {
  if (dirty.value) {
    // 离开时按轻量保存,绝不抹掉旧的方向类字段
    store.saveNightSynthesis(buildSynthesis(), { isFullReview: false });
  }
});
</script>

<style lang="scss" scoped>
.journey-night {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.journey-night__frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
}

.journey-night__blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.journey-night__block {
  display: flex;
  gap: 8px;
  align-items: center;

  .form-input {
    flex: 1;
  }
}

.journey-night__block-time {
  flex: 0 0 130px !important;
}

.journey-night__dirty-hint {
  margin: 0;
  padding: 4px 2px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.journey-night__dirty-hint--dirty {
  color: var(--si-color-warning);
}

.journey-night__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.journey-night__toggle-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--si-color-text-faint);
  font-size: var(--si-font-xs);
}

.journey-night__toggle-icon--open {
  transform: rotate(90deg);
  transition: transform 160ms ease;
}
</style>
