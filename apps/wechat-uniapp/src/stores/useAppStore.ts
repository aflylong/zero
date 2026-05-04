import { computed, reactive, readonly } from "vue";
import { articleSections } from "@/static/content/article";
import {
  clamp,
  buildDateTime,
  formatDateKey,
  formatDayLabel,
  formatTimeLabel,
  formatWeekday,
  getLastDateKeys,
  parseDateKey,
  shiftDateKey,
} from "@/services/date";
import { readAppStorage, writeAppStorage } from "@/services/storage";
import type {
  AppData,
  DailyPlan,
  DailySnapshot,
  IdentityProfile,
  NightReview,
  OnboardingPayload,
  RecordDetail,
  ProofRule,
  RecordDay,
  RecordSummary,
  RecordWindow,
  ReminderAction,
  ReminderPrompt,
  ReminderRule,
  VisionProfile,
} from "@/types/app";

const DEFAULT_VISION_PROFILE: VisionProfile = {
  visionText:
    "建立一个自由、有影响力、真实连接的人生。每天醒来都带着能量，完成关键行动，也把时间留给真正重要的人。",
  antiVisionText:
    "我不想继续做那个拖延、等待完美时机、让分心和恐惧接管决定的人。",
  whyChangeText:
    "因为我已经厌倦了知道很多道理却没有把自己真正活出来。我需要一个每天都会运行的系统，而不是一次性的情绪波动。",
  mainQuestTitle: "7天重塑系统",
  mainQuestDescription:
    "连续 7 天完成身份证明、白天提醒回应和夜间复盘，让改变从口号变成轨迹。",
};

const DEFAULT_IDENTITY_PROFILE: IdentityProfile = {
  statement: "我是毫不犹豫采取大量行动的人",
  antiIdentityText:
    "那个拖延、等待完美时机、让恐惧主导决定、只会谈论改变却迟迟不行动的人。",
  beliefs: [
    "行动创造清晰",
    "不适即成长",
    "我由所做之事定义，而非所想之事",
    "恐惧经常指向真正重要的东西",
    "每日小行动会累积成身份",
  ],
};

const DEFAULT_PROOF_RULES: ProofRule[] = [
  {
    id: "rule-act-fast",
    title: "决定后 5 分钟内开始行动",
    description: "别把重要的动作留给“等会儿”。",
    cadence: "daily",
    active: true,
    sortOrder: 1,
  },
  {
    id: "rule-morning-train",
    title: "在上午完成一段锻炼",
    description: "用身体状态证明你不是被惯性拖着走。",
    cadence: "daily",
    active: true,
    sortOrder: 2,
  },
  {
    id: "rule-meaningful-help",
    title: "做一件帮助他人的事",
    description: "哪怕很小，也要真实发生。",
    cadence: "daily",
    active: true,
    sortOrder: 3,
  },
  {
    id: "rule-cut-distraction",
    title: "拒绝一件明显分心的事",
    description: "把“不是现在”说出口。",
    cadence: "daily",
    active: true,
    sortOrder: 4,
  },
];

