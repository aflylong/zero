import { computed, reactive, readonly } from "vue";
import { articleSections } from "@/static/content/article";
import { findDayPrompt } from "@/static/content/dayPrompts";
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
} from "@/services/date";
import { readAppStorage, writeAppStorage } from "@/services/storage";
import type {
  ActionLog,
  AppData,
  DailyPlan,
  DailySnapshot,
  DayPromptResponse,
  GoalRecord,
  GoalStatus,
  IdentityProfile,
  IdentityStage,
  MorningExcavation,
  NightSynthesis,
  NotificationPreferences,
  OnboardingPayload,
  ProofRule,
  RecordDay,
  RecordDetail,
  RecordSummary,
  RecordWindow,
  ReminderAction,
  ReminderPrompt,
  ReminderRule,
  TomorrowBlock,
  VisionProfile,
} from "@/types/app";

const DEFAULT_VISION_PROFILE: VisionProfile = {
  visionText: "",
  antiVisionText: "",

  fiveYearTuesday: "",
  tenYearTuesday: "",
  endOfLife: "",
  threeYearTuesday: "",
  oneThingThisWeek: "",

  yearGoal: "",
  yearGoalDescription: "",

  monthProject: "",
  monthProjectDescription: "",
  monthProjectDeadline: null,

  constraints: [],
};

const DEFAULT_IDENTITY_PROFILE: IdentityProfile = {
  statement: "",
  antiIdentityText: "",
  principles: [],
  stage: "dissonance",
};

const DEFAULT_MORNING_EXCAVATION: MorningExcavation = {
  startedAt: null,
  excavationCompletedAt: null,
  completedAt: null,
  responses: {},
  currentQuestionKey: "q1",
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  desktopNotification: false,
  sound: true,
  soundVolume: 70,
  focusWindow: false,
  inAppBanner: true,
};

