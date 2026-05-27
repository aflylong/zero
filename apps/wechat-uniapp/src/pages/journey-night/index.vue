<template>
  <PageShell
    title="今晚 3 件事"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="goBack"
  >
    <view class="journey-night">
      <GradientHeroCard card-class="journey-night__hero">
        <SectionLabel>今晚 3 件事</SectionLabel>
        <text class="journey-night__title">{{ description }}</text>
        <text class="body-text">
          一天结束了。花一两分钟把这三件事写下来,然后就可以收工了。
        </text>
      </GradientHeroCard>

      <!-- ① 今天哪一刻最有感觉 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>① 今天哪一刻最有感觉</SectionLabel>
        <text class="muted-text">
          可能是最来劲的一刻,也可能是最不对劲的一刻。它通常会指出你真正在乎什么。
        </text>
        <textarea
          class="textarea-shell journey-night__textarea"
          :value="form.dailyHighlight"
          maxlength="240"
          auto-height
          placeholder="一句话写下那个时刻就行,不用解释。"
          @input="onText('dailyHighlight', $event)"
        />
      </GlassCard>

      <!-- ② 明天 2-3 件小事 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>② 明天 2-3 件小事</SectionLabel>
        <text class="muted-text">
          是「你正在成为的那个人」明天会理所当然去做的事。保存后会自动出现在明天的「每日动作」。
        </text>
        <view class="journey-night__blocks">
          <view
            v-for="(block, idx) in form.tomorrowBlocks"
            :key="block.id"
            class="journey-night__block"
          >
            <input
              class="input-shell journey-night__block-title"
              :value="block.title"
              maxlength="60"
              placeholder="例如:9:30-11:00 写作 90 分钟"
              @input="onBlockChange(idx, 'title', $event)"
            />
            <input
              class="input-shell journey-night__block-time"
              :value="block.timeHint"
              maxlength="20"
              placeholder="时段(可选)"
              @input="onBlockChange(idx, 'timeHint', $event)"
            />
            <button
              class="ghost-button journey-night__block-del"
              @tap="removeBlock(idx)"
            >
              ×
            </button>
          </view>

          <button
            v-if="form.tomorrowBlocks.length < 5"
            class="ghost-button"
            @tap="addBlock"
          >
            + 添加时间段
          </button>
        </view>
      </GlassCard>

      <!-- ③ 一句话总结今天(可选) -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>③ 一句话总结今天(可选)</SectionLabel>
        <text class="muted-text">不写也行。写下来是给未来的自己看的。</text>
        <input
          class="input-shell"
          :value="form.dailySummary"
          maxlength="120"
          placeholder="例如:今天没有偷工减料"
          @input="onText('dailySummary', $event)"
        />
      </GlassCard>

      <text
        class="journey-night__dirty"
        :class="{ 'journey-night__dirty--on': dirty }"
      >
        {{ dirty ? "有未保存修改" : "已同步" }}
      </text>

      <!-- 折叠区:想重新校准方向?(N1-N5 完整版) -->
      <GlassCard card-class="journey-night__card">
        <button class="journey-night__toggle" @tap="fullExpanded = !fullExpanded">
          <text class="journey-night__toggle-title">
            {{ fullExpanded ? "完整校准方向" : "想重新校准方向?" }}
          </text>
          <text class="journey-night__toggle-hint">
            {{ fullExpanded ? "收起" : lastFullReviewLabel }}
          </text>
        </button>
        <text v-if="!fullExpanded" class="muted-text">
          原文 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度。
          方向类的回答一周内不会变,所以默认收起;有空时再展开做一次完整校准。
        </text>
      </GlassCard>

      <template v-if="fullExpanded">
        <GradientHeroCard card-class="journey-night__hero">
          <SectionLabel>完整 5 步校准</SectionLabel>
          <text class="body-text">
            把今天的洞见说清楚、内化进自我。原文 5 步顺序很重要——
            先说"为什么卡住",再"看清是什么挡住了你",然后压缩成两句话,最后定下三个维度。
          </text>
        </GradientHeroCard>

        <GlassCard card-class="journey-night__card">
          <SectionLabel>N1 · 你卡住的真正原因</SectionLabel>
          <textarea
            class="textarea-shell journey-night__textarea"
            :value="form.stuckReason"
            maxlength="500"
            auto-height
            placeholder="不是借口,不是情境。是那个一直在场的真东西。"
            @input="onText('stuckReason', $event)"
          />
        </GlassCard>

        <GlassCard card-class="journey-night__card">
          <SectionLabel>N2 · 看清是什么挡住了你</SectionLabel>
          <text class="muted-text">
            不是环境,不是别人,而是那个一直在掌控局面的内在模式或信念。
          </text>
          <input
            class="input-shell"
            :value="form.enemyName"
            maxlength="80"
            placeholder="例如:害怕被评判 / 用「我太忙了」逃避真正重要的事"
            @input="onText('enemyName', $event)"
          />
        </GlassCard>

        <GlassCard card-class="journey-night__card">
          <SectionLabel>N3 · 一句话不想回去的样子</SectionLabel>
          <input
            class="input-shell"
            :value="form.antiVisionMantra"
            maxlength="80"
            placeholder="例如:不要在 35 岁醒来,发现自己只过着别人替我设计的安全版本"
            @input="onText('antiVisionMantra', $event)"
          />
        </GlassCard>

        <GlassCard card-class="journey-night__card">
          <SectionLabel>N4 · 一句话想去到的样子(最小版)</SectionLabel>
          <input
            class="input-shell"
            :value="form.visionMantra"
            maxlength="80"
            placeholder="例如:每天都把最重要的事完整做一次,然后把节奏写下来"
            @input="onText('visionMantra', $event)"
          />
        </GlassCard>

        <GlassCard card-class="journey-night__card">
          <SectionLabel>N5 · 三维度</SectionLabel>
          <view class="field-block">
            <text class="field-label">L1 · 一年方向</text>
            <input
              class="input-shell"
              :value="form.yearLens"
              maxlength="80"
              placeholder="例如:每周稳定写作 5 天,公开发布 50 篇"
              @input="onText('yearLens', $event)"
            />
          </view>
          <view class="field-block">
            <text class="field-label">L2 · 这个月重点</text>
            <input
              class="input-shell"
              :value="form.monthLens"
              maxlength="80"
              placeholder="例如:跑通「研究 → 草稿 → 发布」的完整闭环 4 次"
              @input="onText('monthLens', $event)"
            />
          </view>
        </GlassCard>

        <button class="pill-button journey-night__full-save" @tap="saveFullReview">
          保存这次完整校准
        </button>
      </template>
    </view>

    <template #footer>
      <view class="journey-night__footer">
        <button class="ghost-button journey-night__footer-btn" @tap="goBack">
          返回今日
        </button>
        <button class="pill-button journey-night__footer-btn" :disabled="!dirty" @tap="save">
          保存
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import GradientHeroCard from "@/components/GradientHeroCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { parseDateKey } from "@/services/date";
import { switchToTab, TODAY_PAGE_PATH } from "@/services/navigation";
import { useAppStore } from "@/stores/useAppStore";
import type { NightSynthesis, TomorrowBlock } from "@/types/app";

