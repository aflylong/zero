<template>
  <PageShell
    title="今日观察"
    topbar-mode="secondary"
    back-url="/pages/today/index"
    :back-action="handleBack"
    compact
  >
    <view class="today-note-page">
      <view class="today-note-hero">
        <SectionLabel>一句话观察</SectionLabel>
        <text class="today-note-hero__title">把今天最真实的状态留下来。</text>
        <text class="muted-text">
          这不是长日记，只要一句足够诚实的话。它会影响今日页摘要、夜间复盘语境和记录详情。
        </text>
      </view>

      <GlassCard card-class="today-note-card">
        <view class="today-note-card__head">
          <text class="today-note-card__title">今天的你，像那个人吗？</text>
          <text class="today-note-card__count">{{ draft.length }}/240</text>
        </view>

        <textarea
          class="textarea-shell today-note-card__textarea"
          :value="draft"
          maxlength="240"
          placeholder="例如：下午还是被分心带走了，但我至少在提醒出现后把最关键的事重新拉回来。"
          @input="handleInput"
        />

        <text class="today-note-card__hint">
          {{ dirty ? "有未保存修改" : "当前内容已同步到本地存储" }}
        </text>
      </GlassCard>
    </view>

    <template #footer>
      <view class="today-note-footer">
        <button class="ghost-button today-note-footer__button" @tap="saveNote">
          先保存
        </button>
        <button class="pill-button today-note-footer__button" @tap="handleBack">
          保存并返回
        </button>
      </view>
    </template>
  </PageShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import GlassCard from "@/components/GlassCard.vue";
import PageShell from "@/components/PageShell.vue";
import SectionLabel from "@/components/SectionLabel.vue";
import { useAppStore } from "@/stores/useAppStore";

type UniValueEvent = Event & {
  detail?: {
    value?: string;
  };
};

const store = useAppStore();
const draft = ref("");
const dirty = ref(false);

function hydrate() {
  draft.value = store.today.value.snapshot.todayNote;
  dirty.value = false;
}

function handleInput(event: UniValueEvent) {
  draft.value = event.detail?.value ?? "";
  dirty.value = true;
}

function saveNote(showToast = true) {
  if (!dirty.value) {
    return;
  }

  store.updateTodayNote(draft.value);
  dirty.value = false;

  if (showToast) {
    uni.showToast({
      title: "已保存",
      icon: "success",
    });
  }
}

function handleBack() {
  saveNote(false);
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }

  uni.reLaunch({ url: "/pages/today/index" });
}

onShow(() => {
  store.initialize();
  if (!dirty.value) {
    hydrate();
  }
});

onHide(() => {
  saveNote(false);
});
</script>

<style scoped lang="scss">
.today-note-page,
.today-note-hero,
.today-note-card {
  display: flex;
  flex-direction: column;
}

.today-note-page {
  gap: 24rpx;
}

.today-note-hero,
.today-note-card {
  gap: 18rpx;
}

.today-note-hero__title,
.today-note-card__title {
  color: #f5f5f5;
  font-size: 34rpx;
  line-height: 1.42;
}

.today-note-card__head {
  display: flex;
  gap: 20rpx;
  align-items: center;
  justify-content: space-between;
}

.today-note-card__count,
.today-note-card__hint {
  color: #71717a;
  font-size: 22rpx;
  line-height: 1.5;
}

.today-note-card__textarea {
  min-height: 340rpx;
}

.today-note-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.today-note-footer__button {
  justify-content: center;
}
</style>