function createEmptyNightSynthesis(dateKey: string): NightSynthesis {
  return {
    dateKey,
    stuckReason: "",
    enemyName: "",
    antiVisionMantra: "",
    visionMantra: "",
    yearLens: "",
    monthLens: "",
    tomorrowBlocks: [],
    updatedAt: nowIso(),
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildHeadline(data: AppData): string {
  const stage = data.identityProfile.stage;
  if (!data.journeyCompleted && !data.morningExcavation.startedAt) {
    return "今天就开始那 22 题,把当前生活看清楚。";
  }
  if (stage === "dissonance") return "失调阶段:对当前生活厌倦本身就是动力。";
  if (stage === "uncertainty") return "不确定阶段:实验比正确更重要。";
  if (stage === "discovery") return "发现阶段:做那个你已经看清楚的小动作。";
  return "你现在做的事,像不像你定义的那个人?";
}

function createDailyPlan(dateKey: string, data: AppData): DailyPlan {
  return {
    dateKey,
    focusTheme: data.identityProfile.statement,
    yearGoalTitle: data.visionProfile.yearGoal,
    yearGoalDescription: data.visionProfile.yearGoalDescription,
    reminderHeadline: buildHeadline(data),
  };
}

function createDailySnapshot(dateKey: string): DailySnapshot {
  return {
    dateKey,
    completedProofRuleIds: [],
    todayNote: "",
    alignmentScore: 0,
    reminderActions: [],
    dayPromptResponses: [],
    notifiedReminderIds: [],
    lastUpdatedAt: nowIso(),
  };
}

function createDefaultAppData(): AppData {
  const firstSectionId = articleSections[0]?.id ?? "overview";

  return {
    onboardingCompleted: false,
    journeyCompleted: false,
    articleProgress: {
      currentSectionId: firstSectionId,
      completedSectionIds: [],
      lastOpenedAt: null,
      notes: {},
    },
    morningExcavation: { ...DEFAULT_MORNING_EXCAVATION, responses: {} },
    nightSynthesisByDate: {},
    visionProfile: { ...DEFAULT_VISION_PROFILE },
    identityProfile: {
      ...DEFAULT_IDENTITY_PROFILE,
      principles: [...DEFAULT_IDENTITY_PROFILE.principles],
    },
    proofRules: [],
    reminderRules: [],
    dailyPlans: {},
    dailySnapshots: {},
    actionLogs: [],
    goalHistory: [],
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFS },
  };
}

/** 旧版本数据迁移 */
type LegacyVisionPatch = Partial<VisionProfile> & {
  mainQuestTitle?: string;
  mainQuestDescription?: string;
  whyChangeText?: string;
};

type LegacyIdentityPatch = Partial<IdentityProfile> & {
  beliefs?: string[];
};

type LegacyAppDataPatch = Partial<AppData> & {
  visionProfile?: LegacyVisionPatch;
  identityProfile?: LegacyIdentityPatch;
  nightReviews?: Record<string, unknown>;
};

function mergeWithDefaults(input?: LegacyAppDataPatch | null): AppData {
  const base = createDefaultAppData();
  if (!input) return base;

  const inIdentity = input.identityProfile;
  const principles =
    inIdentity?.principles && inIdentity.principles.length
      ? inIdentity.principles
      : inIdentity?.beliefs && inIdentity.beliefs.length
        ? [...inIdentity.beliefs]
        : base.identityProfile.principles;

  const inVision = input.visionProfile;
  const yearGoal = inVision?.yearGoal ?? inVision?.mainQuestTitle ?? base.visionProfile.yearGoal;
  const yearGoalDescription =
    inVision?.yearGoalDescription ??
    inVision?.mainQuestDescription ??
    base.visionProfile.yearGoalDescription;

  const mergedVision: VisionProfile = {
    ...base.visionProfile,
    ...inVision,
    yearGoal,
    yearGoalDescription,
    constraints: inVision?.constraints?.length
      ? inVision.constraints
      : base.visionProfile.constraints,
  };
  const visionAny = mergedVision as unknown as Record<string, unknown>;
  delete visionAny.mainQuestTitle;
  delete visionAny.mainQuestDescription;
  delete visionAny.whyChangeText;

  // commute 题旧版本 hour/minute 都是 0,0.3.0 起改成可触发,这里做一次兜底
  const COMMUTE_DEFAULTS: Record<string, [number, number]> = {
    "w1-commute": [6, 50],
    "w2-commute": [12, 30],
    "w3-commute": [19, 0],
  };
  const reminderRules = ((input.reminderRules?.length
    ? input.reminderRules
    : base.reminderRules) as ReminderRule[]).map((r) => {
    const next = { ...r } as ReminderRule;
    if (next.kind === "commute" && next.hour === 0 && next.minute === 0 && next.promptKey) {
      const def = COMMUTE_DEFAULTS[next.promptKey];
      if (def) {
        next.hour = def[0];
        next.minute = def[1];
      }
    }
    return next;
  });

  const dailyPlans: Record<string, DailyPlan> = {};
  for (const [k, v] of Object.entries(input.dailyPlans ?? {})) {
    const old = v as unknown as Record<string, unknown>;
    dailyPlans[k] = {
      dateKey: (old.dateKey as string) ?? k,
      focusTheme: (old.focusTheme as string) ?? "",
      yearGoalTitle:
        (old.yearGoalTitle as string) ??
        (old.mainQuestTitle as string) ??
        yearGoal,
      yearGoalDescription:
        (old.yearGoalDescription as string) ??
        (old.mainQuestDescription as string) ??
        yearGoalDescription,
      reminderHeadline:
        (old.reminderHeadline as string) ??
        buildHeadline({
          ...base,
          visionProfile: mergedVision,
          identityProfile: { ...base.identityProfile, principles, stage: inIdentity?.stage ?? base.identityProfile.stage },
          morningExcavation: { ...base.morningExcavation, ...input.morningExcavation },
          journeyCompleted: input.journeyCompleted ?? false,
        } as AppData),
    };
  }

  return {
    ...base,
    onboardingCompleted: input.onboardingCompleted ?? base.onboardingCompleted,
    journeyCompleted: input.journeyCompleted ?? base.journeyCompleted,
    articleProgress: {
      ...base.articleProgress,
      ...input.articleProgress,
      completedSectionIds:
        input.articleProgress?.completedSectionIds ??
        base.articleProgress.completedSectionIds,
      notes: input.articleProgress?.notes ?? base.articleProgress.notes,
    },
    morningExcavation: {
      ...base.morningExcavation,
      ...input.morningExcavation,
      responses: input.morningExcavation?.responses ?? base.morningExcavation.responses,
    },
    nightSynthesisByDate: input.nightSynthesisByDate ?? base.nightSynthesisByDate,
    visionProfile: mergedVision,
    identityProfile: {
      ...base.identityProfile,
      ...inIdentity,
      principles,
      stage: inIdentity?.stage ?? base.identityProfile.stage,
    },
    proofRules: input.proofRules?.length ? input.proofRules : base.proofRules,
    reminderRules,
    dailyPlans,
    dailySnapshots: input.dailySnapshots ?? base.dailySnapshots,
    actionLogs: input.actionLogs ?? base.actionLogs,
    goalHistory: input.goalHistory ?? base.goalHistory,
    notificationPreferences: {
      ...base.notificationPreferences,
      ...input.notificationPreferences,
    },
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

function persist() {
  writeAppStorage(internalState.data);
}

function appendLog(
  type: ActionLog["type"],
  label: string,
  detail?: string,
  refId?: string,
) {
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
  } else {
    const snap = internalState.data.dailySnapshots[dateKey];
    if (!snap.dayPromptResponses) snap.dayPromptResponses = [];
    if (!snap.notifiedReminderIds) snap.notifiedReminderIds = [];
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
    ...Object.keys(internalState.data.nightSynthesisByDate ?? {}),
    ...internalState.data.actionLogs.map((log) => log.dateKey),
  ]);
  return [...keys].sort()[0] ?? getTodayDateKey();
}

function buildRecordDay(dateKey: string): RecordDay {
  const snapshot = internalState.data.dailySnapshots[dateKey];
  const synthesis = internalState.data.nightSynthesisByDate?.[dateKey];
  return {
    dateKey,
    label: formatDayLabel(dateKey),
    weekday: formatWeekday(dateKey),
    alignmentScore: snapshot?.alignmentScore ?? null,
    completedProofCount: snapshot?.completedProofRuleIds.length ?? 0,
    note: snapshot?.todayNote ?? "",
    hasNightReview: Boolean(synthesis),
  };
}

function activeProofRules(): ProofRule[] {
  return sortRules(internalState.data.proofRules.filter((rule) => rule.active));
}

function getReminderAction(ruleId: string, dateKey = internalState.activeDateKey) {
  return internalState.data.dailySnapshots[dateKey]?.reminderActions.find(
    (item) => item.reminderId === ruleId,
  );
}

function autoAlignment(dateKey = internalState.activeDateKey): number {
  const snapshot = ensureDay(dateKey).snapshot;
  const proofs = activeProofRules();
  const proofRatio = proofs.length
    ? snapshot.completedProofRuleIds.length / proofs.length
    : 1;
  const reminders = internalState.data.reminderRules.filter((rule) => rule.enabled);
  const seen = reminders.length
    ? reminders.filter((rule) => {
        const action = getReminderAction(rule.id, dateKey);
        return action?.action === "complete" || action?.action === "skip";
      }).length / reminders.length
    : 1;
  const noteBonus = snapshot.todayNote.trim() ? 0.1 : 0;
  const synthesis = internalState.data.nightSynthesisByDate?.[dateKey];
  const synthesisBonus =
    synthesis &&
    (synthesis.stuckReason || synthesis.enemyName || synthesis.visionMantra)
      ? 0.1
      : 0;
  return clamp(
    Math.round((proofRatio * 0.5 + seen * 0.3 + noteBonus + synthesisBonus) * 100),
    0,
    100,
  );
}

function recalculateAlignment(dateKey = internalState.activeDateKey) {
  const snapshot = ensureDay(dateKey).snapshot;
  snapshot.alignmentScore = autoAlignment(dateKey);
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
      if (action && action.action !== "snooze") return false;
      if (rule.snoozedUntil && new Date(rule.snoozedUntil).getTime() > now.getTime()) {
        return false;
      }
      // 所有 reminder 都按 hour/minute 触发(包括 commute);
      // 用户不想被通勤题打扰可以在「提醒设置」里把它们关掉。
      const dueTime = buildDateTime(dateKey, rule.hour, rule.minute);
      return now.getTime() >= dueTime.getTime();
    })
    .map((rule) => {
      const dp = rule.promptKey ? findDayPrompt(rule.promptKey) : null;
      return {
        ruleId: rule.id,
        kind: rule.kind,
        label: rule.label,
        message: rule.message,
        question: dp?.question ?? rule.message,
        promptKey: rule.promptKey ?? "",
        dueAtLabel: formatTimeLabel(rule.hour, rule.minute),
      };
    });
}

