<template>
  <div class="journey-night">
    <PageHeader
      title="夜间综合"
      kicker="JOURNEY · 综合洞见"
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
          <span>保存综合</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="journey-night__frame">
        <GlassCard variant="hero">
          <SectionLabel :icon="Moon">第 3 部分 · 综合洞见</SectionLabel>
          <p class="body-text">
            把今天的洞见说清楚、内化进自我,据此明天就行动。
            原文要求 5 步,顺序很重要——先说"为什么卡住",再"命名敌人",
            然后压缩成两句话,最后定三个透镜。
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
          <SectionLabel :icon="Crosshair">N2 · 命名敌人</SectionLabel>
          <p class="muted-text">
            真正的敌人是什么?把它清楚命名。<strong>不是环境,不是别人</strong>,而是那个一直在掌控局面的内在模式或信念。
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
          <SectionLabel :icon="ShieldOff">N3 · 一句话压缩反愿景</SectionLabel>
          <p class="muted-text">
            写一句话,概括你拒绝让自己的人生变成什么样。这是压缩版的反愿景。读到它你应该会有感觉。
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
          <SectionLabel :icon="Compass">N4 · 一句话愿景 MVP</SectionLabel>
          <p class="muted-text">
            写一句话,概括你正在朝什么方向建造(并且你知道它会演化)。这是你的愿景 MVP。
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
          <SectionLabel :icon="Telescope">N5 · 创建三透镜</SectionLabel>
          <p class="muted-text">
            目标不是为了「成就」,目标是一种透镜。换上对的透镜,你就会看到该看到的信息。
          </p>

          <div class="form-field">
            <label class="form-label">L1 · 一年透镜</label>
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
            <label class="form-label">L2 · 一月透镜</label>
            <p class="faint-text">一个月后必须有什么变成事实,才能让「一年透镜」依然可能?</p>
            <input
              v-model="form.monthLens"
              class="form-input"
              maxlength="80"
              placeholder="例如:跑通「研究 → 草稿 → 发布」的完整闭环 4 次"
              @input="dirty = true"
            />
          </div>

          <div class="form-field">
            <label class="form-label">L3 · 每日透镜 · 明天 2-3 个时间块</label>
            <p class="faint-text">
              这些是「你正在成为的那个人」会理所当然去做的事。保存后会自动出现在明天的"今日杠杆"。
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
                  title="删除这个时间块"
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
                <span>添加时间块</span>
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Lightbulb">关于这套综合</SectionLabel>
          <p class="body-text">
            「再次强调,这些不是为了成就而设定的目标,因为目标只是投射。把目标当作一种视角——一种透镜。」
          </p>
          <p class="faint-text">—— 原文 ch6-56,这就是你今晚收尾的全部锚点。</p>
        </GlassCard>

        <p
          class="journey-night__dirty-hint"
          :class="{ 'journey-night__dirty-hint--dirty': dirty }"
        >
          {{ dirty ? "有未保存修改" : "已同步" }}
        </p>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  AlertTriangle,
  Compass,
  Crosshair,
  Lightbulb,
  Moon,
  Plus,
  Save,
  ShieldOff,
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
const store = useAppStore();

const dateKey = computed(() => store.state.activeDateKey);

interface FormBlock extends TomorrowBlock {
  title: string;
  timeHint: string;
}

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
  // 升格 tomorrow blocks
  store.promoteTomorrowBlocks(dateKey.value);
  dirty.value = false;
  router.push("/today");
}

onBeforeUnmount(() => {
  if (dirty.value) {
    store.saveNightSynthesis(buildSynthesis());
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
</style>
