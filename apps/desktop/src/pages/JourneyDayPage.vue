<template>
  <div class="journey-day">
    <PageHeader
      title="白天打断"
      kicker="JOURNEY · 白天打断"
      :description="description"
      back
      back-to="/today"
    >
      <template #actions>
        <span class="journey-day__progress">
          {{ answeredCount }} / {{ allPrompts.length }}
        </span>
      </template>
    </PageHeader>

    <PageBody>
      <div class="journey-day__frame">
        <GlassCard variant="hero">
          <SectionLabel :icon="Sun">第 2 部分 · 白天打断</SectionLabel>
          <p class="body-text">
            原文要求把这 9 个问题安排成手机里的提醒,一到点就停下来作答。
            提醒越随机、越不和你的日程冲突,越好。
          </p>
          <p class="muted-text">
            这一页让你直接当场回答。你也可以在「提醒设置」里调整推送时间,让通知到了再来这里写。
          </p>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Clock">6 个时间点</SectionLabel>
          <div class="journey-day__list">
            <article
              v-for="prompt in timedPrompts"
              :key="prompt.key"
              class="journey-day__card"
              :class="{ 'journey-day__card--done': hasAnswer(prompt.key) }"
            >
              <header class="journey-day__head">
                <span class="journey-day__time">
                  {{ formatTime(prompt.hour ?? 0, prompt.minute ?? 0) }}
                </span>
                <span class="journey-day__label">{{ prompt.label }}</span>
              </header>
              <p class="journey-day__question">{{ prompt.question }}</p>
              <p class="muted-text journey-day__helper">{{ prompt.helper }}</p>
              <textarea
                :value="answerFor(prompt.key)"
                class="form-textarea journey-day__textarea"
                maxlength="400"
                placeholder="一句话也行。先把当下的真实状态记下来。"
                @blur="onAnswer(prompt.key, $event)"
              />
            </article>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel :icon="Footprints">3 个通勤反思</SectionLabel>
          <p class="muted-text">
            通勤、散步、躺着发呆时想这三条。这些题和[Q10 写下的旧身份]强相关。
          </p>
          <div class="journey-day__list">
            <article
              v-for="prompt in commutePrompts"
              :key="prompt.key"
              class="journey-day__card"
              :class="{ 'journey-day__card--done': hasAnswer(prompt.key) }"
            >
              <header class="journey-day__head journey-day__head--commute">
                <span class="journey-day__label">{{ prompt.label }}</span>
              </header>
              <p class="journey-day__question">{{ prompt.question }}</p>
              <p class="muted-text journey-day__helper">{{ prompt.helper }}</p>
              <textarea
                :value="answerFor(prompt.key)"
                class="form-textarea journey-day__textarea"
                maxlength="400"
                placeholder="三句话以内,把现场的画面写下来就够。"
                @blur="onAnswer(prompt.key, $event)"
              />
            </article>
          </div>
        </GlassCard>

        <div class="journey-day__foot">
          <button type="button" class="btn btn-ghost" @click="goReminders">
            <Bell :size="14" :stroke-width="iconStroke" />
            <span>调整提醒推送时间</span>
          </button>
          <button type="button" class="btn btn-primary" @click="goNight">
            <Moon :size="14" :stroke-width="iconStroke" />
            <span>进入晚上回顾</span>
          </button>
        </div>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Bell, Clock, Footprints, Moon, Sun } from "lucide-vue-next";
import {
  dayPrompts,
  formatTimeLabel,
  tokens,
  useAppStore,
} from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const router = useRouter();
const store = useAppStore();

const allPrompts = dayPrompts;
const timedPrompts = dayPrompts.filter((p) => p.kind === "day");
const commutePrompts = dayPrompts.filter((p) => p.kind === "commute");

const responses = computed(
  () => store.today.value.snapshot.dayPromptResponses ?? [],
);

function answerFor(key: string): string {
  return responses.value.find((r) => r.promptKey === key)?.answer ?? "";
}

function hasAnswer(key: string): boolean {
  return Boolean(answerFor(key).trim());
}

const answeredCount = computed(
  () => allPrompts.filter((p) => hasAnswer(p.key)).length,
);

const description = computed(
  () =>
    `今天 ${answeredCount.value} / ${allPrompts.length} 题已作答。同一题目同一天写多次,以最后一次为准。`,
);

function formatTime(h: number, m: number): string {
  return formatTimeLabel(h, m);
}

function onAnswer(key: string, e: Event) {
  const value = (e.target as HTMLTextAreaElement).value;
  if (value === answerFor(key)) return;
  store.answerDayPrompt(key, value);
}

function goNight() {
  router.push("/journey/night");
}

function goReminders() {
  router.push("/today/reminders");
}
</script>

<style lang="scss" scoped>
.journey-day {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.journey-day__progress {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
  font-weight: var(--si-weight-medium);
}

.journey-day__frame {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
}

.journey-day__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.journey-day__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--si-color-border-subtle);
  border-radius: var(--si-radius-lg);
  background: var(--si-color-surface-card-soft);
}

.journey-day__card--done {
  border-color: var(--si-color-brand-border);
  background: var(--si-color-brand-bg-soft);
}

.journey-day__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.journey-day__head--commute {
  justify-content: flex-start;
}

.journey-day__time {
  color: var(--si-color-brand-text);
  font-size: var(--si-font-md);
  font-weight: var(--si-weight-semibold);
  letter-spacing: 1px;
  min-width: 56px;
}

.journey-day__label {
  color: var(--si-color-text-soft);
  font-size: var(--si-font-sm);
}

.journey-day__question {
  margin: 0;
  color: var(--si-color-text-main);
  font-size: var(--si-font-md);
  line-height: 1.6;
}

.journey-day__helper {
  margin: 0;
  font-size: var(--si-font-sm);
}

.journey-day__textarea {
  min-height: 80px;
  font-size: var(--si-font-sm);
  line-height: 1.65;
}

.journey-day__foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