function initialize() {
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

function resetSnooze(ruleId: string) {
  const target = internalState.data.reminderRules.find((rule) => rule.id === ruleId);
  if (target) target.snoozedUntil = null;
}

function setRecordWindowEndDate(dateKey: string) {
  internalState.recordWindowEndDateKey = clampRecordWindowEndDate(dateKey);
}

function shiftRecordWindow(offsetDays: number) {
  setRecordWindowEndDate(shiftDateKey(internalState.recordWindowEndDateKey, offsetDays));
}

function rebuildDailyPlanForToday() {
  internalState.data.dailyPlans[internalState.activeDateKey] = createDailyPlan(
    internalState.activeDateKey,
    internalState.data,
  );
}

function completeOnboarding(payload: OnboardingPayload) {
  internalState.data.onboardingCompleted = true;
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    ...payload.visionProfile,
  };
  internalState.data.identityProfile = {
    ...internalState.data.identityProfile,
    ...payload.identityProfile,
  };
  internalState.data.proofRules = sortRules(payload.proofRules);
  internalState.data.reminderRules = payload.reminderRules;
  internalState.activeDateKey = formatDateKey();
  rebuildDailyPlanForToday();
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
  rebuildDailyPlanForToday();
  persist();
}

function addConstraint() {
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: [...internalState.data.visionProfile.constraints, "新的约束"],
  };
  persist();
}

