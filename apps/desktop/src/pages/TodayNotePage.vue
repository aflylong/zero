<template>
  <div class="today-note-page">
    <PageHeader
      title="今日观察"
      kicker="TODAY NOTE"
      description="一句话把今天最真实的状态留下来。"
      back
      back-to="/today"
    >
      <template #actions>
        <button type="button" class="btn btn-primary btn-sm" :disabled="!dirty" @click="save">
          <Save :size="14" :stroke-width="iconStroke" />
          <span>保存</span>
        </button>
      </template>
    </PageHeader>

    <PageBody>
      <div class="today-note__frame">
        <GlassCard>
          <div class="today-note__head">
            <SectionLabel :icon="NotebookPen">今天的你,像不像那个人?</SectionLabel>
            <span class="faint-text">{{ draft.length }}/240</span>
          </div>

          <textarea
            v-model="draft"
            class="form-textarea today-note__textarea"
            maxlength="240"
            placeholder="例如:下午被分心带走过,但提醒响起时把最关键的事拉回来了。"
            @input="dirty = true"
          />

          <p class="faint-text today-note__hint">
            {{ dirty ? "有未保存修改" : "已同步到本地" }}
          </p>
        </GlassCard>
      </div>
    </PageBody>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { NotebookPen, Save } from "lucide-vue-next";
import { tokens, useAppStore } from "@guiling/core";
import PageHeader from "@/components/layout/PageHeader.vue";
import PageBody from "@/components/layout/PageBody.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import SectionLabel from "@/components/common/SectionLabel.vue";

const iconStroke = tokens.iconStrokeWidth;
const store = useAppStore();
const draft = ref(store.today.value.snapshot.todayNote);
const dirty = ref(false);

function save() {
  if (!dirty.value) return;
  store.updateTodayNote(draft.value);
  dirty.value = false;
}

onBeforeUnmount(() => save());
</script>

<style lang="scss" scoped>
.today-note-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.today-note__frame {
  max-width: 720px;
}

.today-note__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.today-note__textarea {
  min-height: 240px;
  font-size: var(--si-font-md);
  line-height: 1.65;
}

.today-note__hint {
  margin: 0;
  font-size: var(--si-font-xs);
}
</style>