const DEFAULT_REMINDER_RULES: ReminderRule[] = [
  {
    id: "reminder-day-1",
    kind: "day",
    label: "中午对齐提醒",
    hour: 11,
    minute: 30,
    enabled: true,
    deliveryMode: "in-app",
    subscriptionStatus: "pending",
    message: "暂停 30 秒，确认你现在做的事是否像你定义的那个人。",
    snoozedUntil: null,
  },
  {
    id: "reminder-day-2",
    kind: "day",
    label: "下午纠偏提醒",
    hour: 16,
    minute: 30,
    enabled: true,
    deliveryMode: "in-app",
    subscriptionStatus: "pending",
    message: "挑一个最小但真实的修正动作，现在就做。",
    snoozedUntil: null,
  },
  {
    id: "reminder-night-1",
    kind: "night",
    label: "夜间复盘提醒",
    hour: 21,
    minute: 30,
    enabled: true,
    deliveryMode: "in-app",
    subscriptionStatus: "pending",
    message: "把今天重新整合成明天的燃料，完成你的夜间复盘。",
    snoozedUntil: null,
  },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function cloneProofRules() {
  return DEFAULT_PROOF_RULES.map((rule) => ({ ...rule }));
}

function cloneReminderRules() {
  return DEFAULT_REMINDER_RULES.map((rule) => ({ ...rule }));
}

function createDailyPlan(dateKey: string, data: AppData): DailyPlan {
  return {
    dateKey,
    focusTheme: data.identityProfile.statement,
    mainQuestTitle: data.visionProfile.mainQuestTitle,
    mainQuestDescription: data.visionProfile.mainQuestDescription,
    reminderHeadline: "今天的你，像那个人吗？",
  };
}

function createDailySnapshot(dateKey: string): DailySnapshot {
  return {
    dateKey,
    completedProofRuleIds: [],
    todayNote: "",
    alignmentScore: 0,
    reminderActions: [],
    lastUpdatedAt: nowIso(),
  };
}

function createDefaultAppData(): AppData {
  const firstSectionId = articleSections[0]?.id ?? "overview";

  return {
    onboardingCompleted: false,
    articleProgress: {
      currentSectionId: firstSectionId,
      completedSectionIds: [],
      lastOpenedAt: null,
    },
    visionProfile: { ...DEFAULT_VISION_PROFILE },
    identityProfile: {
      ...DEFAULT_IDENTITY_PROFILE,
      beliefs: [...DEFAULT_IDENTITY_PROFILE.beliefs],
    },
    proofRules: cloneProofRules(),
    reminderRules: cloneReminderRules(),
    dailyPlans: {},
    dailySnapshots: {},
    nightReviews: {},
    actionLogs: [],
  };
}

function mergeWithDefaults(input?: Partial<AppData> | null): AppData {
  const base = createDefaultAppData();
  if (!input) {
    return base;
  }

  return {
    ...base,
    ...input,
    articleProgress: {
      ...base.articleProgress,
      ...input.articleProgress,
      completedSectionIds: input.articleProgress?.completedSectionIds ?? base.articleProgress.completedSectionIds,
    },
    visionProfile: {
      ...base.visionProfile,
      ...input.visionProfile,
    },
    identityProfile: {
      ...base.identityProfile,
      ...input.identityProfile,
      beliefs: input.identityProfile?.beliefs?.length
        ? input.identityProfile.beliefs
        : base.identityProfile.beliefs,
    },
    proofRules: input.proofRules?.length ? input.proofRules : base.proofRules,
    reminderRules: input.reminderRules?.length ? input.reminderRules : base.reminderRules,
    dailyPlans: input.dailyPlans ?? base.dailyPlans,
    dailySnapshots: input.dailySnapshots ?? base.dailySnapshots,
    nightReviews: input.nightReviews ?? base.nightReviews,
    actionLogs: input.actionLogs ?? base.actionLogs,
  };
}

function sortRules(rules: ProofRule[]) {
  return [...rules].sort((left, right) => left.sortOrder - right.sortOrder);
}

const internalState = reactive({
  ready: false,
  data: createDefaultAppData(),
  activeDateKey: formatDateKey(),
  pendingReminderPrompts: [] as ReminderPrompt[],
  recordWindowEndDateKey: formatDateKey(),
});

function persist() {
  writeAppStorage(internalState.data);
}

function appendLog(type: AppData["actionLogs"][number]["type"], label: string, detail?: string, refId?: string) {
  internalState.data.actionLogs.unshift({
    id: createId("log"),
    dateKey: internalState.activeDateKey,
    createdAt: nowIso(),
    type,
    label,
    detail,
    refId,
  });
}

function ensureDay(dateKey = internalState.activeDateKey) {
  if (!internalState.data.dailyPlans[dateKey]) {
    internalState.data.dailyPlans[dateKey] = createDailyPlan(dateKey, internalState.data);
  }

  if (!internalState.data.dailySnapshots[dateKey]) {
    internalState.data.dailySnapshots[dateKey] = createDailySnapshot(dateKey);
  }

  return {
    plan: internalState.data.dailyPlans[dateKey],
    snapshot: internalState.data.dailySnapshots[dateKey],
  };
}

function getTodayDateKey() {
  return formatDateKey();
}

function clampRecordWindowEndDate(dateKey: string) {
  const todayDateKey = getTodayDateKey();
  return dateKey > todayDateKey ? todayDateKey : dateKey;
}

function getEarliestRecordDateKey() {
  const keys = new Set<string>([
    ...Object.keys(internalState.data.dailyPlans),
    ...Object.keys(internalState.data.dailySnapshots),
    ...Object.keys(internalState.data.nightReviews),
    ...internalState.data.actionLogs.map((log) => log.dateKey),
  ]);

  return [...keys].sort()[0] ?? getTodayDateKey();
}

function buildRecordDay(dateKey: string): RecordDay {
  const snapshot = internalState.data.dailySnapshots[dateKey];
  const review = internalState.data.nightReviews[dateKey];

  return {
    dateKey,
    label: formatDayLabel(dateKey),
    weekday: formatWeekday(dateKey),
    alignmentScore: snapshot?.alignmentScore ?? null,
    completedProofCount: snapshot?.completedProofRuleIds.length ?? 0,
    note: snapshot?.todayNote ?? "",
    hasNightReview: Boolean(review),
  };
}

function activeProofRules() {
  return sortRules(internalState.data.proofRules.filter((rule) => rule.active));
}

function getReminderAction(ruleId: string, dateKey = internalState.activeDateKey) {
  return internalState.data.dailySnapshots[dateKey]?.reminderActions.find(
    (item) => item.reminderId === ruleId,
  );
}

function autoAlignment(dateKey = internalState.activeDateKey) {
  const snapshot = ensureDay(dateKey).snapshot;
  const proofs = activeProofRules();
  const proofRatio = proofs.length
    ? snapshot.completedProofRuleIds.length / proofs.length
    : 1;
  const reminders = internalState.data.reminderRules.filter((rule) => rule.enabled);
  const reminderDone = reminders.length
    ? reminders.filter((rule) => getReminderAction(rule.id, dateKey)?.action === "complete").length / reminders.length
    : 1;
  const noteBonus = snapshot.todayNote.trim() ? 0.1 : 0;
  return clamp(Math.round((proofRatio * 0.7 + reminderDone * 0.2 + noteBonus) * 100), 0, 100);
}

function recalculateAlignment(dateKey = internalState.activeDateKey) {
  const snapshot = ensureDay(dateKey).snapshot;
  const reviewScore = internalState.data.nightReviews[dateKey]?.alignmentScore;
  const autoScore = autoAlignment(dateKey);
  snapshot.alignmentScore = reviewScore ? Math.round((reviewScore + autoScore) / 2) : autoScore;
  snapshot.lastUpdatedAt = nowIso();
}

function refreshReminderPrompts(now = new Date()) {
  const dateKey = formatDateKey(now);
  internalState.activeDateKey = dateKey;
  ensureDay(dateKey);

  internalState.pendingReminderPrompts = internalState.data.reminderRules
    .filter((rule) => rule.enabled)
    .filter((rule) => {
      const action = getReminderAction(rule.id, dateKey);
      if (action && action.action !== "snooze") {
        return false;
      }

      if (rule.snoozedUntil && new Date(rule.snoozedUntil).getTime() > now.getTime()) {
        return false;
      }

      const dueTime = buildDateTime(dateKey, rule.hour, rule.minute);
      return now.getTime() >= dueTime.getTime();
    })
    .map((rule) => ({
      ruleId: rule.id,
      kind: rule.kind,
      label: rule.label,
      message: rule.message,
      dueAtLabel: formatTimeLabel(rule.hour, rule.minute),
    }));
}

function initialize() {
  if (internalState.ready) {
    ensureDay(internalState.activeDateKey);
    refreshReminderPrompts();
    internalState.recordWindowEndDateKey = clampRecordWindowEndDate(internalState.recordWindowEndDateKey);
    return;
  }

  internalState.data = mergeWithDefaults(readAppStorage(createDefaultAppData()));
  internalState.activeDateKey = formatDateKey();
  internalState.recordWindowEndDateKey = internalState.activeDateKey;
  ensureDay(internalState.activeDateKey);
  recalculateAlignment(internalState.activeDateKey);
  refreshReminderPrompts();
  internalState.ready = true;
  persist();
}

function resetSnooze(ruleId: string) {
  const target = internalState.data.reminderRules.find((rule) => rule.id === ruleId);
  if (target) {
    target.snoozedUntil = null;
  }
}

function setRecordWindowEndDate(dateKey: string) {
  internalState.recordWindowEndDateKey = clampRecordWindowEndDate(dateKey);
}

function shiftRecordWindow(offsetDays: number) {
  setRecordWindowEndDate(shiftDateKey(internalState.recordWindowEndDateKey, offsetDays));
}

function completeOnboarding(payload: OnboardingPayload) {
  internalState.data.onboardingCompleted = true;
  internalState.data.visionProfile = payload.visionProfile;
  internalState.data.identityProfile = payload.identityProfile;
  internalState.data.proofRules = sortRules(payload.proofRules);
  internalState.data.reminderRules = payload.reminderRules;
  internalState.activeDateKey = formatDateKey();
  internalState.data.dailyPlans[internalState.activeDateKey] = createDailyPlan(
    internalState.activeDateKey,
    internalState.data,
  );
  internalState.data.dailySnapshots[internalState.activeDateKey] = createDailySnapshot(
    internalState.activeDateKey,
  );
  recalculateAlignment(internalState.activeDateKey);
  refreshReminderPrompts();
  persist();
}

function updateVisionProfile(patch: Partial<VisionProfile>) {
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    ...patch,
  };
  internalState.data.dailyPlans[internalState.activeDateKey] = createDailyPlan(
    internalState.activeDateKey,
    internalState.data,
  );
  persist();
}