function updateConstraint(index: number, value: string) {
  const next = [...internalState.data.visionProfile.constraints];
  next.splice(index, 1, value);
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: next,
  };
  persist();
}

function removeConstraint(index: number) {
  const next = [...internalState.data.visionProfile.constraints];
  next.splice(index, 1);
  internalState.data.visionProfile = {
    ...internalState.data.visionProfile,
    constraints: next,
  };
  persist();
}

function updateIdentityProfile(patch: Partial<IdentityProfile>) {
  internalState.data.identityProfile = {
    ...internalState.data.identityProfile,
    ...patch,
    principles: patch.principles ?? internalState.data.identityProfile.principles,
  };
  rebuildDailyPlanForToday();
  persist();
}

function setIdentityStage(stage: IdentityStage) {
  internalState.data.identityProfile.stage = stage;
  rebuildDailyPlanForToday();
  persist();
}

function addPrinciple() {
  internalState.data.identityProfile.principles.push("新的原则");
  appendLog("principle-added", "新增原则");
  persist();
}

function updatePrinciple(index: number, value: string) {
  internalState.data.identityProfile.principles.splice(index, 1, value);
  persist();
}

function removePrinciple(index: number) {
  internalState.data.identityProfile.principles.splice(index, 1);
  appendLog("principle-removed", "移除原则");
  persist();
}

function upsertProofRule(rule: ProofRule) {
  const index = internalState.data.proofRules.findIndex((item) => item.id === rule.id);
  const enriched: ProofRule = { ...rule, createdAt: rule.createdAt ?? nowIso() };
  if (index === -1) internalState.data.proofRules.push(enriched);
  else internalState.data.proofRules.splice(index, 1, enriched);
  internalState.data.proofRules = sortRules(internalState.data.proofRules);
  recalculateAlignment();
  persist();
}

function createProofRule() {
  const nextOrder =
    Math.max(0, ...internalState.data.proofRules.map((rule) => rule.sortOrder)) + 1;
  upsertProofRule({
    id: createId("rule"),
    title: "新的每日动作",
    description: "把一句模糊目标改成可验证的动作。",
    cadence: "daily",
    active: true,
    sortOrder: nextOrder,
    createdAt: nowIso(),
  });
}

function removeProofRule(ruleId: string) {
  internalState.data.proofRules = internalState.data.proofRules.filter(
    (rule) => rule.id !== ruleId,
  );
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
  appendLog(
    hasRule ? "proof-reset" : "proof-complete",
    hasRule ? "撤销动作完成" : "完成今日动作",
    undefined,
    ruleId,
  );
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
  if (index === -1) return;
  internalState.data.reminderRules.splice(index, 1, {
    ...internalState.data.reminderRules[index],
    ...patch,
  });
  refreshReminderPrompts();
  persist();
}

