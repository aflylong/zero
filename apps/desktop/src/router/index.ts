import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { useAppStore } from "@guiling/core";

import WelcomePage from "@/pages/WelcomePage.vue";
import TodayPage from "@/pages/TodayPage.vue";
import PathPage from "@/pages/PathPage.vue";
import RecordsPage from "@/pages/RecordsPage.vue";
import IdentityPage from "@/pages/IdentityPage.vue";
import OnboardingPage from "@/pages/OnboardingPage.vue";
import TodayNotePage from "@/pages/TodayNotePage.vue";
import NightReviewPage from "@/pages/NightReviewPage.vue";
import ReminderSettingsPage from "@/pages/ReminderSettingsPage.vue";
import PathEditorPage from "@/pages/PathEditorPage.vue";
import IdentityEditorPage from "@/pages/IdentityEditorPage.vue";
import ArticleReaderPage from "@/pages/ArticleReaderPage.vue";
import RecordDetailPage from "@/pages/RecordDetailPage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/today" },
  { path: "/welcome", name: "welcome", component: WelcomePage },
  { path: "/onboarding", name: "onboarding", component: OnboardingPage },

  { path: "/today", name: "today", component: TodayPage, meta: { tab: "today" } },
  { path: "/today/note", name: "today-note", component: TodayNotePage },
  { path: "/today/review", name: "night-review", component: NightReviewPage },
  { path: "/today/reminders", name: "reminder-settings", component: ReminderSettingsPage },

  { path: "/path", name: "path", component: PathPage, meta: { tab: "path" } },
  { path: "/path/edit", name: "path-editor", component: PathEditorPage },
  { path: "/path/article", name: "article-reader", component: ArticleReaderPage },

  { path: "/records", name: "records", component: RecordsPage, meta: { tab: "records" } },
  { path: "/records/:dateKey", name: "record-detail", component: RecordDetailPage, props: true },

  { path: "/identity", name: "identity", component: IdentityPage, meta: { tab: "identity" } },
  { path: "/identity/edit", name: "identity-editor", component: IdentityEditorPage },

  { path: "/settings", name: "settings", component: SettingsPage },

  { path: "/:pathMatch(.*)*", redirect: "/today" },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 首次进入(未完成 onboarding)时,自动跳到 Welcome 页。
// 已完成 onboarding 的用户直接进 Today,不会再看到 Welcome。
router.beforeEach((to) => {
  const store = useAppStore();
  const completed = store.state.data.onboardingCompleted;

  // 未完成 onboarding 时,只允许访问 welcome / onboarding / article-reader
  if (
    !completed &&
    to.name !== "welcome" &&
    to.name !== "onboarding" &&
    to.name !== "article-reader"
  ) {
    return { name: "welcome" };
  }

  // 已完成 onboarding 时,不再显示 welcome
  if (completed && to.name === "welcome") {
    return { name: "today" };
  }

  return true;
});
