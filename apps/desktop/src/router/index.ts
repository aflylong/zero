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
import PrivacyPage from "@/pages/PrivacyPage.vue";
import JourneyMorningPage from "@/pages/JourneyMorningPage.vue";
import JourneyDayPage from "@/pages/JourneyDayPage.vue";
import JourneyNightPage from "@/pages/JourneyNightPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/today" },
  { path: "/welcome", name: "welcome", component: WelcomePage },
  { path: "/onboarding", name: "onboarding", component: OnboardingPage },

  // 一天流程(原文 Part 1 / 2 / 3)
  { path: "/journey/morning", name: "journey-morning", component: JourneyMorningPage },
  { path: "/journey/day", name: "journey-day", component: JourneyDayPage },
  { path: "/journey/night", name: "journey-night", component: JourneyNightPage },

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
  { path: "/settings/privacy", name: "privacy", component: PrivacyPage },

  { path: "/:pathMatch(.*)*", redirect: "/today" },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/**
 * 软引导而非硬封锁:
 *   首次启动(没填过 onboarding 也没启动过 journey)→ 跳到 welcome,让用户选;
 *   一旦用户做过任何一种(填过 onboarding 或 跑过 journey),不再被 welcome 拦截;
 *   不再像旧版那样"未完成 onboarding 时只能停在 welcome / onboarding / article-reader"。
 */
router.beforeEach((to) => {
  const store = useAppStore();
  const data = store.state.data;
  const ever =
    data.onboardingCompleted ||
    data.journeyCompleted ||
    Boolean(data.morningExcavation.startedAt);

  if (!ever && to.name !== "welcome" && to.name !== "onboarding" &&
      to.name !== "article-reader" && to.name !== "privacy" &&
      !String(to.name ?? "").startsWith("journey")) {
    return { name: "welcome" };
  }

  if (ever && to.name === "welcome") {
    return { name: "today" };
  }

  return true;
});