function createReminderRule(seed: Partial<ReminderRule>): ReminderRule {
  const rule: ReminderRule = {
    id: seed.id ?? createId("reminder"),
    kind: seed.kind ?? "day",
    promptKey: seed.promptKey,
    label: seed.label ?? "新的提醒",
    hour: seed.hour ?? 11,
    minute: seed.minute ?? 0,
    enabled: seed.enabled ?? true,
    deliveryMode: seed.deliveryMode ?? "in-app",
    subscriptionStatus: seed.subscriptionStatus ?? "pending",
    message: seed.message ?? "",
    snoozedUntil: null,
  };
  internalState.data.reminderRules = [...internalState.data.reminderRules, rule];
  refreshReminderPrompts();
  persist();
  return rule;
}

function removeReminderRule(ruleId: string) {
  internalState.data.reminderRules = internalState.data.reminderRules.filter(
    (r) => r.id !== ruleId,
  );
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
  const existingIndex = snapshot.reminderActions.findIndex(
    (item) => item.reminderId === ruleId,
  );
  if (existingIndex >= 0) snapshot.reminderActions.splice(existingIndex, 1, actionRecord);
  else snapshot.reminderActions.push(actionRecord);

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

function answerDayPrompt(promptKey: string, answer: string) {
  const dateKey = internalState.activeDateKey;
  const snapshot = ensureDay(dateKey).snapshot;
  const now = nowIso();
  const next: DayPromptResponse = {
    promptKey,
    answer: answer.trim(),
    answeredAt: now,
  };
  const idx = snapshot.dayPromptResponses.findIndex((r) => r.promptKey === promptKey);
  if (idx >= 0) snapshot.dayPromptResponses.splice(idx, 1, next);
  else snapshot.dayPromptResponses.push(next);
  snapshot.lastUpdatedAt = now;
  appendLog("day-prompt-answered", `回答 ${promptKey}`, answer.slice(0, 60), promptKey);
  recalculateAlignment(dateKey);
  persist();
}

function markReminderNotified(ruleId: string, dateKey = internalState.activeDateKey): boolean {
  const snapshot = ensureDay(dateKey).snapshot;
  if (snapshot.notifiedReminderIds.includes(ruleId)) return false;
  snapshot.notifiedReminderIds.push(ruleId);
  snapshot.lastUpdatedAt = nowIso();
  persist();
  return true;
}

function hasReminderBeenNotified(ruleId: string, dateKey = internalState.activeDateKey): boolean {
  const snap = internalState.data.dailySnapshots[dateKey];
  return Boolean(snap?.notifiedReminderIds?.includes(ruleId));
}

// —— Morning Excavation ——
function ensureExcavationStarted() {
  if (!internalState.data.morningExcavation.startedAt) {
    internalState.data.morningExcavation.startedAt = nowIso();
    persist();
  }
}

function updateExcavationResponse(key: string, value: string) {
  ensureExcavationStarted();
  const ex = internalState.data.morningExcavation;
  ex.responses = { ...ex.responses, [key]: value };
  ex.currentQuestionKey = key;

  switch (key) {
    case "q5":
      updateVisionProfile({ fiveYearTuesday: value });
      break;
    case "q6":
      updateVisionProfile({ tenYearTuesday: value });
      break;
    case "q7":
      updateVisionProfile({ endOfLife: value });
      break;
    case "q9":
      updateIdentityProfile({ antiIdentityText: value });
      break;
    case "q12":
      updateVisionProfile({ threeYearTuesday: value });
      break;
    case "q13":
      updateIdentityProfile({ statement: value });
      break;
    case "q14":
      updateVisionProfile({ oneThingThisWeek: value });
      break;
    default:
      break;
  }

  if (key === "q5" || key === "q6" || key === "q7") {
    const v = internalState.data.visionProfile;
    if (!v.antiVisionText.trim()) {
      const pieces = [v.fiveYearTuesday, v.tenYearTuesday, v.endOfLife]
        .map((s) => s.trim())
        .filter(Boolean);
      if (pieces.length >= 2) {
        updateVisionProfile({ antiVisionText: pieces.join("\n\n") });
      }
    }
  }
  if (key === "q12" || key === "q14") {
    const v = internalState.data.visionProfile;
    if (!v.visionText.trim() && v.threeYearTuesday.trim()) {
      updateVisionProfile({ visionText: v.threeYearTuesday });
    }
  }

  const has = (k: string) => Boolean(ex.responses[k]?.trim());
  const excavationKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11"];
  if (!ex.excavationCompletedAt && excavationKeys.every(has)) {
    ex.excavationCompletedAt = nowIso();
    appendLog("excavation-saved", "完成早晨开掘 11 题");
  }
  const allKeys = [...excavationKeys, "q12", "q13", "q14", "q15"];
  if (!ex.completedAt && allKeys.every(has)) {
    ex.completedAt = nowIso();
    internalState.data.journeyCompleted = true;
    if (internalState.data.identityProfile.stage === "dissonance") {
      internalState.data.identityProfile.stage = "uncertainty";
    }
    appendLog("excavation-saved", "完成早晨流程 15 题");
  }
  rebuildDailyPlanForToday();
  persist();
}

function setExcavationCurrent(key: string) {
  internalState.data.morningExcavation.currentQuestionKey = key;
  persist();
}

// —— Night Synthesis ——
function getNightSynthesis(dateKey = internalState.activeDateKey): NightSynthesis {
  const map = internalState.data.nightSynthesisByDate ?? {};
  return map[dateKey] ?? createEmptyNightSynthesis(dateKey);
}

function saveNightSynthesis(synthesis: NightSynthesis) {
  if (!internalState.data.nightSynthesisByDate) {
    internalState.data.nightSynthesisByDate = {};
  }
  internalState.data.nightSynthesisByDate[synthesis.dateKey] = {
    ...synthesis,
    updatedAt: nowIso(),
  };

  if (synthesis.antiVisionMantra.trim()) {
    const cur = internalState.data.visionProfile.antiVisionText;
    const mantra = `「${synthesis.antiVisionMantra.trim()}」`;
    if (!cur.startsWith(mantra)) {
      updateVisionProfile({ antiVisionText: cur ? `${mantra}\n\n${cur}` : mantra });
    }
  }
  if (synthesis.visionMantra.trim()) {
    const cur = internalState.data.visionProfile.visionText;
    const mantra = `「${synthesis.visionMantra.trim()}」`;
    if (!cur.startsWith(mantra)) {
      updateVisionProfile({ visionText: cur ? `${mantra}\n\n${cur}` : mantra });
    }
  }
  if (synthesis.yearLens.trim() && !internalState.data.visionProfile.yearGoal.trim()) {
    updateVisionProfile({ yearGoal: synthesis.yearLens });
  }
  if (synthesis.monthLens.trim() && !internalState.data.visionProfile.monthProject.trim()) {
    updateVisionProfile({ monthProject: synthesis.monthLens });
  }

  if (
    synthesis.stuckReason.trim() &&
    synthesis.enemyName.trim() &&
    synthesis.visionMantra.trim() &&
    synthesis.yearLens.trim() &&
    internalState.data.identityProfile.stage !== "discovery"
  ) {
    internalState.data.identityProfile.stage = "discovery";
    rebuildDailyPlanForToday();
  }

  appendLog("synthesis-saved", "保存晚上回顾");
  recalculateAlignment(synthesis.dateKey);
  persist();
}

function promoteTomorrowBlocks(dateKey = internalState.activeDateKey): number {
  const synthesis = internalState.data.nightSynthesisByDate?.[dateKey];
  if (!synthesis) return 0;
  let promoted = 0;
  let order = Math.max(0, ...internalState.data.proofRules.map((r) => r.sortOrder));
  const updatedBlocks: TomorrowBlock[] = synthesis.tomorrowBlocks.map((block) => {
    if (block.promotedToProofRule || !block.title.trim()) return block;
    order += 1;
    upsertProofRule({
      id: createId("rule"),
      title: block.title.trim(),
      description: block.timeHint.trim() ? `时间段:${block.timeHint.trim()}` : "",
      cadence: "daily",
      active: true,
      sortOrder: order,
      fromTomorrowBlockId: block.id,
      createdAt: nowIso(),
    });
    promoted += 1;
    return { ...block, promotedToProofRule: true };
  });
  if (promoted > 0) {
    internalState.data.nightSynthesisByDate[dateKey] = {
      ...synthesis,
      tomorrowBlocks: updatedBlocks,
      updatedAt: nowIso(),
    };
    appendLog("tomorrow-block-promoted", `把 ${promoted} 件明天要做的事加进了「每日动作」`);
    persist();
  }
  return promoted;
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

function updateArticleNote(sectionId: string, note: string) {
  if (!internalState.data.articleProgress.notes) {
    internalState.data.articleProgress.notes = {};
  }
  internalState.data.articleProgress.notes[sectionId] = note;
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
  const hasEvidence = (d: RecordDay) =>
    (d.alignmentScore ?? 0) > 0 ||
    Boolean(d.note?.trim()) ||
    d.completedProofCount > 0 ||
    d.hasNightReview;
  const scoredDays = days.filter((day) => day.alignmentScore !== null);

  let currentStreak = 0;
  const reversed = [...days].reverse();
  for (const day of reversed) {
    if (hasEvidence(day)) {
      currentStreak += 1;
      continue;
    }
    break;
  }
  let bestStreak = 0;
  let streak = 0;
  for (const day of days) {
    if (hasEvidence(day)) {
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
    completedDays: days.filter(hasEvidence).length,
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
  const synthesis = internalState.data.nightSynthesisByDate?.[dateKey] ?? null;
  const plan = internalState.data.dailyPlans[dateKey] ?? null;
  const completedIds = snapshot?.completedProofRuleIds ?? [];
  const reminderActions = [...(snapshot?.reminderActions ?? [])].sort((left, right) =>
    left.actedAt > right.actedAt ? -1 : 1,
  );
  const dayPromptResponses = [...(snapshot?.dayPromptResponses ?? [])].sort((l, r) =>
    l.answeredAt > r.answeredAt ? -1 : 1,
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
    hasNightReview: Boolean(synthesis),
    reminderActions,
    dayPromptResponses,
    completedProofRuleTitles: completedIds
      .map(
        (ruleId) =>
          internalState.data.proofRules.find((rule) => rule.id === ruleId)?.title ?? "",
      )
      .filter(Boolean),
    yearGoalTitle: plan?.yearGoalTitle ?? internalState.data.visionProfile.yearGoal,
    yearGoalDescription:
      plan?.yearGoalDescription ?? internalState.data.visionProfile.yearGoalDescription,
    focusTheme: plan?.focusTheme ?? internalState.data.identityProfile.statement,
    synthesis,
    actionLogs,
    lastUpdatedAt: synthesis?.updatedAt ?? snapshot?.lastUpdatedAt ?? null,
    prevDateKey: getPrevRecordDate(dateKey),
    nextDateKey: getNextRecordDate(dateKey),
  };
}

function endGoal(type: "year" | "month", status: GoalStatus, reflection: string): void {
  const profile = internalState.data.visionProfile;
  const title = type === "year" ? profile.yearGoal : profile.monthProject;
  const description =
    type === "year" ? profile.yearGoalDescription : profile.monthProjectDescription;
  if (!title.trim()) return;

  const record: GoalRecord = {
    id: createId("goal"),
    type,
    title,
    description,
    createdAt:
      internalState.data.goalHistory.find((g) => g.type === type && g.status === "active")
        ?.createdAt ?? nowIso(),
    endedAt: nowIso(),
    status,
    reflection,
  };
  internalState.data.goalHistory.unshift(record);

  if (type === "year") {
    internalState.data.visionProfile = {
      ...internalState.data.visionProfile,
      yearGoal: "",
      yearGoalDescription: "",
    };
  } else {
    internalState.data.visionProfile = {
      ...internalState.data.visionProfile,
      monthProject: "",
      monthProjectDescription: "",
      monthProjectDeadline: null,
    };
  }
  rebuildDailyPlanForToday();
  appendLog(
    `goal-${status}` as ActionLog["type"],
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

function updateNotificationPreferences(patch: Partial<NotificationPreferences>) {
  internalState.data.notificationPreferences = {
    ...internalState.data.notificationPreferences,
    ...patch,
  };
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
    setIdentityStage,
    addPrinciple,
    updatePrinciple,
    removePrinciple,
    upsertProofRule,
    createProofRule,
    removeProofRule,
    toggleProofCompletion,
    updateTodayNote,
    updateReminderRule,
    createReminderRule,
    removeReminderRule,
    resolveReminder,
    answerDayPrompt,
    markReminderNotified,
    hasReminderBeenNotified,
    saveNightSynthesis,
    getNightSynthesis,
    promoteTomorrowBlocks,
    updateExcavationResponse,
    setExcavationCurrent,
    markArticleSectionRead,
    openArticleSection,
    updateArticleNote,
    resetSnooze,
    endGoal,
    getGoalHistory,
    updateNotificationPreferences,
  };
}