function updateIdentityProfile(patch: Partial<IdentityProfile>) {
  internalState.data.identityProfile = {
    ...internalState.data.identityProfile,
    ...patch,
    beliefs: patch.beliefs ?? internalState.data.identityProfile.beliefs,
  };
  internalState.data.dailyPlans[internalState.activeDateKey] = createDailyPlan(
    internalState.activeDateKey,
    internalState.data,
  );
  persist();
}

function addBelief() {
  internalState.data.identityProfile.beliefs.push("新的核心信念");
  appendLog("belief-added", "新增核心信念");
  persist();
}

function updateBelief(index: number, value: string) {
  internalState.data.identityProfile.beliefs.splice(index, 1, value);
  persist();
}

function removeBelief(index: number) {
  internalState.data.identityProfile.beliefs.splice(index, 1);
  appendLog("belief-removed", "移除核心信念");
  persist();
}

function upsertProofRule(rule: ProofRule) {
  const index = internalState.data.proofRules.findIndex((item) => item.id === rule.id);
  if (index === -1) {
    internalState.data.proofRules.push(rule);
  } else {
    internalState.data.proofRules.splice(index, 1, rule);
  }
  internalState.data.proofRules = sortRules(internalState.data.proofRules);
  recalculateAlignment();
  persist();
}