type UniValueEvent = Event & { detail?: { value?: string } };

const store = useAppStore();
const dateKey = computed(() => store.state.activeDateKey);

interface FormBlock extends TomorrowBlock {}

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

  // 重启日(刚跑完 22 题)且从未完整校准过 → 自动展开
  const journeyCompletedAt = store.state.data.morningExcavation.completedAt ?? null;
  const lastFull = ns.lastFullReviewAt;
  const justFinishedJourneyToday =
    journeyCompletedAt && journeyCompletedAt.slice(0, 10) === dateKey.value;
  fullExpanded.value = Boolean(!lastFull && justFinishedJourneyToday);
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
  if (days < 7) return `上次校准:${days} 天前`;
  if (days < 30) return `上次校准:${Math.floor(days / 7)} 周前`;
  return `上次校准:${Math.floor(days / 30)} 个月前`;
});

function onText(
  field:
    | "dailyHighlight"
    | "dailySummary"
    | "stuckReason"
    | "enemyName"
    | "antiVisionMantra"
    | "visionMantra"
    | "yearLens"
    | "monthLens",
  e: UniValueEvent,
) {
  form[field] = String(e.detail?.value ?? "");
  dirty.value = true;
}

function onBlockChange(idx: number, field: "title" | "timeHint", e: UniValueEvent) {
  const block = form.tomorrowBlocks[idx];
  if (!block) return;
  block[field] = String(e.detail?.value ?? "");
  dirty.value = true;
}

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

function save() {
  store.saveNightSynthesis(buildSynthesis(), { isFullReview: false });
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  uni.showToast({ title: "已保存", icon: "success" });
  setTimeout(() => goBack(), 240);
}

function saveFullReview() {
  store.saveNightSynthesis(buildSynthesis(), { isFullReview: true });
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  fullExpanded.value = false;
  uni.showToast({ title: "完整校准已保存", icon: "success" });
  setTimeout(() => goBack(), 240);
}

function goBack() {
  if (dirty.value) {
    store.saveNightSynthesis(buildSynthesis(), { isFullReview: false });
  }
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  switchToTab(TODAY_PAGE_PATH);
}

onShow(() => {
  store.initialize();
});

onBeforeUnmount(() => {
  if (dirty.value) {
    store.saveNightSynthesis(buildSynthesis(), { isFullReview: false });
  }
});
</script>

<style scoped lang="scss">
.journey-night,
.journey-night__hero,
.journey-night__card,
.field-block {
  display: flex;
  flex-direction: column;
}
.journey-night { gap: 24rpx; }
.journey-night__hero,
.journey-night__card,
.field-block { gap: 16rpx; }

.journey-night__title {
  color: #f5f5f5;
  font-size: 36rpx;
  line-height: 1.34;
  font-weight: 600;
}

.journey-night__textarea {
  min-height: 200rpx;
}

.journey-night__blocks {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.journey-night__block {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.journey-night__block-title {
  flex: 1;
}
.journey-night__block-time {
  width: 200rpx;
}
.journey-night__block-del {
  min-width: 64rpx;
}

.journey-night__dirty {
  padding: 12rpx 4rpx;
  color: #71717a;
  font-size: 22rpx;
}
.journey-night__dirty--on {
  color: #fb923c;
}

.journey-night__toggle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6rpx;
  padding: 0;
  background: transparent;
  border: 0;
  text-align: left;
}
.journey-night__toggle-title {
  color: #f5f5f5;
  font-size: 30rpx;
  font-weight: 600;
}
.journey-night__toggle-hint {
  color: #71717a;
  font-size: 22rpx;
}

.journey-night__full-save {
  align-self: flex-start;
}

.journey-night__footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}
.journey-night__footer-btn {
  justify-content: center;
}
</style>
