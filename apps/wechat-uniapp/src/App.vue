<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAppStore } from "@/stores/useAppStore";

const store = useAppStore();

onLaunch(() => {
  store.initialize();
});

onShow(() => {
  store.refreshReminderPrompts();
});

onHide(() => {
  store.refreshReminderPrompts();
});
</script>
<style lang="scss">
@use "@/styles/theme.scss";
</style>
