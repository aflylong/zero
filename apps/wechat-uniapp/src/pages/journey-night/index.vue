<template>
  <PageShell
    title="晚上回顾"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="goBack"
  >
    <view class="journey-night">
      <GradientHeroCard card-class="journey-night__hero">
        <SectionLabel>第 3 部分 · 综合洞见</SectionLabel>
        <text class="journey-night__title">{{ description }}</text>
        <text class="body-text">
          原文 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度。顺序很重要。
        </text>
        <text class="muted-text">
          保存时 N3 / N4 会自动写回到「道路」的反愿景与愿景顶部;N5.L3 的几个时间段会自动加进明天的「每日动作」。
        </text>
      </GradientHeroCard>

      <!-- N1 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>N1 · 你卡住的真正原因</SectionLabel>
        <text class="muted-text">
          经过今天之后,让你最觉得「真实」的——你之所以一直卡住的原因是什么?
        </text>
        <textarea
          class="textarea-shell journey-night__textarea"
          :value="form.stuckReason"
          maxlength="500"
          auto-height
          placeholder="不是借口,不是情境。是那个一直在场的真东西。"
          @input="onText('stuckReason', $event)"
        />
      </GlassCard>

      <!-- N2 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>N2 · 看清是什么挡住了你</SectionLabel>
        <text class="muted-text">
          真正的敌人是什么?把它清楚命名。不是环境,不是别人,而是那个一直在掌控局面的内在模式或信念。
        </text>
        <input
          class="input-shell"
          :value="form.enemyName"
          maxlength="80"
          placeholder="例如:害怕被评判 / 用「我太忙了」逃避真正重要的事"
          @input="onText('enemyName', $event)"
        />
      </GlassCard>

      <!-- N3 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>N3 · 一句话压缩反愿景</SectionLabel>
        <text class="muted-text">
          写一句话,概括你拒绝让自己的人生变成什么样。读到它你应该会有感觉。
        </text>
        <input
          class="input-shell"
          :value="form.antiVisionMantra"
          maxlength="80"
          placeholder="例如:不要在 35 岁醒来,发现自己只过着别人替我设计的安全版本"
          @input="onText('antiVisionMantra', $event)"
        />
      </GlassCard>

      <!-- N4 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>N4 · 一句话「想去到的样子(最小版)」</SectionLabel>
        <text class="muted-text">
          写一句话,概括你正在朝什么方向建造(并且你知道它会演化)。
        </text>
        <input
          class="input-shell"
          :value="form.visionMantra"
          maxlength="80"
          placeholder="例如:每天都把最重要的事完整做一次,然后把节奏写下来"
          @input="onText('visionMantra', $event)"
        />
      </GlassCard>

      <!-- N5 -->
      <GlassCard card-class="journey-night__card">
        <SectionLabel>N5 · 三维度</SectionLabel>
        <text class="muted-text">
          目标不是为了「成就」,目标是一种透镜。换上对的透镜,你就会看到该看到的信息。
        </text>

        <view class="field-block">
          <text class="field-label">L1 · 一年方向</text>
          <text class="muted-text">一年后必须有什么变成事实,你才会确信自己打破了旧模式?</text>
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
          <text class="muted-text">一个月后必须有什么变成事实,才能让「一年方向」依然可能?</text>
          <input
            class="input-shell"
            :value="form.monthLens"
            maxlength="80"
            placeholder="例如:跑通「研究 → 草稿 → 发布」的完整闭环 4 次"
            @input="onText('monthLens', $event)"
          />
        </view>

        <view class="field-block">
          <text class="field-label">L3 · 今天的行动 · 明天 2-3 个时间段</text>
          <text class="muted-text">
            这些是「你正在成为的那个人」会理所当然去做的事。保存后会自动出现在明天的「每日动作」。
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
        </view>
      </GlassCard>

      <text
        class="journey-night__dirty"
        :class="{ 'journey-night__dirty--on': dirty }"
      >
        {{ dirty ? "有未保存修改" : "已同步" }}
      </text>
    </view>

    <template #footer>
      <view class="journey-night__footer">
        <button class="ghost-button journey-night__footer-btn" @tap="goBack">
          返回今日
        </button>
        <button class="pill-button journey-night__footer-btn" :disabled="!dirty" @tap="save">
          保存综合
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
const form = reactive<{
  stuckReason: string;
  enemyName: string;
  antiVisionMantra: string;
  visionMantra: string;
  yearLens: string;
  monthLens: string;
  tomorrowBlocks: FormBlock[];
}>({
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
}

watch(dateKey, hydrate, { immediate: true });

const description = computed(() => {
  const d = parseDateKey(dateKey.value);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 5 步综合`;
});

function onText(
  field: "stuckReason" | "enemyName" | "antiVisionMantra" | "visionMantra" | "yearLens" | "monthLens",
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
    updatedAt: new Date().toISOString(),
  };
}

function save() {
  store.saveNightSynthesis(buildSynthesis());
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  uni.showToast({ title: "综合已保存", icon: "success" });
  setTimeout(() => goBack(), 240);
}

function goBack() {
  if (dirty.value) {
    store.saveNightSynthesis(buildSynthesis());
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
    store.saveNightSynthesis(buildSynthesis());
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

.journey-night__footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}
.journey-night__footer-btn {
  justify-content: center;
}
</style>