function createProofRule() {
  const nextOrder =
    Math.max(0, ...internalState.data.proofRules.map((rule) => rule.sortOrder)) + 1;

  upsertProofRule({
    id: createId("rule"),
    title: "新的证明法则",
    description: "把一句模糊目标改成可验证的动作。",
    cadence: "daily",
    active: true,
    sortOrder: nextOrder,
  });
}

function removeProofRule(ruleId: string) {
  internalState.data.proofRules = internalState.data.proofRules.filter((rule) => rule.id !== ruleId);
  const snapshot = ensureDay().snapshot;
  snapshot.completedProofRuleIds = snapshot.completedProofRuleIds.filter((id) => id !== ruleId);
  recalculateAlignment();
  persist();
}

function toggleProofCompletion(ruleId: string) {
  const snapshot = ensureDay().snapshot;
  const hasRule = snapshot.completedProofRuleIds.includes(ruleId);
  snapshot.completedProofRuleIds = hasRule
    ? snapshot.completedProofRuleIds.filter((item) => item !== ruleId)
    : [...snapshot.completedProofRuleIds, ruleId];
  snapshot.lastUpdatedAt = nowIso();
  appendLog(hasRule ? "proof-reset" : "proof-complete", hasRule ? "撤销身份证明" : "完成身份证明", undefined, ruleId);
  recalculateAlignment();
  persist();
}

