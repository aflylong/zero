import { computed, reactive, readonly } from "vue";
import { articleSections } from "../content/article";
import {
  buildDateTime,
  clamp,
  formatDateKey,
  formatDayLabel,
  formatTimeLabel,
  formatWeekday,
  getLastDateKeys,
  parseDateKey,
  shiftDateKey,
} from "../services/date";
import { readAppStorage, writeAppStorage } from "../services/storage";
import type {
  AppData,
  DailyPlan,
  DailySnapshot,
  GoalRecord,
  GoalStatus,
  IdentityProfile,
  NightReview,
  OnboardingPayload,
  ProofRule,
  RecordDay,
  RecordDetail,
  RecordSummary,
  RecordWindow,
  ReminderAction,
  ReminderPrompt,
  ReminderRule,
  VisionProfile,
} from "../types/app";

const DEFAULT_VISION_PROFILE: VisionProfile = {
  visionText: "",
  antiVisionText: "",
  whyChangeText: "",

  yearGoal: "",
  yearGoalDescription: "",

  monthProject: "",
  monthProjectDescription: "",
  monthProjectDeadline: null,

  constraints: [],

  mainQuestTitle: "",
  mainQuestDescription: "",
};

const DEFAULT_IDENTITY_PROFILE: IdentityProfile = {
  statement: "",
  antiIdentityText: "",
  beliefs: [],
};

const DEFAULT_PROOF_RULES: ProofRule[] = [];

const DEFAULT_REMINDER_RULES: ReminderRule[] = [];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneProofRules(): ProofRule[] {
  return DEFAULT_PROOF_RULES.map((rule) => ({ ...rule }));
}

function cloneReminderRules(): ReminderRule[] {
  return DEFAULT_REMINDER_RULES.map((rule) => ({ ...rule }));
}

function createDailyPlan(dateKey: string, data: AppData): DailyPlan {
  return {
    dateKey,
    focusTheme: data.identityProfile.statement,
    mainQuestTitle: data.visionProfile.yearGoal || data.visionProfile.mainQuestTitle,
    mainQuestDescription: data.visionProfile.yearGoalDescription || data.visionProfile.mainQuestDescription,
    reminderHeadline: "你现在做的事,像不像你定义的那个人?",
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
    goalHistory: [],
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
      completedSectionIds:
        input.articleProgress?.completedSectionIds ?? base.articleProgress.completedSectionIds,
    },
    visionProfile: {
      ...base.visionProfile,
      ...input.visionProfile,
      constraints: input.visionProfile?.constraints?.length
        ? input.visionProfile.constraints
        : base.visionProfile.constraints,
      // 向后兼容:如果旧数据没有 yearGoal 但有 mainQuestTitle,映射过来
      yearGoal: input.visionProfile?.yearGoal || input.visionProfile?.mainQuestTitle || base.visionProfile.yearGoal,
      yearGoalDescription: input.visionProfile?.yearGoalDescription || input.visionProfile?.mainQuestDescription || base.visionProfile.yearGoalDescription,
      mainQuestTitle: input.visionProfile?.yearGoal || input.visionProfile?.mainQuestTitle || base.visionProfile.mainQuestTitle,
      mainQuestDescription: input.visionProfile?.yearGoalDescription || input.visionProfile?.mainQuestDescription || base.visionProfile.mainQuestDescription,
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
    goalHistory: input.goalHistory ?? base.goalHistory,
  };
}

function sortRules(rules: ProofRule[]): ProofRule[] {
  return [...rules].sort((left, right) => left.sortOrder - right.sortOrder);
}

const internalState = reactive({
  ready: false,
  data: createDefaultAppData(),
  activeDateKey: formatDateKey(),
  pendingReminderPrompts: [] as ReminderPrompt[],
  recordWindowEndDateKey: formatDateKey(),
});

function persist(): void {
  writeAppStorage(internalState.data);
}

function appendLog(
  type: AppData["actionLogs"][number]["type"],
  label: string,
  detail?: string,
  refId?: string,
): void {
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

function ensureDay(dateKey: string = internalState.activeDateKey): {
  plan: DailyPlan;
  snapshot: DailySnapshot;
} {
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

function getTodayDateKey(): string {
  return formatDateKey();
}

function clampRecordWindowEndDate(dateKey: string): string {
  const todayDateKey = getTodayDateKey();
  return dateKey > todayDateKey ? todayDateKey : dateKey;
}

function getEarliestRecordDateKey(): string {
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

function activeProofRules(): ProofRule[] {
  return sortRules(internalState.data.proofRules.filter((rule) => rule.active));
}

function getReminderAction(ruleId: string, dateKey: string = internalState.activeDateKey) {
  return internalState.data.dailySnapshots[dateKey]?.reminderActions.find(
    (item) => item.reminderId === ruleId,
  );
}

function autoAlignment(dateKey: string = internalState.activeDateKey): number {
  const snapshot = ensureDay(dateKey).snapshot;
  const proofs = activeProofRules();
  const proofRatio = proofs.length
    ? snapshot.completedProofRuleIds.length / proofs.length
    : 1;
  const reminders = internalState.data.reminderRules.filter((rule) => rule.enabled);
  const reminderDone = reminders.length
    ? reminders.filter(
        (rule) => getReminderAction(rule.id, dateKey)?.action === "complete",
      ).length / reminders.length
    : 1;
  const noteBonus = snapshot.todayNote.trim() ? 0.1 : 0;
  return clamp(Math.round((proofRatio * 0.7 + reminderDone * 0.2 + noteBonus) * 100), 0, 100);
}

function recalculateAlignment(dateKey: string = internalState.activeDateKey): void {
  const snapshot = ensureDay(dateKey).snapshot;
  const reviewScore = internalState.data.nightReviews[dateKey]?.alignmentScore;
  const autoScore = autoAlignment(dateKey);
  snapshot.alignmentScore = reviewScore ? Math.round((reviewScore + autoScore) / 2) : autoScore;
  snapshot.lastUpdatedAt = nowIso();
}

function refreshReminderPrompts(now: Date = new Date()): void {
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

function initialize(): void {
  if (internalState.ready) {
    ensureDay(internalState.activeDateKey);
    refreshReminderPrompts();
    internalState.recordWindowEndDateKey = clampRecordWindowEndDate(
      internalState.recordWindowEndDateKey,
    );
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

function resetSnooze(ruleId: string): void {
  const target = internalState.data.reminderRules.find((rule) => rule.id === ruleId);
  if (target) {
    target.snoozedUntil = null;
  }
}

function setRecordWindowEndDate(dateKey: string): void {
  internalState.recordWindowEndDateKey = clampRecordWindowEndDate(dateKey);
}

function shiftRecordWindow(offsetDays: number): void {
  setRecordWindowEndDate(shiftDateKey(internalState.recordWindowEndDateKey, offsetDays));
}

function completeOnboarding(payload: OnboardingPayload): void {
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

function updateVisionProfile(patch: Partial<VisionProfile>): void {
  const merged: VisionProfile = {
    ...internalState.data.visionProfile,
    ...patch,
  };
  // 保持 mainQuestTitle/Description 与 yearGoal 同步,确保兼容字段不漂移
  if (patch.yearGoal !== undefined) {
    merged.mainQuestTitle = patch.yearGoal;
  }
  if (patch.yearGoalDescription !== undefined) {
    merged.mainQuestDescription = patch.yearGoalDescription;
  }
  internalState.data.visionProfile = merged;
  internalState.data.dailyPlans[internalState.activeDateKey] = createDailyPlan(
    internalState.activeDateKey,
    internalState.data,
  );
  persist();
}

function addConstraint(): void {
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: [...internalState.data.visionProfile.constraints, "新的约束"],
  };
  persist();
}

function updateConstraint(index: number, value: string): void {
  const next = [...internalState.data.visionProfile.constraints];
  next.splice(index, 1, value);
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: next,
  };
  persist();
}

function removeConstraint(index: number): void {
  const next = [...internalState.data.visionProfile.constraints];
  next.splice(index, 1);
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: next,
  };
  persist();
}

function updateIdentityProfile(patch: Partial<IdentityProfile>): void {
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

function addBelief(): void {
  internalState.data.identityProfile.beliefs.push("新的核心信念");
  appendLog("belief-added", "新增核心信念");
  persist();
}

function updateBelief(index: number, value: string): void {
  internalState.data.identityProfile.beliefs.splice(index, 1, value);
  persist();
}

function removeBelief(index: number): void {
  internalState.data.identityProfile.beliefs.splice(index, 1);
  appendLog("belief-removed", "移除核心信念");
  persist();
}

function upsertProofRule(rule: ProofRule): void {
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

function createProofRule(): void {
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

function removeProofRule(ruleId: string): void {
  internalState.data.proofRules = internalState.data.proofRules.filter(
    (rule) => rule.id !== ruleId,
  );
  const snapshot = ensureDay().snapshot;
  snapshot.completedProofRuleIds = snapshot.completedProofRuleIds.filter((id) => id !== ruleId);
  recalculateAlignment();
  persist();
}

function toggleProofCompletion(ruleId: string): void {
  const snapshot = ensureDay().snapshot;
  const hasRule = snapshot.completedProofRuleIds.includes(ruleId);
  snapshot.completedProofRuleIds = hasRule
    ? snapshot.completedProofRuleIds.filter((item) => item !== ruleId)
    : [...snapshot.completedProofRuleIds, ruleId];
  snapshot.lastUpdatedAt = nowIso();
  appendLog(
    hasRule ? "proof-reset" : "proof-complete",
    hasRule ? "撤销身份证明" : "完成身份证明",
    undefined,
    ruleId,
  );
  recalculateAlignment();
  persist();
}

function updateTodayNote(note: string): void {
  const snapshot = ensureDay().snapshot;
  snapshot.todayNote = note;
  snapshot.lastUpdatedAt = nowIso();
  appendLog("note-updated", "更新今日观察");
  recalculateAlignment();
  persist();
}

function updateReminderRule(ruleId: string, patch: Partial<ReminderRule>): void {
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

function resolveReminder(ruleId: string, action: ReminderAction): void {
  const dateKey = internalState.activeDateKey;
  const snapshot = ensureDay(dateKey).snapshot;
  const now = new Date();
  const actionRecord = {
    reminderId: ruleId,
    action,
    actedAt: now.toISOString(),
  };
  const existingIndex = snapshot.reminderActions.findIndex(
    (item) => item.reminderId === ruleId,
  );
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

  appendLog(
    `reminder-${action}` as const,
    `处理提醒:${targetRule?.label ?? ruleId}`,
    undefined,
    ruleId,
  );
  recalculateAlignment(dateKey);
  refreshReminderPrompts(now);
  persist();
}

function saveNightReview(review: Omit<NightReview, "updatedAt">): void {
  internalState.data.nightReviews[review.dateKey] = {
    ...review,
    updatedAt: nowIso(),
  };
  appendLog("review-saved", "保存夜间复盘");
  recalculateAlignment(review.dateKey);
  persist();
}

function markArticleSectionRead(sectionId: string): void {
  const completed = new Set(internalState.data.articleProgress.completedSectionIds);
  completed.add(sectionId);
  internalState.data.articleProgress.currentSectionId = sectionId;
  internalState.data.articleProgress.completedSectionIds = [...completed];
  internalState.data.articleProgress.lastOpenedAt = nowIso();
  persist();
}

function openArticleSection(sectionId: string): void {
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

function getRecordDays(options?: { endDateKey?: string; spanDays?: number }): RecordDay[] {
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
          scoredDays.reduce((sum, day) => sum + (day.alignmentScore ?? 0), 0) /
            scoredDays.length,
        )
      : 0,
    completedDays: scoredDays.filter((day) => (day.alignmentScore ?? 0) >= 60).length,
    trackedDays: scoredDays.length,
  };
}

function getPrevRecordDate(dateKey: string): string | null {
  const prevDateKey = shiftDateKey(dateKey, -1);
  return prevDateKey < getEarliestRecordDateKey() ? null : prevDateKey;
}

function getNextRecordDate(dateKey: string): string | null {
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
      .map(
        (ruleId) =>
          internalState.data.proofRules.find((rule) => rule.id === ruleId)?.title ?? "",
      )
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

function endGoal(
  type: "year" | "month",
  status: GoalStatus,
  reflection: string,
): void {
  const profile = internalState.data.visionProfile;
  const title = type === "year" ? profile.yearGoal : profile.monthProject;
  const description = type === "year" ? profile.yearGoalDescription : profile.monthProjectDescription;

  if (!title.trim()) return;

  const record: GoalRecord = {
    id: createId("goal"),
    type,
    title,
    description,
    createdAt: internalState.data.goalHistory.find(
      (g) => g.type === type && g.status === "active",
    )?.createdAt ?? nowIso(),
    endedAt: nowIso(),
    status,
    reflection,
  };

  internalState.data.goalHistory.unshift(record);

  // 清空当前目标字段
  if (type === "year") {
    internalState.data.visionProfile = {
      ...internalState.data.visionProfile,
      yearGoal: "",
      yearGoalDescription: "",
      mainQuestTitle: "",
      mainQuestDescription: "",
    };
  } else {
    internalState.data.visionProfile = {
      ...internalState.data.visionProfile,
      monthProject: "",
      monthProjectDescription: "",
      monthProjectDeadline: null,
    };
  }

  appendLog(
    `goal-${status}` as AppData["actionLogs"][number]["type"],
    `${type === "year" ? "一年目标" : "一月项目"}:${title}`,
    reflection,
    record.id,
  );
  persist();
}

function getGoalHistory(type?: "year" | "month"): GoalRecord[] {
  if (!type) return internalState.data.goalHistory;
  return internalState.data.goalHistory.filter((g) => g.type === type);
}

function exportData(): AppData {
  return JSON.parse(JSON.stringify(internalState.data)) as AppData;
}

function importData(next: Partial<AppData>): void {
  internalState.data = mergeWithDefaults(next);
  internalState.activeDateKey = formatDateKey();
  internalState.recordWindowEndDateKey = internalState.activeDateKey;
  ensureDay(internalState.activeDateKey);
  recalculateAlignment(internalState.activeDateKey);
  refreshReminderPrompts();
  persist();
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
    addConstraint,
    updateConstraint,
    removeConstraint,
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
    exportData,
    importData,
    endGoal,
    getGoalHistory,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