function updateTodayNote(note: string) {
  const snapshot = ensureDay().snapshot;
  snapshot.todayNote = note;
  snapshot.lastUpdatedAt = nowIso();
  appendLog("note-updated", "更新今日观察");
  recalculateAlignment();
  persist();
}

function updateReminderRule(ruleId: string, patch: Partial<ReminderRule>) {
  const index = internalState.data.reminderRules.findIndex((rule) => rule.id === ruleId);
  if (index === -1) {
    return;
  }

  internalState.data.reminderRules.splice(index, 1, {
    ...internalState.data.reminderRules[index],
    ...patch,
  });
  refreshReminderPrompts();
  persist();
}

function resolveReminder(ruleId: string, action: ReminderAction) {
  const dateKey = internalState.activeDateKey;
  const snapshot = ensureDay(dateKey).snapshot;
  const now = new Date();
  const actionRecord = {
    reminderId: ruleId,
    action,
    actedAt: now.toISOString(),
  };
  const existingIndex = snapshot.reminderActions.findIndex((item) => item.reminderId === ruleId);
  if (existingIndex >= 0) {
    snapshot.reminderActions.splice(existingIndex, 1, actionRecord);
  } else {
    snapshot.reminderActions.push(actionRecord);
  }

  const targetRule = internalState.data.reminderRules.find((rule) => rule.id === ruleId);
  if (targetRule) {
    targetRule.snoozedUntil =
      action === "snooze" ? new Date(now.getTime() + 30 * 60 * 1000).toISOString() : null;
  }

  appendLog(`reminder-${action}` as const, `处理提醒：${targetRule?.label ?? ruleId}`, undefined, ruleId);
  recalculateAlignment(dateKey);
  refreshReminderPrompts(now);
  persist();
}

function saveNightReview(review: Omit<NightReview, "updatedAt">) {
  internalState.data.nightReviews[review.dateKey] = {
    ...review,
    updatedAt: nowIso(),
  };
  appendLog("review-saved", "保存夜间复盘");
  recalculateAlignment(review.dateKey);
  persist();
}

function markArticleSectionRead(sectionId: string) {
  const completed = new Set(internalState.data.articleProgress.completedSectionIds);
  completed.add(sectionId);
  internalState.data.articleProgress.currentSectionId = sectionId;
  internalState.data.articleProgress.completedSectionIds = [...completed];
  internalState.data.articleProgress.lastOpenedAt = nowIso();
  persist();
}

function openArticleSection(sectionId: string) {
  internalState.data.articleProgress.currentSectionId = sectionId;
  internalState.data.articleProgress.lastOpenedAt = nowIso();
  persist();
}

function getRecordWindow(options?: {
  endDateKey?: string;
  spanDays?: number;
}): RecordWindow {
  const spanDays = options?.spanDays ?? 35;
  const endDateKey = clampRecordWindowEndDate(
    options?.endDateKey ?? internalState.recordWindowEndDateKey,
  );
  const keys = getLastDateKeys(spanDays, parseDateKey(endDateKey));
  const days = keys.map((dateKey) => buildRecordDay(dateKey));
  const earliestDateKey = getEarliestRecordDateKey();

  return {
    startDateKey: keys[0] ?? endDateKey,
    endDateKey,
    spanDays,
    days,
    hasPrevWindow: (keys[0] ?? endDateKey) > earliestDateKey,
    hasNextWindow: endDateKey < getTodayDateKey(),
  };
}

function getRecordDays(options?: {
  endDateKey?: string;
  spanDays?: number;
}) {
  return getRecordWindow(options).days;
}

function getRecordSummary(options?: {
  endDateKey?: string;
  spanDays?: number;
}): RecordSummary {
  const days = getRecordDays(options);
  const scoredDays = days.filter((day) => day.alignmentScore !== null);

  let currentStreak = 0;
  const reversed = [...days].reverse();
  for (const day of reversed) {
    if ((day.alignmentScore ?? 0) >= 60) {
      currentStreak += 1;
      continue;
    }
    break;
  }

  let bestStreak = 0;
  let streak = 0;
  for (const day of days) {
    if ((day.alignmentScore ?? 0) >= 60) {
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  return {
    currentStreak,
    bestStreak,
    averageAlignment: scoredDays.length
      ? Math.round(
          scoredDays.reduce((sum, day) => sum + (day.alignmentScore ?? 0), 0) / scoredDays.length,
        )
      : 0,
    completedDays: scoredDays.filter((day) => (day.alignmentScore ?? 0) >= 60).length,
    trackedDays: scoredDays.length,
  };
}

function getPrevRecordDate(dateKey: string) {
  const prevDateKey = shiftDateKey(dateKey, -1);
  return prevDateKey < getEarliestRecordDateKey() ? null : prevDateKey;
}

function getNextRecordDate(dateKey: string) {
  const nextDateKey = shiftDateKey(dateKey, 1);
  return nextDateKey > getTodayDateKey() ? null : nextDateKey;
}

function getRecordDetail(dateKey: string): RecordDetail {
  const snapshot = internalState.data.dailySnapshots[dateKey] ?? null;
  const review = internalState.data.nightReviews[dateKey] ?? null;
  const plan = internalState.data.dailyPlans[dateKey] ?? null;
  const completedIds = snapshot?.completedProofRuleIds ?? [];
  const reminderActions = [...(snapshot?.reminderActions ?? [])].sort((left, right) =>
    left.actedAt > right.actedAt ? -1 : 1,
  );
  const actionLogs = internalState.data.actionLogs
    .filter((log) => log.dateKey === dateKey)
    .sort((left, right) => (left.createdAt > right.createdAt ? -1 : 1));

  return {
    dateKey,
    label: formatDayLabel(dateKey),
    weekday: formatWeekday(dateKey),
    alignmentScore: snapshot?.alignmentScore ?? null,
    completedProofCount: completedIds.length,
    totalProofCount: activeProofRules().length,
    todayNote: snapshot?.todayNote ?? "",
    hasNightReview: Boolean(review),
    reminderActions,
    completedProofRuleTitles: completedIds
      .map((ruleId) => internalState.data.proofRules.find((rule) => rule.id === ruleId)?.title ?? "")
      .filter(Boolean),
    mainQuestTitle: plan?.mainQuestTitle ?? internalState.data.visionProfile.mainQuestTitle,
    mainQuestDescription:
      plan?.mainQuestDescription ?? internalState.data.visionProfile.mainQuestDescription,
    focusTheme: plan?.focusTheme ?? internalState.data.identityProfile.statement,
    winsText: review?.winsText ?? "",
    missesText: review?.missesText ?? "",
    reflectionText: review?.reflectionText ?? "",
    tomorrowFixesText: review?.tomorrowFixesText ?? "",
    actionLogs,
    lastUpdatedAt: review?.updatedAt ?? snapshot?.lastUpdatedAt ?? null,
    prevDateKey: getPrevRecordDate(dateKey),
    nextDateKey: getNextRecordDate(dateKey),
  };
}

const state = readonly(internalState);

export function useAppStore() {
  initialize();

  const today = computed(() => ensureDay(internalState.activeDateKey));
  const currentArticleSection = computed(
    () =>
      articleSections.find(
        (section) => section.id === internalState.data.articleProgress.currentSectionId,
      ) ?? articleSections[0],
  );

  return {
    state,
    today,
    currentArticleSection,
    activeProofRules,
    getRecordWindow,
    getRecordDays,
    getRecordSummary,
    getRecordDetail,
    getPrevRecordDate,
    getNextRecordDate,
    initialize,
    setRecordWindowEndDate,
    shiftRecordWindow,
    refreshReminderPrompts,
    completeOnboarding,
    updateVisionProfile,
    updateIdentityProfile,
    addBelief,
    updateBelief,
    removeBelief,
    upsertProofRule,
    createProofRule,
    removeProofRule,
    toggleProofCompletion,
    updateTodayNote,
    updateReminderRule,
    resolveReminder,
    saveNightReview,
    markArticleSectionRead,
    openArticleSection,
    resetSnooze,
  };
}
